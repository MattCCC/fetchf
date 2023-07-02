var E=Object.create;var h=Object.defineProperty;var b=Object.getOwnPropertyDescriptor;var C=Object.getOwnPropertyNames;var I=Object.getPrototypeOf,w=Object.prototype.hasOwnProperty;var x=(s,e)=>{for(var t in e)h(s,t,{get:e[t],enumerable:!0})},m=(s,e,t,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of C(e))!w.call(s,n)&&n!==t&&h(s,n,{get:()=>e[n],enumerable:!(r=b(e,n))||r.enumerable});return s};var S=(s,e,t)=>(t=s!=null?E(I(s)):{},m(e||!s||!s.__esModule?h(t,"default",{value:s,enumerable:!0}):t,s)),v=s=>m(h({},"__esModule",{value:!0}),s),f=(s,e,t,r)=>{for(var n=r>1?void 0:r?b(e,t):e,i=s.length-1,l;i>=0;i--)(l=s[i])&&(n=(r?l(e,t,n):l(n))||n);return r&&n&&h(e,t,n),n};var A={};x(A,{ApiHandler:()=>p,HttpRequestErrorHandler:()=>g,HttpRequestHandler:()=>c,createApiFetcher:()=>P});module.exports=v(A);var y=require("js-magic");var R=S(require("axios")),q=require("js-magic");var g=class{logger;httpRequestErrorService;constructor(e,t){this.logger=e,this.httpRequestErrorService=t}process(e){this.logger&&this.logger.warn&&this.logger.warn("API ERROR",e);let t=e;typeof e=="string"&&(t=new Error(e)),this.httpRequestErrorService&&(typeof this.httpRequestErrorService.process<"u"?this.httpRequestErrorService.process(t):typeof this.httpRequestErrorService=="function"&&this.httpRequestErrorService(t))}};var c=class{requestInstance;timeout=3e4;cancellable=!1;strategy="reject";flattenResponse=!0;defaultResponse=null;logger;httpRequestErrorService;requestsQueue;constructor({baseURL:e="",timeout:t=null,cancellable:r=!1,strategy:n=null,flattenResponse:i=null,defaultResponse:l={},logger:o=null,onError:a=null,...u}){this.timeout=t!==null?t:this.timeout,this.strategy=n!==null?n:this.strategy,this.cancellable=r||this.cancellable,this.flattenResponse=i!==null?i:this.flattenResponse,this.defaultResponse=l,this.logger=o||global.console||window.console||null,this.httpRequestErrorService=a,this.requestsQueue=new Map,this.requestInstance=R.default.create({...u,baseURL:e,timeout:this.timeout})}getInstance(){return this.requestInstance}interceptRequest(e){this.getInstance().interceptors.request.use(e)}__get(e){return e in this?this[e]:this.prepareRequest.bind(this,e)}prepareRequest(e,t,r=null,n=null){return this.handleRequest({type:e,url:t,data:r,config:n})}buildRequestConfig(e,t,r,n){let i=e.toLowerCase();return{...n,url:t,method:i,[i==="get"||i==="head"?"params":"data"]:r||{}}}processRequestError(e,t){if(this.isRequestCancelled(e,t))return;t.onError&&typeof t.onError=="function"&&t.onError(e),new g(this.logger,this.httpRequestErrorService).process(e)}async outputErrorResponse(e,t){let r=this.isRequestCancelled(e,t),n=t.strategy||this.strategy;return r&&!t.rejectCancelled?this.defaultResponse:n==="silent"?(await new Promise(()=>null),this.defaultResponse):n==="reject"||n==="throwError"?Promise.reject(e):this.defaultResponse}isRequestCancelled(e,t){return R.default.isCancel(e)}addCancellationToken(e){if(!this.cancellable&&!e.cancellable)return{};if(typeof e.cancellable<"u"&&!e.cancellable)return{};if(typeof AbortController>"u")return console.error("AbortController is unavailable in your ENV."),{};let{method:t,baseURL:r,url:n,params:i,data:l}=e,o=JSON.stringify([t,r,n,i,l]).substring(0,55**5),a=this.requestsQueue.get(o);a&&a.abort();let u=new AbortController;return this.requestsQueue.set(o,u),{signal:u.signal}}async handleRequest({type:e,url:t,data:r=null,config:n=null}){let i=null,l=n||{},o=this.buildRequestConfig(e,t,r,l);o={...this.addCancellationToken(o),...o};try{i=await this.requestInstance.request(o)}catch(a){return this.processRequestError(a,o),this.outputErrorResponse(a,o)}return this.processResponseData(i)}processResponseData(e){return e.data?this.flattenResponse?typeof e.data=="object"&&typeof e.data.data<"u"&&Object.keys(e.data).length===1?e.data.data:e.data:e:this.defaultResponse}};c=f([q.applyMagic],c);var p=class{apiUrl="";httpRequestHandler;endpoints;logger;constructor({apiUrl:e,endpoints:t,timeout:r=null,cancellable:n=!1,strategy:i=null,flattenResponse:l=null,defaultResponse:o={},logger:a=null,onError:u=null,...d}){this.apiUrl=e,this.endpoints=t,this.logger=a,this.httpRequestHandler=new c({...d,baseURL:this.apiUrl,timeout:r,cancellable:n,strategy:i,flattenResponse:l,defaultResponse:o,logger:a,onError:u})}getInstance(){return this.httpRequestHandler.getInstance()}__get(e){return e in this?this[e]:this.endpoints[e]?this.handleRequest.bind(this,e):this.handleNonImplemented.bind(this,e)}async handleRequest(...e){let t=e[0],r=this.endpoints[t],n=e[1]||{},i=e[2]||{},l=e[3]||{},o=r.url.replace(/:[a-z]+/gi,d=>i[d.substring(1)]?i[d.substring(1)]:d),a=null,u={...r};return delete u.url,delete u.method,a=await this.httpRequestHandler[(r.method||"get").toLowerCase()](o,n,{...l,...u}),a}handleNonImplemented(e){return this.logger&&this.logger.log&&this.logger.log(`${e} endpoint not implemented.`),Promise.resolve(null)}};p=f([y.applyMagic],p);var P=s=>new p(s);0&&(module.exports={ApiHandler,HttpRequestErrorHandler,HttpRequestHandler,createApiFetcher});
//# sourceMappingURL=index.js.map