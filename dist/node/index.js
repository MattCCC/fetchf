var y=Object.create;var g=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var C=Object.getOwnPropertyNames;var I=Object.getPrototypeOf,w=Object.prototype.hasOwnProperty;var x=(r,e)=>{for(var t in e)g(r,t,{get:e[t],enumerable:!0})},q=(r,e,t,s)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of C(e))!w.call(r,n)&&n!==t&&g(r,n,{get:()=>e[n],enumerable:!(s=m(e,n))||s.enumerable});return r};var S=(r,e,t)=>(t=r!=null?y(I(r)):{},q(e||!r||!r.__esModule?g(t,"default",{value:r,enumerable:!0}):t,r)),k=r=>q(g({},"__esModule",{value:!0}),r),R=(r,e,t,s)=>{for(var n=s>1?void 0:s?m(e,t):e,i=r.length-1,l;i>=0;i--)(l=r[i])&&(n=(s?l(e,t,n):l(n))||n);return s&&n&&g(e,t,n),n};var P={};x(P,{ApiHandler:()=>h,HttpRequestErrorHandler:()=>f,HttpRequestHandler:()=>c,createApiFetcher:()=>v});module.exports=k(P);var E=require("js-magic");var p=S(require("axios")),b=require("js-magic");var f=class{constructor(e,t){this.logger=e,this.httpRequestErrorService=t}process(e){this.logger&&this.logger.warn&&this.logger.warn("API ERROR",e);let t=e;typeof e=="string"&&(t=new Error(e)),this.httpRequestErrorService&&(typeof this.httpRequestErrorService.process<"u"?this.httpRequestErrorService.process(t):typeof this.httpRequestErrorService=="function"&&this.httpRequestErrorService(t))}};var c=class{constructor({baseURL:e="",timeout:t=null,cancellable:s=!1,strategy:n=null,flattenResponse:i=null,defaultResponse:l={},logger:o=null,onError:a=null,...u}){this.timeout=3e4;this.cancellable=!1;this.strategy="silent";this.flattenResponse=!0;this.defaultResponse=null;this.timeout=t!==null?t:this.timeout,this.strategy=n!==null?n:this.strategy,this.cancellable=s||this.cancellable,this.flattenResponse=i!==null?i:this.flattenResponse,this.defaultResponse=l,this.logger=o||global.console||window.console||null,this.httpRequestErrorService=a,this.requestsQueue=new Map,this.requestInstance=p.default.create({...u,baseURL:e,timeout:this.timeout})}getInstance(){return this.requestInstance}interceptRequest(e){this.getInstance().interceptors.request.use(e)}__get(e){return e in this?this[e]:this.prepareRequest.bind(this,e)}prepareRequest(e,t,s=null,n=null){return this.handleRequest({type:e,url:t,data:s,config:n})}buildRequestConfig(e,t,s,n){let i=e.toLowerCase();return{...n,url:t,method:i,[i==="get"||i==="head"?"params":"data"]:s||{}}}processRequestError(e,t){if(p.default.isCancel(e))return;t.onError&&typeof t.onError=="function"&&t.onError(e),new f(this.logger,this.httpRequestErrorService).process(e)}async outputErrorResponse(e,t){let s=t.cancelToken&&p.default.isCancel(e),n=t.strategy||this.strategy;return s&&!t.rejectCancelled?this.defaultResponse:n==="silent"?(await new Promise(()=>null),this.defaultResponse):n==="reject"||n==="throwError"?Promise.reject(e):this.defaultResponse}isRequestCancelled(e,t){return t.cancelToken&&p.default.isCancel(e)}addCancellationToken(e,t,s){if(!this.cancellable&&!s.cancellable)return{};if(typeof s.cancellable<"u"&&!s.cancellable)return{};let n=`${e}-${t}`,i=this.requestsQueue.get(n);i&&i.cancel();let l=p.default.CancelToken.source();this.requestsQueue.set(n,l);let o=this.requestsQueue.get(n)||{};return o.token?{cancelToken:o.token}:{}}async handleRequest({type:e,url:t,data:s=null,config:n=null}){let i=null,l=n||{},o=this.buildRequestConfig(e,t,s,l);o={...this.addCancellationToken(e,t,o),...o};try{i=await this.requestInstance.request(o)}catch(a){return this.processRequestError(a,o),this.outputErrorResponse(a,o)}return this.processResponseData(i)}processResponseData(e){return e.data?this.flattenResponse?typeof e.data=="object"&&typeof e.data.data<"u"&&Object.keys(e.data).length===1?e.data.data:e.data:e:this.defaultResponse}};c=R([b.applyMagic],c);var h=class{constructor({apiUrl:e,apiEndpoints:t,timeout:s=null,cancellable:n=!1,strategy:i=null,flattenResponse:l=null,defaultResponse:o={},logger:a=null,onError:u=null,...d}){this.apiUrl="";this.apiUrl=e,this.apiEndpoints=t,this.logger=a,this.httpRequestHandler=new c({...d,baseURL:this.apiUrl,timeout:s,cancellable:n,strategy:i,flattenResponse:l,defaultResponse:o,logger:a,onError:u})}getInstance(){return this.httpRequestHandler.getInstance()}__get(e){return e in this?this[e]:this.apiEndpoints[e]?this.handleRequest.bind(this,e):this.handleNonImplemented.bind(this,e)}async handleRequest(...e){let t=e[0],s=this.apiEndpoints[t],n=e[1]||{},i=e[2]||{},l=e[3]||{},o=s.url.replace(/:[a-z]+/gi,d=>i[d.substring(1)]?i[d.substring(1)]:d),a=null,u={...s};return delete u.url,delete u.method,a=await this.httpRequestHandler[(s.method||"get").toLowerCase()](o,n,{...l,...u}),a}handleNonImplemented(e){return this.logger&&this.logger.log&&this.logger.log(`${e} endpoint not implemented.`),Promise.resolve(null)}};h=R([E.applyMagic],h);var v=r=>new h(r);0&&(module.exports={ApiHandler,HttpRequestErrorHandler,HttpRequestHandler,createApiFetcher});
//# sourceMappingURL=index.js.map