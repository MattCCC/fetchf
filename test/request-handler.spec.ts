/* eslint-disable @typescript-eslint/no-explicit-any */
import { createRequestHandler } from '../src/request-handler';
import fetchMock from 'fetch-mock';
import { applyInterceptor } from '../src/interceptor-manager';
import { delayInvocation } from '../src/utils';
import type { RequestHandlerReturnType } from '../src/types/request-handler';
import { fetchf } from '../src';
import { ABORT_ERROR } from '../src/const';

jest.mock('../src/interceptor-manager', () => ({
  applyInterceptor: jest.fn().mockImplementation(async (response) => response),
}));

jest.mock('../src/utils', () => {
  const originalModule = jest.requireActual('../src/utils');

  return {
    ...originalModule,
    delayInvocation: jest.fn(),
  };
});

const fetcher = {
  create: jest.fn().mockReturnValue({ request: jest.fn() }),
};

describe('Request Handler', () => {
  const apiUrl = 'http://example.com/api/';
  const responseMock = {
    data: {
      test: 'data',
    },
  };

  console.warn = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach((done) => {
    done();
  });

  it('should get request instance', () => {
    const requestHandler = createRequestHandler({ fetcher });

    const response = requestHandler.getInstance();

    expect(response).toBeTruthy();
  });

  describe('buildConfig() with native fetch()', () => {
    let requestHandler: RequestHandlerReturnType | null = null;
    const headers = {
      Accept: 'application/json, text/plain, */*',
      'Accept-Encoding': 'gzip, deflate, br',
      'Content-Type': 'application/json;charset=utf-8',
    };

    beforeAll(() => {
      requestHandler = createRequestHandler({});
    });

    const buildConfig = (method: string, url: string, data: any, config: any) =>
      (requestHandler as any).buildConfig(url, data, {
        ...config,
        method,
      });

    it('should not differ when the same request is made', () => {
      const result = buildConfig(
        'GET',
        'https://example.com/api',
        { foo: 'bar' },
        { baseURL: 'abc' },
      );

      const result2 = buildConfig(
        'GET',
        'https://example.com/api',
        { foo: 'bar' },
        { baseURL: 'abc' },
      );

      expect(result).toEqual(result2);
    });

    it('should handle GET requests correctly', () => {
      const result = buildConfig(
        'GET',
        'https://example.com/api',
        { foo: 'bar' },
        {
          headers,
        },
      );

      expect(result).toEqual({
        url: 'https://example.com/api?foo=bar',
        method: 'GET',
        headers,
      });
    });

    it('should handle POST requests correctly', () => {
      const result = buildConfig(
        'POST',
        'https://example.com/api',
        { foo: 'bar' },
        {
          headers,
        },
      );

      expect(result).toEqual({
        url: 'https://example.com/api',
        method: 'POST',
        headers,
        body: JSON.stringify({ foo: 'bar' }),
      });
    });

    it('should handle PUT requests correctly', () => {
      const result = buildConfig(
        'PUT',
        'https://example.com/api',
        { foo: 'bar' },
        {
          headers,
        },
      );

      expect(result).toEqual({
        url: 'https://example.com/api',
        method: 'PUT',
        headers,
        body: JSON.stringify({ foo: 'bar' }),
      });
    });

    it('should handle DELETE requests correctly', () => {
      const result = buildConfig(
        'DELETE',
        'https://example.com/api',
        { foo: 'bar' },
        {
          headers,
        },
      );

      expect(result).toEqual({
        url: 'https://example.com/api',
        method: 'DELETE',
        headers,
        body: JSON.stringify({ foo: 'bar' }),
      });
    });

    it('should handle custom headers and config when both data and query params are passed', () => {
      const result = buildConfig(
        'POST',
        'https://example.com/api',
        { foo: 'bar' },
        {
          headers: { 'X-CustomHeader': 'Some token' },
          data: { additional: 'info' },
        },
      );

      expect(result).toEqual({
        url: 'https://example.com/api?foo=bar',
        method: 'POST',
        headers: {
          'X-CustomHeader': 'Some token',
        },
        body: JSON.stringify({ additional: 'info' }),
      });
    });

    it('should handle empty data and config', () => {
      const result = buildConfig('POST', 'https://example.com/api', null, {});

      expect(result).toEqual({
        url: 'https://example.com/api',
        method: 'POST',
        body: null,
      });
    });

    it('should handle data as string', () => {
      const result = buildConfig(
        'POST',
        'https://example.com/api',
        'rawData',
        {},
      );

      expect(result).toEqual({
        url: 'https://example.com/api',
        method: 'POST',
        body: 'rawData',
      });
    });

    it('should correctly append query params for GET-alike methods', () => {
      const result = buildConfig(
        'head',
        'https://example.com/api',
        { foo: [1, 2] },
        {},
      );

      expect(result).toEqual({
        url: 'https://example.com/api?foo[]=1&foo[]=2',
        method: 'HEAD',
      });
    });

    it('should handle POST with query params in config', () => {
      const result = buildConfig(
        'POST',
        'https://example.com/api',
        { foo: 'bar' },
        { data: { additional: 'info' } },
      );

      expect(result).toEqual({
        url: 'https://example.com/api?foo=bar',
        method: 'POST',
        body: JSON.stringify({ additional: 'info' }),
      });
    });

    it('should append credentials if flag is used', () => {
      const result = buildConfig('POST', 'https://example.com/api', null, {
        withCredentials: true,
      });

      expect(result).toEqual({
        url: 'https://example.com/api',
        method: 'POST',
        credentials: 'include',
        body: null,
      });
    });

    it('should not append query params to POST requests if body is set as data', () => {
      const result = buildConfig(
        'POST',
        'https://example.com/api',
        {
          foo: 'bar',
        },
        {},
      );

      expect(result).toEqual({
        url: 'https://example.com/api',
        method: 'POST',
        body: JSON.stringify({ foo: 'bar' }),
      });
    });

    it('should not append body nor data to GET requests', () => {
      const result = buildConfig(
        'GET',
        'https://example.com/api',
        { foo: 'bar' },
        { body: { additional: 'info' }, data: { additional: 'info' } },
      );

      expect(result).toEqual({
        url: 'https://example.com/api?foo=bar',
        method: 'GET',
      });
    });
  });

  describe('request()', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      globalThis.fetch = jest.fn();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should properly hang promise when using Silent strategy', async () => {
      const requestHandler = createRequestHandler({
        fetcher,
        strategy: 'silent',
      });

      (requestHandler.getInstance() as any).request = jest
        .fn()
        .mockRejectedValue(new Error('Request Failed'));

      const request = requestHandler.request(apiUrl);

      const timeout = new Promise((resolve) => {
        const wait = setTimeout(() => {
          clearTimeout(wait);

          resolve('timeout');
        }, 2000);
      });

      jest.advanceTimersByTime(2000);

      expect(typeof request.then).toBe('function');

      const response = await Promise.any([request, timeout]);

      expect(response).toBe('timeout');
    });

    it('should reject promise when using rejection strategy', async () => {
      const requestHandler = createRequestHandler({
        fetcher,
        strategy: 'reject',
      });

      (requestHandler.getInstance() as any).request = jest
        .fn()
        .mockRejectedValue(new Error('Request Failed'));

      try {
        const response = await (requestHandler as any).delete(apiUrl);
        expect(response).toBe(undefined);
      } catch (error) {
        expect(typeof error).toBe('object');
      }
    });

    it('should reject promise when using reject strategy per endpoint', async () => {
      const requestHandler = createRequestHandler({
        fetcher,
        strategy: 'silent',
      });

      (requestHandler.getInstance() as any).request = jest
        .fn()
        .mockRejectedValue(new Error('Request Failed'));

      try {
        await requestHandler.request(apiUrl, null, {
          strategy: 'reject',
        });
      } catch (error) {
        expect(typeof error).toBe('object');
      }
    });
  });

  describe('request() Polling Mechanism', () => {
    const baseURL = 'https://api.example.com';
    const mockLogger = { warn: jest.fn() };

    beforeEach(() => {
      jest.useFakeTimers();
      jest.clearAllMocks();
      globalThis.fetch = jest.fn();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should poll the specified number of times until shouldStopPolling returns true', async () => {
      // Setup polling configuration
      const pollingConfig = {
        pollingInterval: 100,
        shouldStopPolling: jest.fn((_response, pollingAttempt) => {
          // Stop polling after 3 attempts
          return pollingAttempt >= 3;
        }),
      };

      // Initialize RequestHandler with polling configuration
      const requestHandler = createRequestHandler({
        baseURL,
        retry: {
          retries: 0, // No retries for this test
        },
        ...pollingConfig,
        logger: mockLogger,
      });

      // Mock fetch to return a successful response every time
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        clone: jest.fn().mockReturnValue({}),
        json: jest.fn().mockResolvedValue({}),
      });

      const mockDelayInvocation = delayInvocation as jest.MockedFunction<
        typeof delayInvocation
      >;

      mockDelayInvocation.mockResolvedValue(true);

      // Make the request
      await requestHandler.request('/endpoint');

      // Advance timers to cover the polling interval
      jest.advanceTimersByTime(300); // pollingInterval * 3

      // Ensure polling stopped after 3 attempts
      expect(pollingConfig.shouldStopPolling).toHaveBeenCalledTimes(4);
      expect(globalThis.fetch).toHaveBeenCalledTimes(4); // 1 initial + 3 polls

      // Ensure delay function was called for each polling attempt
      expect(mockDelayInvocation).toHaveBeenCalledTimes(3);
      expect(mockDelayInvocation).toHaveBeenCalledWith(
        pollingConfig.pollingInterval,
      );
    });

    it('should not poll if pollingInterval is not provided', async () => {
      // Setup without polling configuration
      const requestHandler = createRequestHandler({
        baseURL,
        retry: {
          retries: 0, // No retries for this test
        },
        pollingInterval: 0, // No polling
        logger: mockLogger,
      });

      // Mock fetch to return a successful response
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        clone: jest.fn().mockReturnValue({}),
        json: jest.fn().mockResolvedValue({}),
      });

      await requestHandler.request('/endpoint');

      // Ensure fetch was only called once
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);

      // Ensure polling was not attempted
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    it('should stop polling on error and not proceed with polling attempts', async () => {
      // Setup polling configuration
      const pollingConfig = {
        pollingInterval: 100,
        shouldStopPolling: jest.fn(() => false), // Always continue polling if no errors
      };

      const requestHandler = createRequestHandler({
        baseURL,
        retry: {
          retries: 0, // No retries for this test
        },
        ...pollingConfig,
        logger: mockLogger,
      });

      // Mock fetch to fail
      (globalThis.fetch as any).mockRejectedValue({
        status: 500,
        json: jest.fn().mockResolvedValue({}),
      });

      const mockDelayInvocation = delayInvocation as jest.MockedFunction<
        typeof delayInvocation
      >;

      mockDelayInvocation.mockResolvedValue(true);

      await expect(requestHandler.request('/endpoint')).rejects.toEqual({
        status: 500,
        json: expect.any(Function),
      });

      // Ensure fetch was called once (no polling due to error)
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);

      // Ensure polling was not attempted after failure
      expect(mockDelayInvocation).toHaveBeenCalledTimes(0);

      // Ensure we process the error
      expect(mockLogger.warn).toHaveBeenCalled();
    });

    it('should log polling attempts and delays', async () => {
      // Setup polling configuration
      const pollingConfig = {
        pollingInterval: 100,
        shouldStopPolling: jest.fn((_response, pollingAttempt) => {
          // Stop polling after 3 attempts
          return pollingAttempt >= 3;
        }),
      };

      const requestHandler = createRequestHandler({
        baseURL,
        retry: {
          retries: 0, // No retries for this test
        },
        ...pollingConfig,
        logger: mockLogger,
      });

      // Mock fetch to return a successful response
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        clone: jest.fn().mockReturnValue({}),
        json: jest.fn().mockResolvedValue({}),
      });

      await requestHandler.request('/endpoint');

      // Advance timers to cover polling interval
      jest.advanceTimersByTime(300); // pollingInterval * 3

      // Check if polling was logged properly
      expect(mockLogger.warn).toHaveBeenCalledWith('Polling attempt 1...');
      expect(mockLogger.warn).toHaveBeenCalledWith('Polling attempt 2...');
      expect(mockLogger.warn).toHaveBeenCalledWith('Polling attempt 3...');
    });

    it('should not poll if shouldStopPolling returns true immediately', async () => {
      // Setup polling configuration
      const pollingConfig = {
        pollingInterval: 100,
        shouldStopPolling: jest.fn(() => true), // Stop immediately
      };

      const requestHandler = createRequestHandler({
        baseURL,
        retry: {
          retries: 0, // No retries for this test
        },
        ...pollingConfig,
        logger: mockLogger,
      });

      // Mock fetch to return a successful response
      (globalThis.fetch as any).mockResolvedValue({
        ok: true,
        clone: jest.fn().mockReturnValue({}),
        json: jest.fn().mockResolvedValue({}),
      });

      await requestHandler.request('/endpoint');

      // Ensure fetch was only called once
      expect(globalThis.fetch).toHaveBeenCalledTimes(1);

      // Ensure polling was skipped
      expect(pollingConfig.shouldStopPolling).toHaveBeenCalledTimes(1);
    });
  });

  describe('request() Retry Mechanism', () => {
    const baseURL = 'https://api.example.com';
    const mockLogger = { warn: jest.fn() };

    beforeEach(() => {
      jest.useFakeTimers();
      jest.clearAllMocks();
      globalThis.fetch = jest.fn();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should succeed if the request eventually succeeds after retries', async () => {
      // Setup retry configuration
      const retryConfig = {
        retries: 3, // Number of retry attempts
        delay: 100, // Initial delay in ms
        maxDelay: 50000, // Maximum delay in ms
        backoff: 1.5, // Backoff factor
        retryOn: [500], // HTTP status codes to retry on
        shouldRetry: jest.fn(() => Promise.resolve(true)), // Always retry
      };

      // Initialize RequestHandler with mock configuration
      const requestHandler = createRequestHandler({
        baseURL,
        retry: retryConfig,
        logger: mockLogger,
        onError: jest.fn(),
      });

      // Mock fetch to fail twice and then succeed
      let callCount = 0;
      (globalThis.fetch as any).mockImplementation(() => {
        callCount++;
        if (callCount <= retryConfig.retries) {
          return Promise.reject({
            status: 500,
            json: jest.fn().mockResolvedValue({}),
          });
        }
        return Promise.resolve({
          ok: true,
          clone: jest.fn().mockReturnValue({}),
          json: jest.fn().mockResolvedValue({}),
        });
      });

      const mockDelayInvocation = delayInvocation as jest.MockedFunction<
        typeof delayInvocation
      >;

      mockDelayInvocation.mockResolvedValue(true);

      // Make the request
      await expect(requestHandler.request('/endpoint')).resolves.not.toThrow();

      // Advance timers to cover the delay period
      const totalDelay =
        retryConfig.delay +
        retryConfig.delay * retryConfig.backoff +
        retryConfig.delay * Math.pow(retryConfig.backoff, 2);
      jest.advanceTimersByTime(totalDelay);

      // Check fetch call count (should be retries + 1)
      expect(globalThis.fetch).toHaveBeenCalledTimes(retryConfig.retries + 1);

      // Ensure delay function was called for each retry attempt
      expect(mockDelayInvocation).toHaveBeenCalledTimes(retryConfig.retries);
      expect(mockDelayInvocation).toHaveBeenCalledWith(retryConfig.delay);
      expect(mockDelayInvocation).toHaveBeenCalledWith(
        retryConfig.delay * retryConfig.backoff,
      );

      expect(mockDelayInvocation).toHaveBeenCalledWith(
        retryConfig.delay * Math.pow(retryConfig.backoff, 2),
      );
    });

    it('should retry the specified number of times on failure', async () => {
      // Set up a RequestHandler with retry configuration
      const retryConfig = {
        retries: 3,
        delay: 100,
        maxDelay: 5000,
        backoff: 1.5,
        retryOn: [500], // Retry on server errors
        shouldRetry: jest.fn(() => Promise.resolve(true)),
      };
      const requestHandler = createRequestHandler({
        baseURL,
        retry: retryConfig,
        logger: mockLogger,
        onError: jest.fn(),
      });

      (globalThis.fetch as any).mockRejectedValue({
        status: 500,
        json: jest.fn().mockResolvedValue({}),
      });

      const mockDelayInvocation = delayInvocation as jest.MockedFunction<
        typeof delayInvocation
      >;

      mockDelayInvocation.mockResolvedValue(false);

      try {
        await requestHandler.request('/endpoint');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_e) {
        //
      }

      jest.advanceTimersByTime(10000);

      expect(globalThis.fetch).toHaveBeenCalledTimes(retryConfig.retries + 1);

      // Check delay between retries
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Attempt 1 failed. Retry in 100ms.',
      );
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Attempt 2 failed. Retry in 150ms.',
      );
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Attempt 3 failed. Retry in 225ms.',
      );
    });

    it('should not retry if the error status is not in retryOn list', async () => {
      const retryConfig = {
        retries: 2,
        delay: 100,
        maxDelay: 5000,
        backoff: 1.5,
        retryOn: [500],
        shouldRetry: jest.fn(() => Promise.resolve(true)),
      };
      const requestHandler = createRequestHandler({
        baseURL,
        retry: retryConfig,
        logger: mockLogger,
        onError: jest.fn(),
      });

      (globalThis.fetch as any).mockRejectedValue({
        status: 400,
        json: jest.fn().mockResolvedValue({}),
      });

      await expect(requestHandler.request('/endpoint')).rejects.toEqual({
        status: 400,
        json: expect.any(Function),
      });

      expect(globalThis.fetch).toHaveBeenCalledTimes(1); // No retries
    });

    it('should calculate delay correctly with backoff', async () => {
      const retryConfig = {
        retries: 3,
        delay: 100,
        maxDelay: 5000,
        backoff: 1.5,
        retryOn: [500],
        shouldRetry: jest.fn(() => Promise.resolve(true)),
      };
      const requestHandler = createRequestHandler({
        baseURL,
        retry: retryConfig,
        logger: mockLogger,
        onError: jest.fn(),
      });

      (globalThis.fetch as any).mockRejectedValue({
        status: 500,
        json: jest.fn().mockResolvedValue({}),
      });

      const mockDelayInvocation = delayInvocation as jest.MockedFunction<
        typeof delayInvocation
      >;

      mockDelayInvocation.mockResolvedValue(false);

      try {
        await requestHandler.request('/endpoint');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (_e) {
        //
      }

      // Advance time for the total delay
      jest.advanceTimersByTime(100 + 150 + 225);

      expect(mockDelayInvocation).toHaveBeenCalledTimes(3);
      expect(mockDelayInvocation).toHaveBeenCalledWith(100);
      expect(mockDelayInvocation).toHaveBeenCalledWith(150);
      expect(mockDelayInvocation).toHaveBeenCalledWith(225);
    });

    it('should not retry if shouldRetry returns false', async () => {
      const retryConfig = {
        retries: 3,
        delay: 100,
        maxDelay: 5000,
        backoff: 1.5,
        retryOn: [500],
        shouldRetry: jest.fn(() => Promise.resolve(false)),
      };
      const requestHandler = createRequestHandler({
        baseURL,
        retry: retryConfig,
        logger: mockLogger,
        onError: jest.fn(),
      });

      (globalThis.fetch as any).mockRejectedValue({
        status: 500,
        json: jest.fn().mockResolvedValue({}),
      });

      await expect(requestHandler.request('/endpoint')).rejects.toEqual({
        status: 500,
        json: expect.any(Function),
      });

      expect(globalThis.fetch).toHaveBeenCalledTimes(1); // No retries
    });
  });

  describe('request() with interceptors', () => {
    let requestHandler: RequestHandlerReturnType;

    beforeEach(() => {
      (applyInterceptor as jest.Mock).mockReset();
      (applyInterceptor as jest.Mock).mockImplementation(
        async (response) => response,
      );
      requestHandler = createRequestHandler({
        baseURL: 'https://api.example.com',
        timeout: 5000,
        cancellable: true,
        rejectCancelled: true,
        strategy: 'reject',
        flattenResponse: true,
        defaultResponse: null,
        onError: () => {},
      });

      jest.useFakeTimers();
      fetchMock.reset();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should apply interceptors correctly', async () => {
      // Set up mock implementations if needed
      (applyInterceptor as jest.Mock).mockImplementation(
        async (response) => response,
      );

      fetchMock.mock('https://api.example.com/test-endpoint?key=value', {
        status: 200,
        body: { data: 'response from second request' },
      });

      const url = '/test-endpoint';
      const data = { key: 'value' };
      const config = {};

      // Call the request method
      await requestHandler.request(url, data, config);

      // Verify that interceptRequest and applyInterceptor were called
      expect(applyInterceptor).toHaveBeenCalledTimes(4);
    });

    it('should handle modified config in interceptRequest', async () => {
      (applyInterceptor as jest.Mock).mockImplementation(async (config) => ({
        ...config,
        headers: { 'Modified-Header': 'ModifiedValue' },
      }));

      fetchMock.mock('https://api.example.com/test-endpoint?key=value', {
        status: 200,
        body: { data: 'response with modified config' },
      });

      const url = '/test-endpoint';
      const data = { key: 'value' };
      const config = {};

      await requestHandler.request(url, data, config);

      expect(applyInterceptor).toHaveBeenCalledTimes(4);
      // Verify that fetch was called with modified headers
      expect(fetchMock.lastOptions()).toMatchObject({
        headers: { 'Modified-Header': 'ModifiedValue' },
      });
    });

    it('should handle modified response in applyInterceptor', async () => {
      (applyInterceptor as jest.Mock).mockImplementation(async (response) => ({
        ...response,
        data: { username: 'modified response' },
      }));

      fetchMock.mock('https://api.example.com/test-endpoint?key=value', {
        status: 200,
        data: { username: 'original response' },
      });

      const url = '/test-endpoint';
      const data = { key: 'value' };
      const config = {};

      const response = await requestHandler.request(url, data, config);

      expect(applyInterceptor).toHaveBeenCalledTimes(4);
      expect(response).toMatchObject({ username: 'modified response' });
    });

    it('should handle request failure with interceptors', async () => {
      (applyInterceptor as jest.Mock).mockImplementation(
        async (response) => response,
      );

      fetchMock.mock('https://api.example.com/test-endpoint?key=value', {
        status: 500,
        body: { error: 'Server error' },
      });

      const url = '/test-endpoint';
      const data = { key: 'value' };
      const config = {};

      await expect(requestHandler.request(url, data, config)).rejects.toThrow(
        'https://api.example.com/test-endpoint?key=value failed! Status: 500',
      );

      // Only request interceptors are called (2 because 1 local and 1 global)
      expect(applyInterceptor).toHaveBeenCalledTimes(2);
    });

    it('should handle request with different response status', async () => {
      (applyInterceptor as jest.Mock).mockImplementation(
        async (response) => response,
      );

      fetchMock.mock('https://api.example.com/test-endpoint?key=value', {
        status: 404,
        body: { error: 'Not found' },
      });

      const url = '/test-endpoint';
      const data = { key: 'value' };
      const config = {};

      await expect(requestHandler.request(url, data, config)).rejects.toThrow(
        'https://api.example.com/test-endpoint?key=value failed! Status: 404',
      );

      // Only request interceptors are called (2 because 1 local and 1 global)
      expect(applyInterceptor).toHaveBeenCalledTimes(2);
    });
  });

  describe('request() with native fetch()', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      globalThis.fetch = jest.fn();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should properly hang promise when using Silent strategy', async () => {
      const requestHandler = createRequestHandler({
        strategy: 'silent',
      });

      globalThis.fetch = jest
        .fn()
        .mockRejectedValue(new Error('Request Failed'));

      const request = requestHandler.request(apiUrl);

      const timeout = new Promise((resolve) => {
        const wait = setTimeout(() => {
          clearTimeout(wait);

          resolve('timeout');
        }, 2000);
      });

      jest.advanceTimersByTime(2000);

      expect(typeof request.then).toBe('function');

      const response = await Promise.any([request, timeout]);

      expect(response).toBe('timeout');
    });

    it('should reject promise when using rejection strategy', async () => {
      const requestHandler = createRequestHandler({
        strategy: 'reject',
      });

      globalThis.fetch = jest
        .fn()
        .mockRejectedValue(new Error('Request Failed'));

      try {
        const response = await (requestHandler as any).delete(apiUrl);
        expect(response).toBe(undefined);
      } catch (error) {
        expect(typeof error).toBe('object');
      }
    });

    it('should reject promise when using reject strategy per endpoint', async () => {
      const requestHandler = createRequestHandler({
        strategy: 'silent',
      });

      globalThis.fetch = jest
        .fn()
        .mockRejectedValue(new Error('Request Failed'));

      try {
        await requestHandler.request(apiUrl, null, {
          strategy: 'reject',
        });
      } catch (error) {
        expect(typeof error).toBe('object');
      }
    });
  });

  describe('Request cancellation', () => {
    beforeEach(() => {
      globalThis.fetch = jest.fn();
    });

    it('should cancel previous request when successive request is made', async () => {
      fetchMock.reset();

      const requestHandler = createRequestHandler({
        cancellable: true,
        rejectCancelled: true,
        flattenResponse: true,
      });

      fetchMock.mock(
        'https://example.com/first',
        new Promise((_resolve, reject) => {
          reject(new DOMException('The operation was aborted.', ABORT_ERROR));
        }),
      );

      fetchMock.mock('https://example.com/second', {
        status: 200,
        body: { username: 'response from second request' },
      });

      const firstRequest = requestHandler.request('https://example.com/first');
      const secondRequest = requestHandler.request(
        'https://example.com/second',
      );

      expect(secondRequest).resolves.toMatchObject({
        username: 'response from second request',
      });
      expect(firstRequest).rejects.toThrow('The operation was aborted.');
    });

    it('should cancel previous request when successive request is made through fetchf() and rejectCancelled is false', async () => {
      fetchMock.reset();

      const abortedError = new DOMException(
        'The operation was aborted.',
        ABORT_ERROR,
      );

      fetchMock.mock(
        'https://example.com/first',
        new Promise((_resolve, reject) => {
          reject(abortedError);
        }),
      );

      fetchMock.mock('https://example.com/second', {
        status: 200,
        body: { username: 'response from second request' },
      });

      const firstRequest = fetchf('https://example.com/first', {
        cancellable: true,
        rejectCancelled: false,
        flattenResponse: true,
        defaultResponse: {},
      });
      const secondRequest = fetchf('https://example.com/second', {
        flattenResponse: true,
      });

      expect(secondRequest).resolves.toEqual({
        username: 'response from second request',
      });
      expect(firstRequest).resolves.toEqual({});
    });
  });

  describe('outputResponse()', () => {
    it('should show nested data object if flattening is off', async () => {
      const requestHandler = createRequestHandler({
        fetcher,
        flattenResponse: false,
      });

      (requestHandler.getInstance() as any).request = jest
        .fn()
        .mockResolvedValue(responseMock);

      const response = await requestHandler.request(apiUrl, null, {
        method: 'put',
      });

      expect(response).toMatchObject(responseMock);
    });

    it('should handle nested data if data flattening is on', async () => {
      const requestHandler = createRequestHandler({
        fetcher,
        flattenResponse: true,
      });

      (requestHandler.getInstance() as any).request = jest
        .fn()
        .mockResolvedValue(responseMock);

      const response = await requestHandler.request(apiUrl, null, {
        method: 'post',
      });

      expect(response).toMatchObject(responseMock.data);
    });

    it('should handle deeply nested data if data flattening is on', async () => {
      const requestHandler = createRequestHandler({
        fetcher,
        flattenResponse: true,
      });

      (requestHandler.getInstance() as any).request = jest
        .fn()
        .mockResolvedValue({ data: responseMock });

      const response = await requestHandler.request(apiUrl, null, {
        method: 'patch',
      });

      expect(response).toMatchObject(responseMock.data);
    });

    it('should return null if there is no data', async () => {
      const requestHandler = createRequestHandler({
        fetcher,
        flattenResponse: true,
        defaultResponse: null,
      });

      (requestHandler.getInstance() as any).request = jest
        .fn()
        .mockResolvedValue({ data: null });

      expect(
        await requestHandler.request(apiUrl, null, { method: 'head' }),
      ).toBe(null);
    });
  });
});
