(()=>{var q=Object.defineProperty;var C=Object.getOwnPropertyDescriptor;var f=(o,e,t,n)=>{for(var s=n>1?void 0:n?C(e,t):e,r=o.length-1,i;r>=0;r--)(i=o[r])&&(s=(n?i(e,t,s):i(s))||s);return n&&s&&q(e,t,s),s};var w=Symbol("__get"),S=Symbol("__set"),I=Symbol("__has"),P=Symbol("__delete"),R=Symbol("__invoke"),_=!1;function m(o,e=!1){if(typeof o=="function"){if(e===!0)return E(o);let t=function(...s){if(typeof new.target>"u"){let r=o[R]||o.__invoke;if(r)return p(o,r,"__invoke"),r?r.apply(o,s):o(...s);let i=o.prototype;return r=i[R]||i.__invoke,r&&!_&&(_=!0,console.warn("applyMagic: using __invoke without 'static' modifier is deprecated")),p(o,r,"__invoke"),r?r(...s):o(...s)}else return Object.assign(this,new o(...s)),E(this)};return Object.setPrototypeOf(t,o),Object.setPrototypeOf(t.prototype,o.prototype),g(t,"name",o.name),g(t,"length",o.length),g(t,"toString",function(){let s=this===t?o:this;return Function.prototype.toString.call(s)},!0),t}else{if(typeof o=="object")return E(o);throw new TypeError("'target' must be a function or an object")}}function p(o,e,t,n=void 0){if(e!==void 0){if(typeof e!="function")throw new TypeError(`${o.name}.${t} must be a function`);if(n!==void 0&&e.length!==n)throw new SyntaxError(`${o.name}.${t} must have ${n} parameter${n===1?"":"s"}`)}}function g(o,e,t,n=!1){Object.defineProperty(o,e,{configurable:!0,enumerable:!1,writable:n,value:t})}function E(o){let e=o[w]||o.__get,t=o[S]||o.__set,n=o[I]||o.__has,s=o[P]||o.__delete;return p(new.target,e,"__get",1),p(new.target,t,"__set",2),p(new.target,n,"__has",1),p(new.target,s,"__delete",1),new Proxy(o,{get:(r,i)=>e?e.call(r,i):r[i],set:(r,i,l)=>(t?t.call(r,i,l):r[i]=l,!0),has:(r,i)=>n?n.call(r,i):i in r,deleteProperty:(r,i)=>(s?s.call(r,i):delete r[i],!0)})}var y=class{logger;requestErrorService;constructor(e,t){this.logger=e,this.requestErrorService=t}process(e){var n;(n=this.logger)!=null&&n.warn&&this.logger.warn("API ERROR",e);let t=e;typeof e=="string"&&(t=new Error(e)),this.requestErrorService&&(typeof this.requestErrorService.process<"u"?this.requestErrorService.process(t):typeof this.requestErrorService=="function"&&this.requestErrorService(t))}};var d=class{requestInstance;timeout=3e4;cancellable=!1;strategy="reject";flattenResponse=!0;defaultResponse=null;fetcher;logger;requestErrorService;requestsQueue;constructor({fetcher:e=null,baseURL:t="",timeout:n=null,cancellable:s=!1,strategy:r=null,flattenResponse:i=null,defaultResponse:l={},logger:a=null,onError:u=null,...c}){this.fetcher=e,this.timeout=n??this.timeout,this.strategy=r??this.strategy,this.cancellable=s||this.cancellable,this.flattenResponse=i??this.flattenResponse,this.defaultResponse=l,this.logger=a||(globalThis?globalThis.console:null)||null,this.requestErrorService=u,this.requestsQueue=new Map,this.requestInstance=this.isCustomFetcher()?e.create({...c,baseURL:t||c.apiUrl||"",timeout:this.timeout}):globalThis.fetch}getInstance(){return this.requestInstance}__get(e){return e in this?this[e]:this.handleRequest.bind(this,e)}appendQueryParams(e,t){let n=Object.entries(t).flatMap(([s,r])=>Array.isArray(r)?r.map(i=>`${encodeURIComponent(s)}[]=${encodeURIComponent(i)}`):`${encodeURIComponent(s)}=${encodeURIComponent(r)}`).join("&");return e.includes("?")?`${e}&${n}`:n?`${e}?${n}`:e}isJSONSerializable(e){if(e==null)return!1;let t=typeof e;if(t==="string"||t==="number"||t==="boolean")return!0;if(t!=="object")return!1;if(Array.isArray(e))return!0;if(Buffer.isBuffer(e)||e instanceof Date)return!1;let n=Object.getPrototypeOf(e);return n===Object.prototype||n===null||typeof e.toJSON=="function"}buildRequestConfig(e,t,n,s){let r=e.toLowerCase(),i=r==="get"||r==="head";if(this.isCustomFetcher())return{...s,url:t,method:r,...i?{params:n}:{},...!i&&n&&s.data?{params:n}:{},...!i&&n&&!s.data?{data:n}:{},...!i&&s.data?{data:s.data}:{}};let l=s.body||s.data||n;return delete s.data,{...s,url:!i&&n&&!s.body||!n?t:this.appendQueryParams(t,n),method:e.toUpperCase(),headers:{Accept:"application/json, text/plain, */*","Content-Type":"application/json;charset=utf-8",...s.headers||{}},...i?{}:{body:this.isJSONSerializable(l)?typeof l=="string"?l:JSON.stringify(l):l}}}processRequestError(e,t){if(this.isRequestCancelled(e))return;t.onError&&typeof t.onError=="function"&&t.onError(e),new y(this.logger,this.requestErrorService).process(e)}async outputErrorResponse(e,t){let n=this.isRequestCancelled(e),s=t.strategy||this.strategy;return n&&!t.rejectCancelled?this.defaultResponse:s==="silent"?(await new Promise(()=>null),this.defaultResponse):s==="reject"||s==="throwError"?Promise.reject(e):this.defaultResponse}isRequestCancelled(e){return e.name==="AbortError"||e.name==="CanceledError"}isCustomFetcher(){return this.fetcher!==null}addCancellationToken(e){if(!this.cancellable&&!e.cancellable)return{};if(typeof e.cancellable<"u"&&!e.cancellable)return{};if(typeof AbortController>"u")return console.error("AbortController is unavailable."),{};let{method:t,baseURL:n,url:s,params:r,data:i}=e,l=JSON.stringify([t,n,s,r,i]).substring(0,55**5),a=this.requestsQueue.get(l);a&&a.abort();let u=new AbortController;if(!this.isCustomFetcher()){let c=setTimeout(()=>{let b=new Error(`[TimeoutError]: The ${s} request was aborted due to timeout`);b.name="TimeoutError",b.code=23,u.abort(b),clearTimeout(c)},e.timeout||this.timeout)}return this.requestsQueue.set(l,u),{signal:u.signal}}async handleRequest(e,t,n=null,s=null){let r=null,i=s||{},l=this.buildRequestConfig(e,t,n,i);l={...this.addCancellationToken(l),...l};try{if(this.isCustomFetcher())r=await this.requestInstance.request(l);else if(r=await this.requestInstance(t,l),r.ok)r=await r.json();else{let a=new Error(`HTTP error! Status: ${r.status}`);throw a.response=r,a}}catch(a){return this.processRequestError(a,l),this.outputErrorResponse(a,l)}return this.processResponseData(r)}processResponseData(e){return e.data?this.flattenResponse?typeof e.data=="object"&&typeof e.data.data<"u"&&Object.keys(e.data).length===1?e.data.data:e.data:e:this.defaultResponse}};d=f([m],d);var h=class{requestHandler;endpoints;logger;constructor(e){this.endpoints=e.endpoints,this.logger=e.logger,this.requestHandler=new d(e)}getInstance(){return this.requestHandler.getInstance()}__get(e){return e in this?this[e]:this.endpoints[e]?this.handleRequest.bind(this,e):this.handleNonImplemented.bind(this,e)}async handleRequest(...e){let t=e[0],n=this.endpoints[t],s=e[1]||{},r=e[2]||{},i=e[3]||{},l=n.url.replace(/:[a-z]+/gi,c=>r[c.substring(1)]?r[c.substring(1)]:c),a=null,u={...n};return delete u.url,delete u.method,a=await this.requestHandler[(n.method||"get").toLowerCase()](l,s,{...i,...u}),a}handleNonImplemented(e){var t;return(t=this.logger)!=null&&t.log&&this.logger.log(`${e} endpoint not implemented.`),Promise.resolve(null)}};h=f([m],h);var L=o=>new h(o);})();
//# sourceMappingURL=index.global.js.map