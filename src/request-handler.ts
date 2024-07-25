/* eslint-disable @typescript-eslint/no-explicit-any */

// 3rd party libs
import { applyMagic, MagicalClass } from 'js-magic';

// Shared Modules
import { RequestErrorHandler } from './request-error-handler';

// Types
import type {
  RequestResponse,
  ErrorHandlingStrategy,
  RequestHandlerConfig,
  EndpointConfig,
  RequestError,
  FetcherInstance,
  FetcherStaticInstance,
  Method,
  NativeFetch,
  EndpointConfigHeaders,
} from './types/http-request';

/**
 * Generic Request Handler
 * It creates an Request Fetcher instance and handles requests within that instance
 * It handles errors depending on a chosen error handling strategy
 */
@applyMagic
export class RequestHandler implements MagicalClass {
  /**
   * @var requestInstance Provider's instance
   */
  public requestInstance: FetcherInstance;

  /**
   * @var timeout Request timeout
   */
  public timeout: number = 30000;

  /**
   * @var cancellable Response cancellation
   */
  public cancellable: boolean = false;

  /**
   * @var strategy Request timeout
   */
  public strategy: ErrorHandlingStrategy = 'reject';

  /**
   * @var flattenResponse Response flattening
   */
  public flattenResponse: boolean = true;

  /**
   * @var defaultResponse Response flattening
   */
  public defaultResponse: any = null;

  /**
   * @var fetcher Request Fetcher instance
   */
  protected fetcher: FetcherStaticInstance;

  /**
   * @var logger Logger
   */
  protected logger: any;

  /**
   * @var requestErrorService HTTP error service
   */
  protected requestErrorService: any;

  /**
   * @var requestsQueue    Queue of requests
   */
  protected requestsQueue: Map<string, AbortController>;

  /**
   * Creates an instance of HttpRequestHandler
   *
   * @param {string} config.fetcher              Request Fetcher instance
   * @param {string} config.baseURL              Base URL for all API calls
   * @param {number} config.timeout              Request timeout
   * @param {string} config.strategy             Error Handling Strategy
   * @param {string} config.flattenResponse      Whether to flatten response "data" object within "data" one
   * @param {*} config.logger                    Instance of Logger Class
   * @param {*} config.requestErrorService       Instance of Error Service Class
   */
  public constructor({
    fetcher = null,
    baseURL = '',
    timeout = null,
    cancellable = false,
    strategy = null,
    flattenResponse = null,
    defaultResponse = {},
    logger = null,
    onError = null,
    ...config
  }: RequestHandlerConfig) {
    this.fetcher = fetcher;
    this.timeout =
      timeout !== null && timeout !== undefined ? timeout : this.timeout;
    this.strategy =
      strategy !== null && strategy !== undefined ? strategy : this.strategy;
    this.cancellable = cancellable || this.cancellable;
    this.flattenResponse =
      flattenResponse !== null && flattenResponse !== undefined
        ? flattenResponse
        : this.flattenResponse;
    this.defaultResponse = defaultResponse;
    this.logger = logger || (globalThis ? globalThis.console : null) || null;
    this.requestErrorService = onError;
    this.requestsQueue = new Map();

    this.requestInstance = this.isCustomFetcher()
      ? fetcher.create({
          ...config,
          baseURL: baseURL || config.apiUrl || '',
          timeout: this.timeout,
        })
      : globalThis.fetch;
  }

  /**
   * Get Provider Instance
   *
   * @returns {FetcherInstance} Provider's instance
   */
  public getInstance(): FetcherInstance {
    return this.requestInstance;
  }

  /**
   * Maps all API request types
   *
   * @throws {RequestError} If request fails
   * @returns {Promise} Response data or error
   */
  public __get(prop: string) {
    if (prop in this) {
      return this[prop];
    }

    return this.handleRequest.bind(this, prop);
  }

  /**
   * Appends query parameters to the given URL
   *
   * @param {string} url - The base URL to which query parameters will be appended.
   * @param {Record<string, any>} params - An instance of URLSearchParams containing the query parameters to append.
   * @returns {string} - The URL with the appended query parameters.
   */
  public appendQueryParams(url: string, params: Record<string, any>): string {
    // We don't use URLSearchParams here as we want to ensure that arrays are properly converted similarily to Axios
    // So { foo: [1, 2] } would become: foo[]=1&foo[]=2
    const queryString = Object.entries(params)
      .flatMap(([key, value]) => {
        if (Array.isArray(value)) {
          return value.map(
            (val) => `${encodeURIComponent(key)}[]=${encodeURIComponent(val)}`,
          );
        }
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      })
      .join('&');

    return url.includes('?')
      ? `${url}&${queryString}`
      : queryString
        ? `${url}?${queryString}`
        : url;
  }

