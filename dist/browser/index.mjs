var R=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var h=(u,e,t,r)=>{for(var n=r>1?void 0:r?m(e,t):e,s=u.length-1,o;s>=0;s--)(o=u[s])&&(n=(r?o(e,t,n):o(n))||n);return r&&n&&R(e,t,n),n};import{applyMagic as b}from"js-magic";import{applyMagic as q}from"js-magic";var g=class{logger;httpRequestErrorService;constructor(e,t){this.logger=e,this.httpRequestErrorService=t}process(e){var r;(r=this.logger)!=null&&r.warn&&this.logger.warn("API ERROR",e);let t=e;typeof e=="string"&&(t=new Error(e)),this.httpRequestErrorService&&(typeof this.httpRequestErrorService.process<"u"?this.httpRequestErrorService.process(t):typeof this.httpRequestErrorService=="function"&&this.httpRequestErrorService(t))}};var p=class{requestInstance;timeout=3e4;cancellable=!1;strategy="reject";flattenResponse=!0;defaultResponse=null;axios;logger;httpRequestErrorService;requestsQueue;constructor({axios:e,baseURL:t="",timeout:r=null,cancellable:n=!1,strategy:s=null,flattenResponse:o=null,defaultResponse:i={},logger:l=null,onError:a=null,...c}){this.axios=e,this.timeout=r!==null?r:this.timeout,this.strategy=s!==null?s:this.strategy,this.cancellable=n||this.cancellable,this.flattenResponse=o!==null?o:this.flattenResponse,this.defaultResponse=i,this.logger=l||global.console||window.console||null,this.httpRequestErrorService=a,this.requestsQueue=new Map,this.requestInstance=e.create({...c,baseURL:t,timeout:this.timeout})}getInstance(){return this.requestInstance}__get(e){return e in this?this[e]:this.prepareRequest.bind(this,e)}prepareRequest(e,t,r=null,n=null){return this.handleRequest({type:e,url:t,data:r,config:n})}buildRequestConfig(e,t,r,n){let s=e.toLowerCase();return{...n,url:t,method:s,[s==="get"||s==="head"?"params":"data"]:r||{}}}processRequestError(e,t){if(this.isRequestCancelled(e,t))return;t.onError&&typeof t.onError=="function"&&t.onError(e),new g(this.logger,this.httpRequestErrorService).process(e)}async outputErrorResponse(e,t){let r=this.isRequestCancelled(e,t),n=t.strategy||this.strategy;return r&&!t.rejectCancelled?this.defaultResponse:n==="silent"?(await new Promise(()=>null),this.defaultResponse):n==="reject"||n==="throwError"?Promise.reject(e):this.defaultResponse}isRequestCancelled(e,t){return this.axios.isCancel(e)}addCancellationToken(e){if(!this.cancellable&&!e.cancellable)return{};if(typeof e.cancellable<"u"&&!e.cancellable)return{};if(typeof AbortController>"u")return console.error("AbortController is unavailable in your ENV."),{};let{method:t,baseURL:r,url:n,params:s,data:o}=e,i=JSON.stringify([t,r,n,s,o]).substring(0,55**5),l=this.requestsQueue.get(i);l&&l.abort();let a=new AbortController;return this.requestsQueue.set(i,a),{signal:a.signal}}async handleRequest({type:e,url:t,data:r=null,config:n=null}){let s=null,o=n||{},i=this.buildRequestConfig(e,t,r,o);i={...this.addCancellationToken(i),...i};try{s=await this.requestInstance.request(i)}catch(l){return this.processRequestError(l,i),this.outputErrorResponse(l,i)}return this.processResponseData(s)}processResponseData(e){return e.data?this.flattenResponse?typeof e.data=="object"&&typeof e.data.data<"u"&&Object.keys(e.data).length===1?e.data.data:e.data:e:this.defaultResponse}};p=h([q],p);var d=class{requestHandler;endpoints;logger;constructor({axios:e,apiUrl:t,endpoints:r,timeout:n=null,cancellable:s=!1,strategy:o=null,flattenResponse:i=null,defaultResponse:l={},logger:a=null,onError:c=null,...f}){this.endpoints=r,this.logger=a,this.requestHandler=new p({...f,baseURL:t,axios:e,timeout:n,cancellable:s,strategy:o,flattenResponse:i,defaultResponse:l,logger:a,onError:c})}getInstance(){return this.requestHandler.getInstance()}__get(e){return e in this?this[e]:this.endpoints[e]?this.handleRequest.bind(this,e):this.handleNonImplemented.bind(this,e)}async handleRequest(...e){let t=e[0],r=this.endpoints[t],n=e[1]||{},s=e[2]||{},o=e[3]||{},i=r.url.replace(/:[a-z]+/gi,c=>s[c.substring(1)]?s[c.substring(1)]:c),l=null,a={...r};return delete a.url,delete a.method,l=await this.requestHandler[(r.method||"get").toLowerCase()](i,n,{...o,...a}),l}handleNonImplemented(e){var t;return(t=this.logger)!=null&&t.log&&this.logger.log(`${e} endpoint not implemented.`),Promise.resolve(null)}};d=h([b],d);var j=u=>new d(u);export{d as ApiHandler,g as RequestErrorHandler,p as RequestHandler,j as createApiFetcher};
//# sourceMappingURL=index.mjs.map