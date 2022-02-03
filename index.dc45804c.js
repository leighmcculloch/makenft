!function(e,t,n,o,r){var a="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof self?self:"undefined"!=typeof window?window:"undefined"!=typeof global?global:{},i="function"==typeof a.parcelRequire9328&&a.parcelRequire9328,s=i.cache||{},d="undefined"!=typeof module&&"function"==typeof module.require&&module.require.bind(module);function l(t,n){if(!s[t]){if(!e[t]){var o="function"==typeof a.parcelRequire9328&&a.parcelRequire9328;if(!n&&o)return o(t,!0);if(i)return i(t,!0);if(d&&"string"==typeof t)return d(t);var r=new Error("Cannot find module '"+t+"'");throw r.code="MODULE_NOT_FOUND",r}c.resolve=function(n){var o=e[t][1][n];return null!=o?o:n},c.cache={};var u=s[t]=new l.Module(t);e[t][0].call(u.exports,c,u,u.exports,this)}return s[t].exports;function c(e){var t=c.resolve(e);return!1===t?{}:l(t)}}l.isParcelRequire=!0,l.Module=function(e){this.id=e,this.bundle=l,this.exports={}},l.modules=e,l.cache=s,l.parent=i,l.register=function(t,n){e[t]=[function(e,t){t.exports=n},{}]},Object.defineProperty(l,"root",{get:function(){return a.parcelRequire9328}}),a.parcelRequire9328=l;for(var u=0;u<t.length;u++)l(t[u]);var c=l(n);"object"==typeof exports&&"undefined"!=typeof module?module.exports=c:"function"==typeof define&&define.amd&&define((function(){return c}))}({ep5eR:[function(e,t,n){var o=e("@parcel/transformer-js/src/esmodule-helpers.js"),r=e("stellar-sdk"),a=o.interopDefault(r),i=e("array-buffer-to-hex"),s=o.interopDefault(i),d=e("ipfs-core"),l=e("./rabet.js"),u=e("./config.js");function c(){const e=document.getElementById("network").value;return u.getConfig(e)}function f(e){return async()=>{try{await e()}catch(e){throw function(e){const t=document.getElementById("result");t.innerText=e.toString(),t.classList.remove("d-none"),t.classList.remove("alert-success"),t.classList.add("alert-danger")}(e.error||e),document.getElementById("create-button").removeAttribute("disabled"),document.getElementById("view-button").removeAttribute("disabled"),e}}}function p(){const e=document.getElementById("result");e.innerText="",e.classList.add("d-none")}async function m(){const e=document.getElementById("wallet-button");l.isConnected()?(e.classList.add("d-none"),document.getElementById("create-button").classList.add("d-block"),document.getElementById("view-button").classList.add("d-block")):(e.innerText="Add the Rabet extension to Chrome",window.setTimeout(m,500))}console.log("Version: test"),window.init=f(m),window.add=f((async function(){m(),l.isConnected()||window.open("https://rabet.io","_blank","noopener")})),window.create=f((async function(){p(),document.getElementById("create-button").setAttribute("disabled","disabled"),document.getElementById("view-button").setAttribute("disabled","disabled");const{code:e,issuer:t,xdr:n}=await w(),o=await l.signTransaction(n,c().network);console.log(`Transaction signed: ${o}`);const r=a.default.TransactionBuilder.fromXDR(o,c().networkPassphrase),i=await c().horizonServer.submitTransaction(r);console.log(i),function(e){const t=document.getElementById("result");t.innerHTML=e,t.classList.remove("d-none"),t.classList.remove("alert-danger"),t.classList.add("alert-success")}(`🎉 View your NFT <a href="${c().viewUrl(e,t)}">here</a>.`),document.getElementById("create-button").removeAttribute("disabled"),document.getElementById("view-button").removeAttribute("disabled")})),window.view=f((async function(){p(),document.getElementById("create-button").setAttribute("disabled","disabled"),document.getElementById("view-button").setAttribute("disabled","disabled");const{xdr:e}=await w(),t=`https://laboratory.stellar.org/#xdr-viewer?type=TransactionEnvelope&input=${encodeURIComponent(e)}`;window.open(t,"_blank","noopener"),document.getElementById("create-button").removeAttribute("disabled"),document.getElementById("view-button").removeAttribute("disabled")})),window.upload=f((async function(){const e=document.getElementById("file-upload"),t=document.getElementById("file-label");t.innerText="";const n=document.getElementById("file-preview-group"),o=document.getElementById("file-preview");for(;o.firstChild;)o.removeChild(o.firstChild);if(e.files.length>0){const r=e.files[0],a=e.value.replace("C:\\fakepath\\",""),i=r.size/1024;t.innerText=`${a} (${i} KB)`;const s=window.URL.createObjectURL(r),d=document.createElement("img");d.src=s,o.appendChild(d),n.classList.remove("d-none")}else n.classList.add("d-none")}));let b=null;async function y(){return null!==b||(b=await d.create()),b}async function w(){const e=document.getElementById("code").value,t=document.getElementById("quantity").value,n=document.getElementById("file-upload"),o=document.getElementById("description").value;let r=[],i=null;if(n.files.length>0){const e=n.files[0],t=await new Promise(((t,n)=>{const o=new FileReader;o.onloadend=()=>t(o.result),o.onerror=e=>n(e),o.readAsArrayBuffer(e)})),o=await y(),{cid:a}=await o.add(t);r=`ipfs://${a.string}`.match(/.{1,64}/g),i=await crypto.subtle.digest("SHA-256",t)}let d=null,u=null;if(o.length>0){const e={description:o},t=JSON.stringify(e,null,"\t"),n=(new TextEncoder).encode(t),r=await y(),{cid:a}=await r.add(n);d=`ipfs://${a.string}`.match(/.{1,64}/g),u=await crypto.subtle.digest("SHA-256",n)}const f=a.default.Keypair.random(),p=new a.default.Asset(e,f.publicKey()),m=await l.getPublicKey(),b=await(async()=>{try{return await c().horizonServer.loadAccount(m)}catch{throw new Error(`Your account ${m} does not exist on the Stellar ${c().network} network. It must be created before it can be used to submit transactions.`)}})(),w=await c().horizonServer.fetchBaseFee(),g=new a.default.TransactionBuilder(b,{fee:w,networkPassphrase:c().networkPassphrase});g.setTimeout(300),g.addMemo(a.default.Memo.text(`Create ${e} NFT ✨`)),g.addOperation(a.default.Operation.beginSponsoringFutureReserves({sponsoredId:f.publicKey()})),g.addOperation(a.default.Operation.createAccount({destination:f.publicKey(),startingBalance:"0"}));for(let e=0;e<r.length;e++)g.addOperation(a.default.Operation.manageData({source:f.publicKey(),name:`nft.asset.url[${e}]`,value:r[e]}));i&&g.addOperation(a.default.Operation.manageData({source:f.publicKey(),name:"nft.asset.sha256",value:s.default(i)}));for(let e=0;e<d.length;e++)g.addOperation(a.default.Operation.manageData({source:f.publicKey(),name:`nft.meta.url[${e}]`,value:d[e]}));u&&g.addOperation(a.default.Operation.manageData({source:f.publicKey(),name:"nft.meta.sha256",value:s.default(u)})),g.addOperation(a.default.Operation.endSponsoringFutureReserves({source:f.publicKey()})),g.addOperation(a.default.Operation.changeTrust({asset:p,limit:t})),g.addOperation(a.default.Operation.payment({source:f.publicKey(),destination:m,asset:p,amount:t})),g.addOperation(a.default.Operation.setOptions({source:f.publicKey(),setFlags:a.default.AuthImmutableFlag,masterWeight:0,lowThreshold:0,medThreshold:0,highThreshold:0}));const h=g.build();h.sign(f);const v=h.toEnvelope().toXDR("base64");return console.log(`Transaction built: ${v}`),{code:e,issuer:f.publicKey(),xdr:v}}m()},{"stellar-sdk":"9AhoN","array-buffer-to-hex":"1LeKs","ipfs-core":"egrwM","./rabet.js":"jJGt4","./config.js":"4O8Xx","@parcel/transformer-js/src/esmodule-helpers.js":"qayoQ"}],"1LeKs":[function(e,t,n){t.exports=function(e){if("object"!=typeof e||null===e||"number"!=typeof e.byteLength)throw new TypeError("Expected input to be an ArrayBuffer");for(var t,n=new Uint8Array(e),o="",r=0;r<n.length;r++)o+=1===(t=n[r].toString(16)).length?"0"+t:t;return o}},{}],jJGt4:[function(e,t,n){var o=e("@parcel/transformer-js/src/esmodule-helpers.js");function r(){return void 0!==window.rabet}async function a(){return(await window.rabet.connect()).publicKey}async function i(e,t){let n;switch(t){case"testnet":n="testnet";break;case"pubnet":n="mainnet";break;default:throw`Network '${t} unsupported by Rabet. Only pubnet and testnet are supported.`}return(await window.rabet.sign(e,n)).xdr}o.defineInteropFlag(n),o.export(n,"isConnected",(()=>r)),o.export(n,"getPublicKey",(()=>a)),o.export(n,"signTransaction",(()=>i))},{"@parcel/transformer-js/src/esmodule-helpers.js":"qayoQ"}]},["ep5eR"],"ep5eR");
//# sourceMappingURL=index.dc45804c.js.map
