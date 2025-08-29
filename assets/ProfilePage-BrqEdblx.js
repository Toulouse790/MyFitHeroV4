import{d as q,e as ae,r as u,j as t,L as V,f as O}from"./index-Dc4E0O40.js";import{u as fe}from"./use-toast-CQYYpnuY.js";import{U as be}from"./user-xuTxvCKI.js";import ve from"./UserProfileTabs-Mml0bcTb.js";import{T as K}from"./trending-up-D-SeHVAh.js";import{T as ye}from"./trending-down-Bbv5GkPU.js";import{M as je}from"./minus-Ca5Z2btx.js";import{A as we}from"./activity-C-HzZOUm.js";import{W as Ne}from"./wifi-CfySRUwH.js";import{R as ee}from"./refresh-cw-CYnbanpR.js";import{C as ke}from"./calendar-BzaNe4Qg.js";import"./index-DwU3ZdQF.js";/**
 * @license lucide-react v0.541.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Se=[["path",{d:"m7 7 10 10-5 5V2l5 5L7 17",key:"1q5490"}]],Ee=q("bluetooth",Se);/**
 * @license lucide-react v0.541.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const _e=[["path",{d:"M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z",key:"18u6gg"}],["circle",{cx:"12",cy:"13",r:"3",key:"1vg3eu"}]],te=q("camera",_e);/**
 * @license lucide-react v0.541.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $e=[["path",{d:"m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z",key:"7g6ntu"}],["path",{d:"m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z",key:"ijws7r"}],["path",{d:"M7 21h10",key:"1b0cd5"}],["path",{d:"M12 3v18",key:"108xh3"}],["path",{d:"M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2",key:"3gwbw2"}]],se=q("scale",$e);/**
 * @license lucide-react v0.541.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ze=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],Ce=q("x",ze),Ie=({currentAvatar:e,onAvatarChange:s,size:r="md",editable:n=!0})=>{const{toast:l}=fe(),{appStoreUser:i,updateAppStoreUserProfile:o}=ae(),[c,d]=u.useState(!1),[p,x]=u.useState(null),b=u.useRef(null),y={sm:"w-16 h-16",md:"w-24 h-24",lg:"w-32 h-32"},P={sm:16,md:20,lg:24},D=g=>{var j;const v=(j=g.target.files)==null?void 0:j[0];if(!v)return;if(!v.type.startsWith("image/")){l({title:"Erreur",description:"Veuillez sélectionner une image valide.",variant:"destructive"});return}if(v.size>5*1024*1024){l({title:"Erreur",description:"L'image ne doit pas dépasser 5MB.",variant:"destructive"});return}const z=new FileReader;z.onload=$=>{var f;x((f=$.target)==null?void 0:f.result)},z.readAsDataURL(v),M(v)},M=async g=>{if(i!=null&&i.id){d(!0);try{const v=g.name.split(".").pop(),j=`avatars/${`${i.id}-${Date.now()}.${v}`}`,{error:$}=await O.storage.from("user-avatars").upload(j,g,{cacheControl:"3600",upsert:!0});if($)throw $;const{data:f}=O.storage.from("user-avatars").getPublicUrl(j),W=f.publicUrl,{error:L}=await O.from("user_profiles").update({avatar_url:W,updated_at:new Date().toISOString()}).eq("id",i.id);if(L)throw L;o({...i,avatar_url:W}),s==null||s(W),x(null),l({title:"Photo mise à jour",description:"Votre photo de profil a été mise à jour avec succès."})}catch(v){console.error("Erreur upload avatar:",v),x(null),l({title:"Erreur",description:"Impossible de mettre à jour votre photo.",variant:"destructive"})}finally{d(!1)}}},T=async()=>{if(i!=null&&i.id){d(!0);try{const{error:g}=await O.from("user_profiles").update({avatar_url:null,updated_at:new Date().toISOString()}).eq("id",i.id);if(g)throw g;o({...i,avatar_url:null}),s==null||s(""),x(null),l({title:"Photo supprimée",description:"Votre photo de profil a été supprimée."})}catch(g){console.error("Erreur suppression avatar:",g),l({title:"Erreur",description:"Impossible de supprimer votre photo.",variant:"destructive"})}finally{d(!1)}}},A=()=>{var g;(g=b.current)==null||g.click()},k=p||e||(i==null?void 0:i.avatar_url)||void 0;return t.jsxs("div",{className:"relative group",children:[t.jsxs("div",{className:`${y[r]} rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative`,children:[k?t.jsx("img",{src:k,alt:"Avatar",className:"w-full h-full object-cover"}):t.jsx(be,{className:"text-white",size:P[r]}),c&&t.jsx("div",{className:"absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center",children:t.jsx(V,{className:"text-white animate-spin",size:P[r]})})]}),n&&t.jsx("div",{className:"absolute inset-0 rounded-full flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300",children:t.jsxs("div",{className:"opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2",children:[t.jsx("button",{onClick:A,className:"p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors",title:"Changer la photo",disabled:c,children:t.jsx(te,{size:16})}),k&&t.jsx("button",{onClick:T,className:"p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors",title:"Supprimer la photo",disabled:c,children:t.jsx(Ce,{size:16})})]})}),t.jsx("input",{ref:b,type:"file",accept:"image/*",onChange:D,className:"hidden"}),n&&!k&&t.jsx("button",{onClick:A,className:"absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg",title:"Ajouter une photo",disabled:c,children:t.jsx(te,{size:16})})]})};let Pe={data:""},Ae=e=>typeof window=="object"?((e?e.querySelector("#_goober"):window._goober)||Object.assign((e||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:e||Pe,Le=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,Fe=/\/\*[^]*?\*\/|  +/g,re=/\n+/g,E=(e,s)=>{let r="",n="",l="";for(let i in e){let o=e[i];i[0]=="@"?i[1]=="i"?r=i+" "+o+";":n+=i[1]=="f"?E(o,i):i+"{"+E(o,i[1]=="k"?"":s)+"}":typeof o=="object"?n+=E(o,s?s.replace(/([^,])+/g,c=>i.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,d=>/&/.test(d)?d.replace(/&/g,c):c?c+" "+d:d)):i):o!=null&&(i=/^--/.test(i)?i:i.replace(/[A-Z]/g,"-$&").toLowerCase(),l+=E.p?E.p(i,o):i+":"+o+";")}return r+(s&&l?s+"{"+l+"}":l)+n},w={},ie=e=>{if(typeof e=="object"){let s="";for(let r in e)s+=r+ie(e[r]);return s}return e},De=(e,s,r,n,l)=>{let i=ie(e),o=w[i]||(w[i]=(d=>{let p=0,x=11;for(;p<d.length;)x=101*x+d.charCodeAt(p++)>>>0;return"go"+x})(i));if(!w[o]){let d=i!==e?e:(p=>{let x,b,y=[{}];for(;x=Le.exec(p.replace(Fe,""));)x[4]?y.shift():x[3]?(b=x[3].replace(re," ").trim(),y.unshift(y[0][b]=y[0][b]||{})):y[0][x[1]]=x[2].replace(re," ").trim();return y[0]})(e);w[o]=E(l?{["@keyframes "+o]:d}:d,r?"":"."+o)}let c=r&&w.g?w.g:null;return r&&(w.g=w[o]),((d,p,x,b)=>{b?p.data=p.data.replace(b,d):p.data.indexOf(d)===-1&&(p.data=x?d+p.data:p.data+d)})(w[o],s,n,c),o},Me=(e,s,r)=>e.reduce((n,l,i)=>{let o=s[i];if(o&&o.call){let c=o(r),d=c&&c.props&&c.props.className||/^go/.test(c)&&c;o=d?"."+d:c&&typeof c=="object"?c.props?"":E(c,""):c===!1?"":c}return n+l+(o??"")},"");function H(e){let s=this||{},r=e.call?e(s.p):e;return De(r.unshift?r.raw?Me(r,[].slice.call(arguments,1),s.p):r.reduce((n,l)=>Object.assign(n,l&&l.call?l(s.p):l),{}):r,Ae(s.target),s.g,s.o,s.k)}let oe,B,Z;H.bind({g:1});let N=H.bind({k:1});function Te(e,s,r,n){E.p=s,oe=e,B=r,Z=n}function _(e,s){let r=this||{};return function(){let n=arguments;function l(i,o){let c=Object.assign({},i),d=c.className||l.className;r.p=Object.assign({theme:B&&B()},c),r.o=/ *go\d+/.test(d),c.className=H.apply(r,n)+(d?" "+d:"");let p=e;return e[0]&&(p=c.as||e,delete c.as),Z&&p[0]&&Z(c),oe(p,c)}return l}}var We=e=>typeof e=="function",G=(e,s)=>We(e)?e(s):e,Re=(()=>{let e=0;return()=>(++e).toString()})(),Ue=(()=>{let e;return()=>{if(e===void 0&&typeof window<"u"){let s=matchMedia("(prefers-reduced-motion: reduce)");e=!s||s.matches}return e}})(),Oe=20,ne="default",le=(e,s)=>{let{toastLimit:r}=e.settings;switch(s.type){case 0:return{...e,toasts:[s.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(o=>o.id===s.toast.id?{...o,...s.toast}:o)};case 2:let{toast:n}=s;return le(e,{type:e.toasts.find(o=>o.id===n.id)?1:0,toast:n});case 3:let{toastId:l}=s;return{...e,toasts:e.toasts.map(o=>o.id===l||l===void 0?{...o,dismissed:!0,visible:!1}:o)};case 4:return s.toastId===void 0?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(o=>o.id!==s.toastId)};case 5:return{...e,pausedAt:s.time};case 6:let i=s.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(o=>({...o,pauseDuration:o.pauseDuration+i}))}}},qe=[],He={toasts:[],pausedAt:void 0,settings:{toastLimit:Oe}},I={},ce=(e,s=ne)=>{I[s]=le(I[s]||He,e),qe.forEach(([r,n])=>{r===s&&n(I[s])})},de=e=>Object.keys(I).forEach(s=>ce(e,s)),Ve=e=>Object.keys(I).find(s=>I[s].toasts.some(r=>r.id===e)),J=(e=ne)=>s=>{ce(s,e)},Be=(e,s="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:s,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:(r==null?void 0:r.id)||Re()}),F=e=>(s,r)=>{let n=Be(s,e,r);return J(n.toasterId||Ve(n.id))({type:2,toast:n}),n.id},m=(e,s)=>F("blank")(e,s);m.error=F("error");m.success=F("success");m.loading=F("loading");m.custom=F("custom");m.dismiss=(e,s)=>{let r={type:3,toastId:e};s?J(s)(r):de(r)};m.dismissAll=e=>m.dismiss(void 0,e);m.remove=(e,s)=>{let r={type:4,toastId:e};s?J(s)(r):de(r)};m.removeAll=e=>m.remove(void 0,e);m.promise=(e,s,r)=>{let n=m.loading(s.loading,{...r,...r==null?void 0:r.loading});return typeof e=="function"&&(e=e()),e.then(l=>{let i=s.success?G(s.success,l):void 0;return i?m.success(i,{id:n,...r,...r==null?void 0:r.success}):m.dismiss(n),l}).catch(l=>{let i=s.error?G(s.error,l):void 0;i?m.error(i,{id:n,...r,...r==null?void 0:r.error}):m.dismiss(n)}),e};var Ze=N`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,Ge=N`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Je=N`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,Qe=_("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${Ze} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${Ge} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${Je} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,Xe=N`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,Ye=_("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${Xe} 1s linear infinite;
`,Ke=N`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,et=N`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,tt=_("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${Ke} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${et} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,st=_("div")`
  position: absolute;
`,rt=_("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,at=N`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,it=_("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${at} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,ot=({toast:e})=>{let{icon:s,type:r,iconTheme:n}=e;return s!==void 0?typeof s=="string"?u.createElement(it,null,s):s:r==="blank"?null:u.createElement(rt,null,u.createElement(Ye,{...n}),r!=="loading"&&u.createElement(st,null,r==="error"?u.createElement(Qe,{...n}):u.createElement(tt,{...n})))},nt=e=>`
0% {transform: translate3d(0,${e*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,lt=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e*-150}%,-1px) scale(.6); opacity:0;}
`,ct="0%{opacity:0;} 100%{opacity:1;}",dt="0%{opacity:1;} 100%{opacity:0;}",ut=_("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,mt=_("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,pt=(e,s)=>{let r=e.includes("top")?1:-1,[n,l]=Ue()?[ct,dt]:[nt(r),lt(r)];return{animation:s?`${N(n)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${N(l)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}};u.memo(({toast:e,position:s,style:r,children:n})=>{let l=e.height?pt(e.position||s||"top-center",e.visible):{opacity:0},i=u.createElement(ot,{toast:e}),o=u.createElement(mt,{...e.ariaProps},G(e.message,e));return u.createElement(ut,{className:e.className,style:{...l,...r,...e.style}},typeof n=="function"?n({icon:i,message:o}):u.createElement(u.Fragment,null,i,o))});Te(u.createElement);H`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;const _t=()=>{var Y;const{appStoreUser:e,connectedScales:s,weightHistory:r,updateUserProfile:n,addConnectedScale:l,addWeightEntry:i}=ae(),[o,c]=u.useState(""),[d,p]=u.useState(""),[x,b]=u.useState(""),[y,P]=u.useState(""),[D,M]=u.useState("moderate"),[T,A]=u.useState("maintain"),[k,g]=u.useState(!1),[v,z]=u.useState(!1),[j,$]=u.useState(!1),[f,W]=u.useState(!1),[L,xt]=u.useState(null),R=e,C=e;u.useEffect(()=>{},[]),u.useEffect(()=>{var a,h,U;e&&(c(((a=e.weight_kg)==null?void 0:a.toString())||""),p(((h=e.height_cm)==null?void 0:h.toString())||""),b(((U=e.age)==null?void 0:U.toString())||""),P(e.gender||""),M(e.activity_level||"moderate"),A(e.fitness_goal||"maintain"))},[e]);const ue=async()=>{if(!(e!=null&&e.id)){m.error("Utilisateur non connecté");return}try{await n({weight_kg:parseFloat(o)||void 0,height_cm:parseInt(d)||void 0,age:parseInt(x)||void 0,gender:y||void 0,activity_level:D,fitness_goal:T}),m.success("Profil mis à jour avec succès !")}catch(a){m.error("Erreur lors de la mise à jour du profil"),console.error("Profile update error:",a)}},me=async a=>{try{$(!0),await new Promise(U=>setTimeout(U,2e3));const h=Math.random()*20+60;c(h.toFixed(1)),m.success("Poids synchronisé avec succès !")}catch(h){m.error("Erreur lors de la synchronisation"),console.error("Scale sync error:",h)}finally{$(!1)}},pe=async()=>{try{z(!0),await new Promise(h=>setTimeout(h,3e3));const a=[];a.length===0?m.success("Recherche terminée. Aucune nouvelle balance trouvée."):m.success(`${a.length} balance(s) trouvée(s)`)}catch(a){m.error("Erreur lors de la recherche"),console.error("Scale scan error:",a)}finally{z(!1)}},xe=()=>{const a=parseFloat(o),h=parseInt(d)/100;return a&&h?(a/(h*h)).toFixed(1):null},he=()=>{if(r.length<2)return null;const a=r.slice(-2),h=a[1].weight-a[0].weight;return{type:h>.5?"up":h<-.5?"down":"stable",diff:Math.abs(h)}},ge=()=>r.length>0?r[r.length-1].weight:null,Q=xe(),S=he(),X=ge();return f&&!R?t.jsx("div",{className:"min-h-screen bg-gray-50 flex items-center justify-center",children:t.jsxs("div",{className:"flex items-center gap-2",children:[t.jsx(V,{className:"animate-spin",size:24}),t.jsx("span",{children:"Chargement du profil..."})]})}):t.jsx("div",{className:"min-h-screen bg-gray-50 pb-20",children:t.jsxs("div",{className:"container mx-auto px-4 py-6 max-w-2xl",children:[L&&t.jsx("div",{className:"bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4",children:L}),t.jsx("div",{className:"bg-white rounded-xl shadow-sm p-6 mb-6",children:t.jsxs("div",{className:"flex flex-col items-center",children:[t.jsx(Ie,{}),t.jsx("h1",{className:"text-2xl font-bold mt-4 text-gray-900",children:(R==null?void 0:R.displayName)||((Y=C==null?void 0:C.email)==null?void 0:Y.split("@")[0])||"Utilisateur"}),t.jsx("p",{className:"text-gray-500 mt-1",children:C==null?void 0:C.email}),t.jsxs("div",{className:"flex items-center gap-6 mt-4 text-sm",children:[Q&&t.jsxs("div",{className:"text-center",children:[t.jsx("div",{className:"font-semibold text-blue-600",children:Q}),t.jsx("div",{className:"text-gray-500",children:"IMC"})]}),S&&t.jsxs("div",{className:"text-center",children:[t.jsxs("div",{className:`font-semibold flex items-center gap-1 ${S.type==="up"?"text-red-500":S.type==="down"?"text-green-500":"text-gray-500"}`,children:[S.type==="up"&&t.jsx(K,{size:16}),S.type==="down"&&t.jsx(ye,{size:16}),S.type==="stable"&&t.jsx(je,{size:16}),S.diff>0?`${S.diff.toFixed(1)}kg`:"Stable"]}),t.jsx("div",{className:"text-gray-500",children:"Tendance"})]}),X&&t.jsxs("div",{className:"text-center",children:[t.jsxs("div",{className:"font-semibold text-green-600",children:[X," kg"]}),t.jsx("div",{className:"text-gray-500",children:"Poids actuel"})]})]})]})}),t.jsxs("div",{className:"bg-white rounded-xl shadow-sm p-6 mb-6",children:[t.jsxs("h2",{className:"text-lg font-semibold mb-4 flex items-center gap-2",children:[t.jsx(we,{className:"text-blue-500",size:20}),"Données physiques"]}),t.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[t.jsxs("div",{children:[t.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Poids actuel (kg)"}),t.jsx("input",{type:"number",min:"20",max:"300",step:"0.1",value:o,onChange:a=>c(a.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",placeholder:"Ex: 70.5",disabled:f})]}),t.jsxs("div",{children:[t.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Taille (cm)"}),t.jsx("input",{type:"number",min:"100",max:"250",value:d,onChange:a=>p(a.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",placeholder:"Ex: 175",disabled:f})]}),t.jsxs("div",{children:[t.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Âge"}),t.jsx("input",{type:"number",min:"10",max:"120",value:x,onChange:a=>b(a.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",placeholder:"Ex: 25",disabled:f})]}),t.jsxs("div",{children:[t.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Sexe"}),t.jsxs("select",{value:y,onChange:a=>P(a.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",disabled:f,children:[t.jsx("option",{value:"",children:"Sélectionner"}),t.jsx("option",{value:"male",children:"Homme"}),t.jsx("option",{value:"female",children:"Femme"}),t.jsx("option",{value:"other",children:"Autre"})]})]}),t.jsxs("div",{children:[t.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Niveau d'activité"}),t.jsxs("select",{value:D,onChange:a=>M(a.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",disabled:f,children:[t.jsx("option",{value:"sedentary",children:"Sédentaire"}),t.jsx("option",{value:"light",children:"Légèrement actif"}),t.jsx("option",{value:"moderate",children:"Modérément actif"}),t.jsx("option",{value:"active",children:"Très actif"}),t.jsx("option",{value:"extra_active",children:"Extrêmement actif"})]})]}),t.jsxs("div",{children:[t.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Objectif principal"}),t.jsxs("select",{value:T,onChange:a=>A(a.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",disabled:f,children:[t.jsx("option",{value:"lose_weight",children:"Perdre du poids"}),t.jsx("option",{value:"maintain",children:"Maintenir le poids"}),t.jsx("option",{value:"gain_weight",children:"Prendre du poids"}),t.jsx("option",{value:"build_muscle",children:"Prendre du muscle"}),t.jsx("option",{value:"improve_fitness",children:"Améliorer la condition physique"})]})]})]}),t.jsx("button",{onClick:ue,disabled:f,className:"w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2",children:f?t.jsxs(t.Fragment,{children:[t.jsx(V,{className:"animate-spin",size:16}),"Enregistrement..."]}):"Enregistrer les modifications"})]}),t.jsxs("div",{className:"bg-white rounded-xl shadow-sm p-6 mb-6",children:[t.jsxs("h2",{className:"text-lg font-semibold mb-4 flex items-center gap-2",children:[t.jsx(se,{className:"text-green-500",size:20}),"Balance connectée"]}),s.length>0?t.jsx("div",{className:"space-y-4",children:s.map(a=>t.jsxs("div",{className:"border border-gray-200 rounded-lg p-4",children:[t.jsxs("div",{className:"flex items-center justify-between mb-3",children:[t.jsxs("div",{className:"flex items-center gap-3",children:[t.jsxs("div",{className:`p-2 rounded-full ${a.isConnected?"bg-green-100":"bg-red-100"}`,children:[a.connectionType==="bluetooth"&&t.jsx(Ee,{size:16,className:a.isConnected?"text-green-600":"text-red-600"}),a.connectionType==="wifi"&&t.jsx(Ne,{size:16,className:a.isConnected?"text-green-600":"text-red-600"})]}),t.jsxs("div",{children:[t.jsx("h3",{className:"font-medium",children:a.name}),t.jsxs("p",{className:"text-sm text-gray-500",children:[a.brand," ",a.model]})]})]}),t.jsxs("div",{className:"flex items-center gap-2",children:[a.batteryLevel&&t.jsxs("div",{className:"text-sm text-gray-500",children:["🔋 ",a.batteryLevel,"%"]}),t.jsx("span",{className:`px-2 py-1 rounded-full text-xs font-medium ${a.isConnected?"bg-green-100 text-green-800":"bg-red-100 text-red-800"}`,children:a.isConnected?"Connectée":"Déconnectée"})]})]}),t.jsxs("div",{className:"flex items-center justify-between",children:[t.jsxs("div",{className:"text-sm text-gray-500",children:["Dernière synchro:"," ",a.lastSync?new Date(a.lastSync).toLocaleString("fr-FR"):"Jamais"]}),t.jsxs("button",{onClick:()=>me(a.id),disabled:!a.isConnected||j,className:"flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors",children:[t.jsx(ee,{className:j?"animate-spin":"",size:16}),j?"Synchronisation...":"Synchroniser"]})]})]},a.id))}):t.jsxs("div",{className:"text-center py-8",children:[t.jsx(se,{className:"mx-auto text-gray-400 mb-4",size:48}),t.jsx("h3",{className:"text-lg font-medium text-gray-900 mb-2",children:"Aucune balance connectée"}),t.jsx("p",{className:"text-gray-500 mb-4",children:"Connectez votre balance pour synchroniser automatiquement votre poids"})]}),t.jsx("button",{onClick:pe,disabled:v,className:"w-full mt-4 border-2 border-dashed border-gray-300 hover:border-blue-400 text-gray-600 hover:text-blue-600 font-medium py-3 px-4 rounded-lg transition-colors",children:v?t.jsxs("span",{className:"flex items-center justify-center gap-2",children:[t.jsx(ee,{className:"animate-spin",size:16}),"Recherche en cours..."]}):"+ Ajouter une balance"})]}),t.jsxs("div",{className:"bg-white rounded-xl shadow-sm p-6 mb-6",children:[t.jsxs("div",{className:"flex items-center justify-between mb-4",children:[t.jsxs("h2",{className:"text-lg font-semibold flex items-center gap-2",children:[t.jsx(ke,{className:"text-purple-500",size:20}),"Historique du poids"]}),t.jsx("button",{onClick:()=>g(!k),className:"text-blue-600 hover:text-blue-700 text-sm font-medium",children:k?"Masquer":"Voir tout"})]}),r.length>0?t.jsx("div",{className:"space-y-3",children:(k?r:r.slice(0,3)).map((a,h)=>t.jsxs("div",{className:"flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0",children:[t.jsxs("div",{className:"flex items-center gap-3",children:[t.jsx("div",{className:`w-2 h-2 rounded-full ${a.source==="connected_scale"?"bg-green-500":a.source==="manual"?"bg-blue-500":"bg-gray-500"}`}),t.jsxs("div",{children:[t.jsxs("div",{className:"font-medium",children:[a.weight," kg"]}),t.jsx("div",{className:"text-sm text-gray-500",children:new Date(a.recorded_at).toLocaleDateString("fr-FR")})]})]}),t.jsx("div",{className:"text-xs text-gray-400 capitalize",children:a.source==="connected_scale"?"Balance":a.source==="manual"?"Manuel":"Import"})]},a.id||h))}):t.jsxs("div",{className:"text-center py-8 text-gray-500",children:[t.jsx(K,{className:"mx-auto mb-2",size:32}),t.jsx("p",{children:"Aucun historique de poids disponible"})]})]}),t.jsx(ve,{})]})})};export{_t as default};
//# sourceMappingURL=ProfilePage-BrqEdblx.js.map