  /**
   * Checks if a value is JSON serializable.
   *
   * JSON serializable values include:
   * - Primitive types: string, number, boolean, null
   * - Arrays
   * - Plain objects (i.e., objects without special methods)
   * - Values with a `toJSON` method
   *
   * @param {any} value - The value to check for JSON serializability.
   * @returns {boolean} - Returns `true` if the value is JSON serializable, otherwise `false`.
   */
  protected isJSONSerializable(value: any): boolean {
    if (value === undefined || value === null) {
      return false;
    }

    const t = typeof value;
    if (t === 'string' || t === 'number' || t === 'boolean') {
      return true;
    }

    if (t !== 'object') {
      return false; // bigint, function, symbol, undefined
    }

    if (Array.isArray(value)) {
      return true;
    }

    if (Buffer.isBuffer(value)) {
      return false;
    }

    if (value instanceof Date) {
      return false;
    }

    const proto = Object.getPrototypeOf(value);

    // Check if the prototype is `Object.prototype` or `null` (plain object)
    if (proto === Object.prototype || proto === null) {
      return true;
    }

    // Check if the object has a toJSON method
    if (typeof value.toJSON === 'function') {
      return true;
    }

    return false;
  }

  /**
   * Build request configuration
   *
   * @param {string} method               Request method
   * @param {string} url                  Request url
   * @param {*}      data                 Request data
   * @param {EndpointConfig} config       Request config
   * @returns {EndpointConfig}            Provider's instance
   */
  protected buildRequestConfig(
    method: Method,
    url: string,
    data: any,
    config: EndpointConfig,
  ): EndpointConfig {
    const methodLowerCase = method.toLowerCase();
    const isGetAlikeMethod =
      methodLowerCase === 'get' || methodLowerCase === 'head';

    // Axios compatibility
    if (this.isCustomFetcher()) {
      return {
        ...config,
        url,
        method: methodLowerCase,

        ...(isGetAlikeMethod ? { params: data } : {}),

        // For POST requests body payload is the first param for convenience ("data")
        // In edge cases we want to split so to treat it as query params, and use "body" coming from the config instead
        ...(!isGetAlikeMethod && data && config.data ? { params: data } : {}),

        // Only applicable for request methods 'PUT', 'POST', 'DELETE', and 'PATCH'
        ...(!isGetAlikeMethod && data && !config.data ? { data } : {}),
        ...(!isGetAlikeMethod && config.data ? { data: config.data } : {}),
      };
    }

    // Native fetch

    // Axios uses different property. Add a quick check.
    const payload = config.body || config.data || data;

    delete config.data;

    return {
      ...config,

      // Native fetch generally requires query params to be appended in the URL
      // Do not append query params only if it's a POST-alike request with only "data" specified as it's treated as body payload
      url:
        (!isGetAlikeMethod && data && !config.body) || !data
          ? url
          : this.appendQueryParams(url, data),

      // Uppercase method name
      method: method.toUpperCase(),

      // For convenience, add the same default headers as Axios does
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json;charset=utf-8',
        ...(config.headers || {}),
      } as EndpointConfigHeaders,

      // Automatically JSON stringify request bodies, if possible and when not dealing with strings
      ...(!isGetAlikeMethod
        ? {
            body: this.isJSONSerializable(payload)
              ? typeof payload === 'string'
                ? payload
                : JSON.stringify(payload)
              : payload,
          }
        : {}),
    };
  }

  /**
   * Process global Request Error
   *
   * @param {RequestError} error      Error instance
   * @param {EndpointConfig} requestConfig   Per endpoint request config
   * @returns {void}
   */
  protected processRequestError(
    error: RequestError,
    requestConfig: EndpointConfig,
  ): void {
    if (this.isRequestCancelled(error)) {
      return;
    }

    // Invoke per request "onError" call
    if (requestConfig.onError && typeof requestConfig.onError === 'function') {
      requestConfig.onError(error);
    }

    const errorHandler = new RequestErrorHandler(
      this.logger,
      this.requestErrorService,
    );

    errorHandler.process(error);
  }

  /**
   * Output default response in case of an error, depending on chosen strategy
   *
   * @param {RequestError} error      Error instance
   * @param {EndpointConfig} requestConfig   Per endpoint request config
   * @returns {*} Error response
   */
  protected async outputErrorResponse(
    error: RequestError,
    requestConfig: EndpointConfig,
  ): Promise<RequestResponse> {
    const isRequestCancelled = this.isRequestCancelled(error);
    const errorHandlingStrategy = requestConfig.strategy || this.strategy;

    // By default cancelled requests aren't rejected
    if (isRequestCancelled && !requestConfig.rejectCancelled) {
      return this.defaultResponse;
    }

    if (errorHandlingStrategy === 'silent') {
      // Hang the promise
      await new Promise(() => null);

      return this.defaultResponse;
    }

    // Simply rejects a request promise
    if (
      errorHandlingStrategy === 'reject' ||
      errorHandlingStrategy === 'throwError'
    ) {
      return Promise.reject(error);
    }

    return this.defaultResponse;
  }

  /**
   * Output error response depending on chosen strategy
   *
   * @param {RequestError} error               Error instance
   * @returns {boolean}                        True if request is aborted
   */
  public isRequestCancelled(error: RequestError): boolean {
    return error.name === 'AbortError' || error.name === 'CanceledError';
  }

  /**
   * Detects if a custom fetcher is utilized
   *
   * @returns {boolean}                        True if it's a custom fetcher
   */
  protected isCustomFetcher(): boolean {
    return this.fetcher !== null;
  }

  /**
   * Automatically Cancel Previous Requests using AbortController when "cancellable" is defined
   *
   * @param {EndpointConfig} requestConfig   Per endpoint request config
   * @returns {Object} Controller Signal to abort
   */
  protected addCancellationToken(
    requestConfig: EndpointConfig,
  ): Partial<Record<'signal', AbortSignal>> {
    // Both disabled
    if (!this.cancellable && !requestConfig.cancellable) {
      return {};
    }

    // Explicitly disabled per request
    if (
      typeof requestConfig.cancellable !== 'undefined' &&
      !requestConfig.cancellable
    ) {
      return {};
    }

    // Check if AbortController is available
    if (typeof AbortController === 'undefined') {
      console.error('AbortController is unavailable.');

      return {};
    }

    const { method, baseURL, url, params, data } = requestConfig;

    // Generate unique key as a cancellation token. Make sure it fits Map
    const key = JSON.stringify([method, baseURL, url, params, data]).substring(
      0,
      55 ** 5,
    );
    const previousRequest = this.requestsQueue.get(key);

    if (previousRequest) {
      previousRequest.abort();
    }

    const controller = new AbortController();

    // Introduce timeout for native fetch
    if (!this.isCustomFetcher()) {
      const abortTimeout = setTimeout(() => {
        const error = new Error(
          `[TimeoutError]: The ${url} request was aborted due to timeout`,
        );

        error.name = 'TimeoutError';
        (error as any).code = 23; // DOMException.TIMEOUT_ERR
        controller.abort(error);
        clearTimeout(abortTimeout);
      }, requestConfig.timeout || this.timeout);
    }
    this.requestsQueue.set(key, controller);

    return {
      signal: controller.signal,
    };
  }

  /**
   * Handle Request depending on used strategy
   *
   * @param {object} payload                      Payload
   * @param {string} payload.type                 Request type
   * @param {string} payload.url                  Request url
   * @param {*} payload.data                      Request data
   * @param {EndpointConfig} payload.config       Request config
   * @throws {RequestError}
   * @returns {Promise} Response Data
   */
  public async handleRequest(
    type: Method,
    url: string,
    data: unknown = null,
    config: EndpointConfig = null,
  ): Promise<RequestResponse> {
    let response = null;
    const endpointConfig = config || {};
    let requestConfig = this.buildRequestConfig(
      type,
      url,
      data,
      endpointConfig,
    );

    requestConfig = {
      ...this.addCancellationToken(requestConfig),
      ...requestConfig,
    };

    try {
      // Axios compatibility
      if (this.isCustomFetcher()) {
        response = await (this.requestInstance as any).request(requestConfig);
      } else {
        // Native fetch
        response = await (this.requestInstance as NativeFetch)(
          url,
          requestConfig,
        );

        // Check if the response status is not outside the range 200-299
        if (response.ok) {
          // Parse and return the JSON response
          response = await response.json();
        } else {
          const error = new Error(`HTTP error! Status: ${response.status}`);

          // Attach the response object to the error for further inspection
          (error as any).response = response;

          throw error;
        }
      }
    } catch (error) {
      this.processRequestError(error, requestConfig);

      return this.outputErrorResponse(error, requestConfig);
    }

    return this.processResponseData(response);
  }

  /**
   * Process response
   *
   * @param response Response object
   * @returns {*} Response data
   */
  protected processResponseData(response) {
    if (response.data) {
      if (!this.flattenResponse) {
        return response;
      }

      // Special case of only data property within response data object (happens in Axios)
      // This is in fact a proper response but we may want to flatten it
      // To ease developers' lives when obtaining the response
      if (
        typeof response.data === 'object' &&
        typeof response.data.data !== 'undefined' &&
        Object.keys(response.data).length === 1
      ) {
        return response.data.data;
      }

      return response.data;
    }

    return this.defaultResponse;
  }
}
