"use strict";var _=Object.defineProperty,Fe=Object.defineProperties,qe=Object.getOwnPropertyDescriptor,He=Object.getOwnPropertyDescriptors,Ne=Object.getOwnPropertyNames,le=Object.getOwnPropertySymbols;var ue=Object.prototype.hasOwnProperty,Se=Object.prototype.propertyIsEnumerable;var ee=(e,t,n)=>t in e?_(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,C=(e,t)=>{for(var n in t||(t={}))ue.call(t,n)&&ee(e,n,t[n]);if(le)for(var n of le(t))Se.call(t,n)&&ee(e,n,t[n]);return e},B=(e,t)=>Fe(e,He(t));var Be=(e,t)=>{for(var n in t)_(e,n,{get:t[n],enumerable:!0})},Me=(e,t,n,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let s of Ne(t))!ue.call(e,s)&&s!==n&&_(e,s,{get:()=>t[s],enumerable:!(o=qe(t,s))||o.enumerable});return e};var Ue=e=>Me(_({},"__esModule",{value:!0}),e);var A=(e,t,n)=>ee(e,typeof t!="symbol"?t+"":t,n);var Le={};Be(Le,{createApiFetcher:()=>_e,fetchf:()=>xe});module.exports=Ue(Le);async function O(e,t){if(t){if(typeof t=="function"){let n=await t(e);n&&Object.assign(e,n)}else if(Array.isArray(t))for(let n of t){let o=await n(e);o&&Object.assign(e,o)}}}var L=class extends Error{constructor(n,o,s){super(n);A(this,"response");A(this,"request");A(this,"config");A(this,"status");A(this,"statusText");this.name="ResponseError",this.message=n,this.status=s.status,this.statusText=s.statusText,this.request=o,this.config=o,this.response=s}};var M="application/json",j="Content-Type",x="undefined",b="object",J="string",$="AbortError",fe="TimeoutError",pe="CanceledError",U="GET",de="HEAD";function te(e){return e instanceof URLSearchParams}function Re(e){let t="";for(let n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t+=n+":"+e[n]);return t}function ne(e){let t={},n=Object.keys(e);n.sort();for(let o=0,s=n.length;o<s;o++){let i=n[o];t[i]=e[i]}return t}function ye(e,t){return t?e.includes("?")?`${e}&${t}`:`${e}?${t}`:e}function me(e,t){if(!t)return e;if(te(t)){let l=t.toString();return ye(e,l)}let n=[],o=encodeURIComponent,s=(l,a)=>{a=typeof a=="function"?a():a,a=a===null||a===void 0?"":a,n[n.length]=o(l)+"="+o(a)},i=(l,a)=>{let d,g,y;if(l)if(Array.isArray(a))for(d=0,g=a.length;d<g;d++)i(l+"["+(typeof a[d]===b&&a[d]?d:"")+"]",a[d]);else if(typeof a===b&&a!==null)for(y in a)i(l+"["+y+"]",a[y]);else s(l,a);else if(Array.isArray(a))for(d=0,g=a.length;d<g;d++)s(a[d].name,a[d].value);else for(y in a)i(y,a[y]);return n},m=i("",t).join("&").replace(/%5B%5D/g,"[]");return ye(e,m)}function he(e,t){return t?e.replace(/:\w+/g,n=>{let o=n.substring(1);return String(t[o]?t[o]:n)}):e}function ge(e){let t=typeof e;if(t===x||e===null)return!1;if(t===J||t==="number"||t==="boolean"||Array.isArray(e))return!0;if(Buffer.isBuffer(e)||e instanceof Date)return!1;if(t===b){let n=Object.getPrototypeOf(e);if(n===Object.prototype||n===null||typeof e.toJSON=="function")return!0}return!1}async function re(e){return new Promise(t=>setTimeout(()=>t(!0),e))}function se(e){return e&&typeof e===b&&typeof e.data!==x&&Object.keys(e).length===1?se(e.data):e}function Pe(e){if(!e)return{};let t={};if(e instanceof Headers)e.forEach((n,o)=>{t[o]=n});else if(typeof e===b&&e!==null)for(let[n,o]of Object.entries(e))t[n.toLowerCase()]=o;return t}function F(e,t){e&&t in e&&delete e[t]}var k=new Map;async function Ee(e,t,n=0,o=!1,s=!0){let i=Date.now(),h=k.get(e);if(h){let a=h[3],d=h[0],g=h[1];if(!a&&i-h[2]<n)return d;a&&d.abort(new DOMException("Aborted due to new request",$)),g!==null&&clearTimeout(g),k.delete(e)}let m=new AbortController,l=s?setTimeout(()=>{let a=new DOMException(`${e.url} aborted due to timeout`,fe);v(e,a)},t):null;return k.set(e,[m,l,i,o]),m}async function v(e,t=null){let n=k.get(e);if(n){let o=n[0],s=n[1];t&&!o.signal.aborted&&o.abort(t),s!==null&&clearTimeout(s),k.delete(e)}}async function Ce(e){var o;if(!(e!=null&&e.body))return null;let t=String(((o=e.headers)==null?void 0:o.get(j))||"").split(";")[0],n;try{if(t.includes(M)||t.includes("+json"))n=await e.json();else if(t.includes("multipart/form-data"))n=await e.formData();else if(t.includes("application/octet-stream"))n=await e.blob();else if(t.includes("application/x-www-form-urlencoded"))n=await e.formData();else if(t.includes("text/"))n=await e.text();else try{n=await e.clone().json()}catch(s){n=await e.text()}}catch(s){n=null}return n}function G(e){let t=0;for(let n=0,o=e.length;n<o;n++){let s=e.charCodeAt(n);t=t*31+s|0}return String(t)}var oe=new Map;function Te(e){let{url:t="",method:n=U,headers:o={},body:s="",mode:i="cors",credentials:h="include",cache:m="default",redirect:l="follow",referrer:a="",integrity:d=""}=e;if(m==="reload")return"";let g=Re(ne(o)),y="";if(s!==null)if(typeof s=="string")y=G(s);else if(s instanceof FormData)s.forEach((r,u)=>{y+=u+"="+r+"&"}),y=G(y);else if(typeof Blob!==x&&s instanceof Blob||typeof File!==x&&s instanceof File)y="BF"+s.size+s.type;else if(s instanceof ArrayBuffer||ArrayBuffer.isView(s))y="AB"+s.byteLength;else{let r=typeof s===b?ne(s):String(s);y=G(JSON.stringify(r))}return n+t+i+h+m+l+a+d+g+y}function ke(e,t){return t?Date.now()-e>t*1e3:!1}function be(e,t){let n=oe.get(e);if(n){if(!ke(n.timestamp,t))return n;oe.delete(e)}return null}function we(e,t,n=!1){oe.set(e,{data:t,isLoading:n,timestamp:Date.now()})}var Qe={method:U,strategy:"reject",timeout:3e4,dedupeTime:1e3,defaultResponse:null,headers:{Accept:M+", text/plain, */*","Accept-Encoding":"gzip, deflate, br",[j]:M+";charset=utf-8"},retry:{delay:1e3,maxDelay:3e4,resetTimeout:!0,backoff:1.5,retryOn:[408,409,425,429,500,502,503,504]}};function z(e){let t=C(C({},Qe),e),n=t.fetcher,o=(n==null?void 0:n.create(t))||null,s=()=>o,i=(r,u)=>typeof r[u]!==x?r[u]:t[u],h=(...r)=>{var u;(u=t.logger)!=null&&u.warn&&t.logger.warn(...r)},m=(r,u,f)=>{let R=i(f,"method").toUpperCase(),P=R===U||R===de,c=he(r,i(f,"urlPathParams")),E=i(f,"params"),q=i(f,"body")||i(f,"data"),K=!!(u&&(P||q)),T;P||(T=q||u);let Q=i(f,"withCredentials")?"include":i(f,"credentials");F(f,"data"),F(f,"withCredentials");let D=E||K?me(c,E||u):c,w=D.includes("://")?"":i(f,"baseURL")||i(f,"apiUrl");return T&&typeof T!==J&&!te(T)&&ge(T)&&(T=JSON.stringify(T)),B(C({},f),{credentials:Q,body:T,method:R,url:w+D})},l=async(r,u)=>{d(r)||h("API ERROR",r),await O(r,u==null?void 0:u.onError),await O(r,t==null?void 0:t.onError)},a=async(r,u,f)=>{let R=d(r),P=i(f,"strategy"),c=i(f,"rejectCancelled");if(!(R&&!c)){if(P==="silent")await new Promise(()=>null);else if(P==="reject")return Promise.reject(r)}return y(u,f,r)},d=r=>r.name===$||r.name===pe,g=async(r,u=null,f=null)=>{var ie;let R=f||{},P=C(C({},t),R),c=null,E=m(r,u,P),{timeout:q,cancellable:K,dedupeTime:T,pollingInterval:Y,shouldStopPolling:Q,cacheTime:D,cacheKey:W}=P,w;if(W?w=W(E):w=Te(E),D&&w){let I=P.cacheBuster;if(!I||!I(E)){let p=be(w,D);if(p)return p.data}}let{retries:V=0,delay:Oe,backoff:De,retryOn:X,shouldRetry:ae,maxDelay:Ie,resetTimeout:Ae}=P.retry,H=0,Z=0,N=Oe;for(;H<=V;)try{let I=await Ee(E,q,T,K,!!(q&&(!V||Ae))),p=C({signal:I.signal},E);if(await O(p,R==null?void 0:R.onRequest),await O(p,t==null?void 0:t.onRequest),n!==null&&o!==null?c=await o.request(p):c=await fetch(p.url,p),c instanceof Response&&(c.config=p,c.data=await Ce(c),!c.ok))throw new L(`${p.url} failed! Status: ${c.status||null}`,p,c);if(await O(c,R==null?void 0:R.onResponse),await O(c,t==null?void 0:t.onResponse),v(E),Y&&(!Q||!Q(c,Z))){Z++,h(`Polling attempt ${Z}...`),await re(Y);continue}let S=y(c,p);if(D&&w){let ce=p.skipCache;(!ce||!ce(S,p))&&we(w,S)}return S}catch(I){let p=I,S=((ie=p==null?void 0:p.response)==null?void 0:ie.status)||(p==null?void 0:p.status)||0;if(H===V||!(!ae||await ae(p,H))||!(X!=null&&X.includes(S)))return await l(p,E),v(E),a(p,c,E);h(`Attempt ${H+1} failed. Retry in ${N}ms.`),await re(N),N*=De,N=Math.min(N,Ie),H++}return y(c,E)},y=(r,u,f=null)=>{let R=i(u,"defaultResponse"),P=i(u,"flattenResponse");if(!r)return P?R:{error:f,headers:null,data:R,config:u};F(f,"response"),F(f,"request"),F(f,"config");let c=r==null?void 0:r.data;return(c==null||typeof c===b&&Object.keys(c).length===0)&&(c=R),P?se(c):r instanceof Response?{body:r.body,bodyUsed:r.bodyUsed,formData:r.formData,ok:r.ok,redirected:r.redirected,type:r.type,url:r.url,status:r.status,statusText:r.statusText,blob:r.blob.bind(r),json:r.json.bind(r),text:r.text.bind(r),clone:r.clone.bind(r),arrayBuffer:r.arrayBuffer.bind(r),error:f,data:c,headers:Pe(r.headers),config:u}:r};return{getInstance:s,buildConfig:m,config:e,request:g}}function _e(e){let t=e.endpoints,n=z(e);function o(){return n.getInstance()}function s(l){return console.error(`Add ${l} to 'endpoints'.`),Promise.resolve(null)}async function i(l,a={},d={},g={}){let y=t[l];return await n.request(y.url,a,B(C(C({},y||{}),g),{urlPathParams:d}))}function h(l){return l in m?m[l]:t[l]?m.request.bind(null,l):s.bind(null,l)}let m={config:e,endpoints:t,requestHandler:n,getInstance:o,request:i};return new Proxy(m,{get:(l,a)=>h(a)})}async function xe(e,t={}){return z(t).request(e,null,t)}0&&(module.exports={createApiFetcher,fetchf});
//# sourceMappingURL=index.js.map