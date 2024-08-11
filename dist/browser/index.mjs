async function C(u,e){if(!e)return u;let s=Array.isArray(e)?e:[e],t={...u};for(let n of s)t=await n(t);return t}async function P(u,e){if(!e)return u;let s=Array.isArray(e)?e:[e],t=u;for(let n of s)t=await n(t);return t}var b=class extends Error{response;request;config;status;statusText;constructor(e,s,t){super(e),this.name="ResponseError",this.message=e,this.status=t.status,this.statusText=t.statusText,this.request=s,this.config=s,this.response=t}};var R=class{requestInstance;baseURL="";timeout=3e4;cancellable=!1;rejectCancelled=!1;strategy="reject";method="get";flattenResponse=!1;defaultResponse=null;fetcher;logger;onError;requestsQueue;retry={retries:0,delay:1e3,maxDelay:3e4,backoff:1.5,retryOn:[408,409,425,429,500,502,503,504],shouldRetry:async()=>!0};config;constructor({fetcher:e=null,timeout:s=null,rejectCancelled:t=!1,strategy:n=null,flattenResponse:a=null,defaultResponse:l={},logger:r=null,onError:o=null,...i}){this.fetcher=e,this.timeout=s??this.timeout,this.strategy=n||this.strategy,this.cancellable=i.cancellable||this.cancellable,this.rejectCancelled=t||this.rejectCancelled,this.flattenResponse=a||this.flattenResponse,this.defaultResponse=l,this.logger=r||(globalThis?globalThis.console:null)||null,this.onError=o,this.requestsQueue=new WeakMap,this.baseURL=i.baseURL||i.apiUrl||"",this.method=i.method||this.method,this.config=i,this.retry={...this.retry,...i.retry||{}},this.requestInstance=this.isCustomFetcher()?e.create({...i,baseURL:this.baseURL,timeout:this.timeout}):null}getInstance(){return this.requestInstance}replaceUrlPathParams(e,s){return s?e.replace(/:[a-zA-Z]+/gi,t=>{let n=t.substring(1);return String(s[n]?s[n]:t)}):e}appendQueryParams(e,s){if(!s)return e;let t=Object.entries(s).flatMap(([n,a])=>Array.isArray(a)?a.map(l=>`${encodeURIComponent(n)}[]=${encodeURIComponent(l)}`):`${encodeURIComponent(n)}=${encodeURIComponent(String(a))}`).join("&");return e.includes("?")?`${e}&${t}`:t?`${e}?${t}`:e}isJSONSerializable(e){if(e==null)return!1;let s=typeof e;if(s==="string"||s==="number"||s==="boolean")return!0;if(s!=="object")return!1;if(Array.isArray(e))return!0;if(Buffer.isBuffer(e)||e instanceof Date)return!1;let t=Object.getPrototypeOf(e);return t===Object.prototype||t===null||typeof e.toJSON=="function"}buildConfig(e,s,t){let n=t.method||this.method,a=n.toLowerCase(),l=a==="get"||a==="head",r=this.replaceUrlPathParams(e,t.urlPathParams||this.config.urlPathParams),o=t.body||t.data||this.config.body||this.config.data;if(this.isCustomFetcher())return{...t,url:r,method:a,...l?{params:s}:{},...!l&&s&&o?{params:s}:{},...!l&&s&&!o?{data:s}:{},...!l&&o?{data:o}:{}};let i=o||s,y=t.withCredentials||this.config.withCredentials?"include":t.credentials;delete t.data,delete t.withCredentials;let p=!l&&s&&!t.body||!s?r:this.appendQueryParams(r,s),h=p.includes("://")?"":typeof t.baseURL<"u"?t.baseURL:this.baseURL;return{...t,credentials:y,url:h+p,method:n.toUpperCase(),headers:{Accept:"application/json, text/plain, */*","Content-Type":"application/json;charset=utf-8",...t.headers||this.config.headers||{}},...l?{}:{body:!(i instanceof URLSearchParams)&&this.isJSONSerializable(i)?typeof i=="string"?i:JSON.stringify(i):i}}}processError(e,s){var t;this.isRequestCancelled(e)||((t=this.logger)!=null&&t.warn&&this.logger.warn("API ERROR",e),s.onError&&typeof s.onError=="function"&&s.onError(e),this.onError&&typeof this.onError=="function"&&this.onError(e))}async outputErrorResponse(e,s){let t=this.isRequestCancelled(e),n=s.strategy||this.strategy,a=typeof s.rejectCancelled<"u"?s.rejectCancelled:this.rejectCancelled,l=typeof s.defaultResponse<"u"?s.defaultResponse:this.defaultResponse;return n==="softFail"?this.outputResponse(e.response,s,e):t&&!a?l:n==="silent"?(await new Promise(()=>null),l):n==="reject"?Promise.reject(e):l}isRequestCancelled(e){return e.name==="AbortError"||e.name==="CanceledError"}isCustomFetcher(){return this.fetcher!==null}addCancellationToken(e){if(!this.cancellable&&!e.cancellable)return{};if(typeof e.cancellable<"u"&&!e.cancellable)return{};if(typeof AbortController>"u")return console.error("AbortController is unavailable."),{};let s=this.requestsQueue.get(e);s&&s.abort();let t=new AbortController;if(!this.isCustomFetcher()&&this.timeout>0){let n=setTimeout(()=>{let a=new Error(`[TimeoutError]: The ${e.url} request was aborted due to timeout`);throw a.name="TimeoutError",a.code=23,t.abort(a),clearTimeout(n),a},e.timeout||this.timeout)}return this.requestsQueue.set(e,t),{signal:t.signal}}async request(e,s=null,t=null){var q,w,F;let n=null,a=t||{},l=this.buildConfig(e,s,a),r={...this.addCancellationToken(l),...l},{retries:o,delay:i,backoff:y,retryOn:p,shouldRetry:g,maxDelay:h}={...this.retry,...(r==null?void 0:r.retry)||{}},f=0,m=i;for(;f<=o;)try{if(r=await C(r,r.onRequest),r=await C(r,this.config.onRequest),this.isCustomFetcher())n=await this.requestInstance.request(r);else{n=await globalThis.fetch(r.url,r);let c=String(((q=n==null?void 0:n.headers)==null?void 0:q.get("Content-Type"))||""),d;if(!c)try{d=await n.json()}catch{}if(typeof d>"u"&&(c&&c.includes("application/json")?d=await n.json():typeof n.text<"u"?d=await n.text():typeof n.blob<"u"?d=await n.blob():d=n.body||n.data||null),n.config=r,n.data=d,!n.ok)throw new b(`${r.url} failed! Status: ${n.status||null}`,r,n)}return n=await P(n,r.onResponse),n=await P(n,this.config.onResponse),this.outputResponse(n,r)}catch(c){if(f===o||!await g(c,f)||!(p!=null&&p.includes(((w=c==null?void 0:c.response)==null?void 0:w.status)||(c==null?void 0:c.status))))return this.processError(c,r),this.outputErrorResponse(c,r);(F=this.logger)!=null&&F.warn&&this.logger.warn(`Attempt ${f+1} failed. Retrying in ${m}ms...`),await this.delay(m),m*=y,m=Math.min(m,h),f++}return this.outputResponse(n,r)}async delay(e){return new Promise(s=>setTimeout(()=>s(!0),e))}processHeaders(e){if(!e.headers)return{};let s={};if(e.headers instanceof Headers)for(let[t,n]of e.headers.entries())s[t]=n;else s={...e.headers};return s}outputResponse(e,s,t=null){let n=typeof s.defaultResponse<"u"?s.defaultResponse:this.defaultResponse;return e?(s.flattenResponse||this.flattenResponse)&&typeof e.data<"u"?e.data!==null&&typeof e.data=="object"&&typeof e.data.data<"u"&&Object.keys(e.data).length===1?e.data.data:e.data:e!==null&&typeof e=="object"&&e.constructor===Object&&Object.keys(e).length===0?n:this.isCustomFetcher()?e:(t!==null&&(t==null||delete t.response,t==null||delete t.request,t==null||delete t.config),{body:e.body,blob:e.blob,json:e.json,text:e.text,clone:e.clone,bodyUsed:e.bodyUsed,arrayBuffer:e.arrayBuffer,formData:e.formData,ok:e.ok,redirected:e.redirected,type:e.type,url:e.url,status:e.status,statusText:e.statusText,error:t,data:e.data,headers:this.processHeaders(e),config:s}):n}};function O(u){let e=u.endpoints,s=new R(u);function t(){return s.getInstance()}function n(o){return console.error(`${o} endpoint must be added to 'endpoints'.`),Promise.resolve(null)}async function a(o,i={},y={},p={}){let h={...e[o]};return await s.request(h.url,i,{...h,...p,urlPathParams:y})}function l(o){return o in r?r[o]:e[o]?r.request.bind(null,o):n.bind(null,o)}let r={config:u,endpoints:e,requestHandler:s,getInstance:t,request:a};return new Proxy(r,{get:(o,i)=>l(i)})}async function L(u,e={}){return new R(e).request(u,e.body||e.data||e.params,e)}export{O as createApiFetcher,L as fetchf};
//# sourceMappingURL=index.mjs.map