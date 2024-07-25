# Axios Multi API

[npm-url]: https://npmjs.org/package/axios-multi-api
[npm-image]: http://img.shields.io/npm/v/axios-multi-api.svg

[![NPM version][npm-image]][npm-url] [![Blazing Fast](https://badgen.now.sh/badge/speed/blazing%20%F0%9F%94%A5/green)](https://github.com/MattCCC/axios-multi-api) [![Code Coverage](https://badgen.now.sh/badge/coverage/94.53/blue)](https://github.com/MattCCC/axios-multi-api) [![npm downloads](https://img.shields.io/npm/dm/axios-multi-api.svg?style=flat-square)](http://npm-stat.com/charts.html?package=axios-multi-api) [![install size](https://packagephobia.now.sh/badge?p=axios-multi-api)](https://packagephobia.now.sh/result?p=axios-multi-api)

Oftentimes projects require complex APIs setups, middlewares and another stuff to accomodate a lot of API requests. Axios API Handler simplifies API handling to the extent that developers can focus on operating on the fetched data from their APIs rather than on complex initial setups.

This package helps in handling of many API endpoints in a simple, declarative fashion. It also aims to provide a possibility to use a global error handling in an easy manner.

You can set up multiple API handlers for different sets of APIs from different services. This provides much better scalability for many projects.

> If you’re new to Axios, please checkout [this handy Axios readme](https://github.com/axios/axios)

Package was originally written to accomodate many API requests in an orderly fashion.

## Features

- **Easily manage large applications with many API endpoints**
- **Native fetch() support so Axios can be skipped**
- Global error handler for requests
- Automatically cancel previous requests
- Global and per request timeouts
- Multiple response resolving strategies
- Dynamic urls support e.g. `/user/:userId`
- Multiple requests chaining (using promises)
- All Axios options are supported
- **Browsers and Node 18+ compatible**
- **Fully TypeScript compatibile**
- **Very lightweight, only a few KBs gzipped**

Please open an issue for future requests.

## ✔️ Quick Start

[![NPM](https://nodei.co/npm/axios-multi-api.png)](https://npmjs.org/package/axios-multi-api)

Using NPM:

```bash
npm install axios-multi-api
```

Using yarn:

```bash
yarn add axios-multi-api
```

Please mind that if you want to use it with Axios, you need to install it separately by e.g. running `npm install axios`.

```typescript
import { createApiFetcher } from 'axios-multi-api';

const api = createApiFetcher({
  apiUrl: 'https://example.com/api',
  endpoints: {
    getUser: {
      url: '/user-details',
    },
  },
});

// Make API GET request to: http://example.com/api/user-details?userId=1&ratings[]=1&ratings[]=2
const response = await api.getUser({ userId: 1, ratings: [1, 2] });
```

## ✔️ More Advanced Usage

```typescript
import axios from 'axios';
import { createApiFetcher } from 'axios-multi-api';

const endpoints = {
  getUser: {
    method: 'get',
    url: '/user-details',
  },

  // No need to specify method: 'get' for GET requests
  getPosts: {
    url: '/posts/:subject',
  },

  updateUserDetails: {
    method: 'post',
    url: '/user-details/update/:userId',
  },

  // ...
};

const api = createApiFetcher({
  fetcher: axios,
  endpoints,
  apiUrl: 'https://example.com/api',
  onError(error) {
    console.log('Request failed', error);
  },
  // Optional: default headers (axios config is supported)
  headers: {
    'my-auth-key': 'example-auth-key-32rjjfa',
  },
});

// Fetch user data - "response" will return data directly
// GET to: http://example.com/api/user-details?userId=1&ratings[]=1&ratings[]=2
const response = await api.getUser({ userId: 1, ratings: [1, 2] });

// Fetch posts - "response" will return data directly
// GET to: http://example.com/api/posts/myTestSubject?additionalInfo=something
const response = await api.getPosts(
  { additionalInfo: 'something' },
  { subject: 'myTestSubject' },
);

// Send POST request to update userId "1"
await api.updateUserDetails({ name: 'Mark' }, { userId: 1 });

// Send POST request to update array of user ratings for userId "1"
await api.updateUserDetails({ name: 'Mark', ratings: [1, 2] }, { userId: 1 });
```

In the example above we fetch data from an API for user with an ID of 1. We also update user's name to Mark. If you prefer OOP you can import `ApiHandler` and initialize the handler using `new ApiHandler()` instead. In case of using typings, due to magic methods being utilized, you may need to overwrite the type: `const api = new ApiHandler(config) as ApiHandler & EndpointsList` where `EndpointsList` is the list of your endpoints.

## ✔️ Easy to use with React and other libraries

You could use [React Query](https://react-query-v3.tanstack.com/guides/queries) hooks with API handler:

```typescript
// api/index.ts
import axios from 'axios';
import { createApiFetcher } from 'axios-multi-api';

const api = createApiFetcher({
  fetcher: axios, // Optional, native fetch() will be used otherwise
  apiUrl: 'https://example.com/api',
  strategy: 'reject',
  endpoints: {
    getProfile: {
      url: '/profile/:id',
    },
  },
  onError(error) {
    console.log('Request failed', error);
  },
});

export default api;

// hooks/useProfile.ts

import api from '../api/index';

export const useProfile = ({ id }) => {
  return useQuery(['profile', id], () => api.getProfile({ id }), {
    initialData: [],
    initialDataUpdatedAt: Date.now(),
    enabled: id > 0,
    refetchOnReconnect: true,
  });
};
```

## ✔️ Auto created API functions

##### api.endpointName(queryParams, urlParams, requestConfig)

`queryParams` / `payload` (optional)

First argument of API functions is an object with query params for `GET` requests, or with a data payload for `POST` alike requests. Other request types are supported as well. For `POST` alike requests you may occasionally want to use both query params and payload. In such case, use this argument as query params and pass the payload as 3rd argument `requestConfig.body` or `requestConfig.data` (for Axios)

Query params accepts strings, numbers, and even arrays so you pass { foo: [1, 2] } and it will become: foo[]=1&foo[]=2 automatically.

`urlParams` (optional)

It gives possibility to modify urls structure in a declarative way. In our example `/user-details/update/:userId` will become `/user-details/update/1` when API request will be made.

`requestConfig` (optional)

To have more granular control over specific endpoints you can pass Axios compatible [Request Config](https://github.com/axios/axios#request-config) for particular endpoint. You can also use Global Settings like `cancellable` or `strategy` mentioned below.

##### api.getInstance()

When API handler is firstly initialized, a new Axios instance is created. You can call `api.getInstance()` if you want to get that instance directly, for example to add some interceptors.

## ✔️ Global Settings

Global settings are passed to `createApiFetcher()` function. You can pass all [Axios Request Config](https://github.com/axios/axios#request-config). Additional options are listed below.

| Option          | Type        | Default   | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| --------------- | ----------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| apiUrl          | string      |           | Your API base url.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| endpoints       | object      |           | List of your endpoints. Check [Per Endpoint Settings](#per-endpoint-settings) for options.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| fetcher         | AxiosStatic |           | Axios instance imported from axios package. Leave empty, if you do not intend to use Axios with this package. The native `fetch()` will be used instead.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| strategy        | string      | `reject`  | Error handling strategies - basically what to return when an error occurs. It can be a default data, promise can be hanged (nothing would be returned) or rejected so to use try/catch. Available: `silent`, `reject`, `defaultResponse`<br><br>`silent` can be used for a requests that are dispatched within asynchronous wrapper functions. If a request fails, promise will silently hang and no action will be performed. It will never be resolved or rejected when there is an error. Please remember that this is not what Promises were made for, however if used properly it saves developers from try/catch or additional response data checks everywhere. You can use is in combination with `onError` so to handle errors globally.<br><br>`reject` will simply reject the promise. Global error handling will be triggered right before the rejection. You will need to remember to set try/catch per each request to catch exceptions properly.<br><br>`defaultResponse` will return default response specified in either global `defaultResponse` or per endpoint `defaultResponse` setting. Promise will not be rejected! Data from default response will be returned instead. It could be used together with object destructuring by setting `defaultResponse: {}` so to provide a responsible defaults. |
| cancellable     | boolean     | `false`   | If set to `true` any previously dispatched requests to same url & of method will be cancelled, if a successive request is made meanwhile. This let's you avoid unnecessary requests to the backend.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| flattenResponse | boolean     | `false`   | Flattens nested response.data so you can avoid writing `response.data.data` and obtain response directly. Response is flattened whenever there is a "data" within response "data", and no other object properties set.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| defaultResponse | any         | `null`    | Default response when there is no data or when endpoint fails depending on the chosen `strategy`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| timeout         | int         | `30000`   | You can set a global timeout for all requests in milliseconds.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| logger          | object      | `console` | You can additionally specify logger object with your custom logger to automatically log the errors to the console. It should contain at least `error` and `warn` functions. `console.log` is used by default.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| onError         | function    |           | You can specify a function or class that will be triggered when an endpoint fails. If it's a class it should expose a `process` method. Axios Error Object will be sent as a first argument of it.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

## ✔️ Per Endpoint Settings

Each endpoint in `endpoints` is an object that accepts properties below. You can also pass these options as a 3rd argument when calling an endpoint so to have a more granular control.

| Option          | Type     | Default | Description                                                                                                                                                                                  |
| --------------- | -------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| method          | string   |         | Default request method e.g. GET, POST, DELETE, PUT etc.                                                                                                                                      |
| url             | string   |         | Url path e.g. /user-details/get                                                                                                                                                              |
| cancellable     | boolean  | `false` | Whether previous requests should be automatically cancelled. See global settings for more info.                                                                                              |
| rejectCancelled | boolean  | `false` | If `true` and request is set to `cancellable`, a cancelled request promise will be rejected. By default instead of rejecting the promise, `defaultResponse` from global options is returned. |
| defaultResponse | any      | `null`  | Default response when there is no data or when endpoint fails depending on a chosen `strategy`                                                                                               |
| timeout         | int      | `30000` | You can set the timeout for particular request in milliseconds.                                                                                                                              |
| strategy        | string   |         | You can control strategy per each request. Global strategy is applied by default.                                                                                                            |
| onError         | function |         | You can specify a function that will be triggered when an endpoint fails.                                                                                                                    |

## ✔️ Full TypeScript support

Axios-multi-api includes necessary [TypeScript](http://typescriptlang.org) definitions. For full TypeScript support for your endpoints, you could overwrite interface using Type Assertion of your `ApiHandler` and use your own for the API Endpoints provided.

### Example of interface

```typescript
import { Endpoints, Endpoint } from 'axios-multi-api';

import axios from 'axios';
import { createApiFetcher } from 'axios-multi-api';

interface Movie {
  id: number;
  title: string;
  genre: string;
  releaseDate: string;
  rating: number;
}

interface MoviesResponseData {
  movies: Movie[];
  totalResults: number;
  totalPages: number;
}

interface MoviesQueryParams {
  newMovies: boolean;
}

interface MoviesDynamicURLParams {
  movieId?: number;
}

// You can either extend the Endpoints to skip defining every endpoint
// Or you can just define the EndpointsList and enjoy more strict typings
interface EndpointsList extends Endpoints {
  fetchMovies: Endpoint<
    MoviesResponseData,
    MoviesQueryParams,
    MoviesDynamicURLParams
  >;

  // Or you can use just Endpoint
  fetchTVSeries: Endpoint;
}

const api = createApiFetcher<EndpointsList>({
  fetcher: axios,
  // Your config
});

// Will return an error since "newMovies" should be a boolean
const movies = api.fetchMovies({ newMovies: 1 });

// You can also pass type to the request directly
const movie = api.fetchMovies<MoviesResponseData>(
  { newMovies: 1 },
  { movieId: 1 },
);
```

Package ships interfaces with responsible defaults making it easier to add new endpoints. It exposes `Endpoints` and `Endpoint` types.

## ✔️ Examples

### Per Request Error handling

```typescript
import axios from 'axios';
import { createApiFetcher } from 'axios-multi-api';

const api = createApiFetcher({
  fetcher: axios,
  apiUrl: 'https://example.com/api',
  endpoints: {
    sendMessage: {
      method: 'get',
      url: '/send-message/:postId',
    },
  },
});

async function sendMessage() {
  await api.sendMessage(
    { message: 'Something..' },
    { postId: 1 },
    {
      onError(error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
        }
        console.log(error.config);
      },
    },
  );

  console.log('Message sent successfully');
}

sendMessage();
```

### OOP style with custom Error Handler (advanced)

You could for example create an API service class that extends the handler, inject an error service class to handle with a store that would collect the errors.

As you may notice there's also a `setupInterceptor` and `httpRequestHandler` exposed. You can operate on it instead of requesting an Axios instance prior the operation. This way you can use all Axios settings for a particular API handler.

```typescript
import axios from 'axios';
import { ApiHandler } from 'axios-multi-api';

class MyRequestError {
  public constructor(myCallback) {
    this.myCallback = myCallback;
  }

  public process(error) {
    this.myCallback('Request error', error);
  }
}

class ApiService extends ApiHandler {
  /**
   * Creates an instance of Api Service.
   * @param {object}  payload                   Payload
   * @param {string}  payload.apiUrl            Api url
   * @param {string}  payload.endpoints      Api endpoints
   * @param {*}       payload.logger                 Logger instance
   * @param {*}       payload.myCallback             Callback function, could be a dispatcher that e.g. forwards error data to a store
   */
  public constructor({ apiUrl, endpoints, logger, myCallback }) {
    // Pass settings to API Handler
    super({
      fetcher: axios,
      apiUrl,
      endpoints,
      logger,
      onError: new MyRequestError(myCallback),
    });

    this.setupInterceptor();
  }

  /**
   * Setup Request Interceptor
   * @returns {void}
   */
  protected setupInterceptor(): void {
    this.getInstance().interceptors.request.use(onRequest);
  }
}

const api = new ApiService({
  // Your config
});
```

## ✔️ Support and collaboration

If you have any idea for an improvement, please file an issue. Feel free to make a PR if you are willing to collaborate on the project. Thank you :)
