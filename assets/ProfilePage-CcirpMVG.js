import{d as F,e as ae,r as m,j as e,L as V,f as q}from"./index-CjnEZlsY.js";import{u as fe}from"./use-toast-1UJezmcI.js";import{U as be}from"./user-BtYr8gLe.js";import{T as K}from"./trending-up-Cmv-0pKX.js";import{M as ve}from"./minus-B_EWRt-2.js";import{A as ye}from"./activity-C-flMYAi.js";import{W as je}from"./wifi-C1x7sfWA.js";import{R as ee}from"./refresh-cw-CxIxu3Pr.js";import{C as Ne}from"./calendar-D7qE-8IO.js";import"./index-GGMoTRFm.js";/**
 * @license lucide-react v0.541.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const we=[["path",{d:"m7 7 10 10-5 5V2l5 5L7 17",key:"1q5490"}]],ke=F("bluetooth",we);/**
 * @license lucide-react v0.541.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Se=[["path",{d:"M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z",key:"18u6gg"}],["circle",{cx:"12",cy:"13",r:"3",key:"1vg3eu"}]],te=F("camera",Se);/**
 * @license lucide-react v0.541.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Ee=[["path",{d:"m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z",key:"7g6ntu"}],["path",{d:"m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z",key:"ijws7r"}],["path",{d:"M7 21h10",key:"1b0cd5"}],["path",{d:"M12 3v18",key:"108xh3"}],["path",{d:"M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2",key:"3gwbw2"}]],se=F("scale",Ee);/**
 * @license lucide-react v0.541.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const $e=[["path",{d:"M16 17h6v-6",key:"t6n2it"}],["path",{d:"m22 17-8.5-8.5-5 5L2 7",key:"x473p"}]],_e=F("trending-down",$e);/**
 * @license lucide-react v0.541.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const ze=[["path",{d:"M18 6 6 18",key:"1bl5f8"}],["path",{d:"m6 6 12 12",key:"d8bk6v"}]],Ce=F("x",ze),Pe=({currentAvatar:t,onAvatarChange:s,size:r="md",editable:n=!0})=>{const{toast:l}=fe(),{appStoreUser:a,updateAppStoreUserProfile:o}=ae(),[c,d]=m.useState(!1),[p,x]=m.useState(null),f=m.useRef(null),v={sm:"w-16 h-16",md:"w-24 h-24",lg:"w-32 h-32"},A={sm:16,md:20,lg:24},D=b=>{var j;const y=(j=b.target.files)==null?void 0:j[0];if(!y)return;if(!y.type.startsWith("image/")){l({title:"Erreur",description:"Veuillez sélectionner une image valide.",variant:"destructive"});return}if(y.size>5*1024*1024){l({title:"Erreur",description:"L'image ne doit pas dépasser 5MB.",variant:"destructive"});return}const C=new FileReader;C.onload=z=>{var g;x((g=z.target)==null?void 0:g.result)},C.readAsDataURL(y),T(y)},T=async b=>{if(a!=null&&a.id){d(!0);try{const y=b.name.split(".").pop(),j=`avatars/${`${a.id}-${Date.now()}.${y}`}`,{error:z}=await q.storage.from("user-avatars").upload(j,b,{cacheControl:"3600",upsert:!0});if(z)throw z;const{data:g}=q.storage.from("user-avatars").getPublicUrl(j),O=g.publicUrl,{error:S}=await q.from("user_profiles").update({avatar_url:O,updated_at:new Date().toISOString()}).eq("id",a.id);if(S)throw S;o({...a,avatar_url:O}),s==null||s(O),x(null),l({title:"Photo mise à jour",description:"Votre photo de profil a été mise à jour avec succès."})}catch{console.error("Erreur upload avatar:",error),x(null),l({title:"Erreur",description:"Impossible de mettre à jour votre photo.",variant:"destructive"})}finally{d(!1)}}},R=async()=>{if(a!=null&&a.id){d(!0);try{const{error:b}=await q.from("user_profiles").update({avatar_url:null,updated_at:new Date().toISOString()}).eq("id",a.id);if(b)throw b;o({...a,avatar_url:null}),s==null||s(""),x(null),l({title:"Photo supprimée",description:"Votre photo de profil a été supprimée."})}catch{console.error("Erreur suppression avatar:",error),l({title:"Erreur",description:"Impossible de supprimer votre photo.",variant:"destructive"})}finally{d(!1)}}},L=()=>{var b;(b=f.current)==null||b.click()},k=p||t||(a==null?void 0:a.avatar_url)||void 0;return e.jsxs("div",{className:"relative group",children:[e.jsxs("div",{className:`${v[r]} rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative`,children:[k?e.jsx("img",{src:k,alt:"Avatar",className:"w-full h-full object-cover"}):e.jsx(be,{className:"text-white",size:A[r]}),c&&e.jsx("div",{className:"absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center",children:e.jsx(V,{className:"text-white animate-spin",size:A[r]})})]}),n&&e.jsx("div",{className:"absolute inset-0 rounded-full flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300",children:e.jsxs("div",{className:"opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2",children:[e.jsx("button",{onClick:L,className:"p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors",title:"Changer la photo",disabled:c,children:e.jsx(te,{size:16})}),k&&e.jsx("button",{onClick:R,className:"p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors",title:"Supprimer la photo",disabled:c,children:e.jsx(Ce,{size:16})})]})}),e.jsx("input",{ref:f,type:"file",accept:"image/*",onChange:D,className:"hidden"}),n&&!k&&e.jsx("button",{onClick:L,className:"absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg",title:"Ajouter une photo",disabled:c,children:e.jsx(te,{size:16})})]})},Ie=[{id:"general",label:"Général"},{id:"goals",label:"Objectifs"},{id:"recovery",label:"Récupération"},{id:"settings",label:"Paramètres"}],Ae=({className:t="",onTabChange:s})=>{const[r,n]=m.useState("general"),l=a=>{n(a),s==null||s(a)};return e.jsxs("div",{className:`bg-white rounded-xl shadow-sm ${t}`,children:[e.jsx("div",{className:"border-b border-gray-200",children:e.jsx("nav",{className:"flex space-x-8 px-6","aria-label":"Tabs",children:Ie.map(a=>e.jsx("button",{onClick:()=>l(a.id),className:`py-4 px-1 border-b-2 font-medium text-sm ${r===a.id?"border-blue-500 text-blue-600":"border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}`,children:a.label},a.id))})}),e.jsxs("div",{className:"p-6",children:[r==="general"&&e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold mb-4",children:"Informations générales"}),e.jsx("p",{className:"text-gray-600",children:"Contenu de l'onglet général..."})]}),r==="goals"&&e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold mb-4",children:"Objectifs"}),e.jsx("p",{className:"text-gray-600",children:"Contenu de l'onglet objectifs..."})]}),r==="recovery"&&e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semibold mb-4",children:"Récupération"}),e.jsx("p",{className:"text-gray-600",children:"Contenu de l'onglet récupération..."})]}),r==="settings"&&e.jsxs("div",{children:[e.jsx("h3",{className:"text-lg font-semiblient mb-4",children:"Paramètres"}),e.jsx("p",{className:"text-gray-600",children:"Contenu de l'onglet paramètres..."})]})]})]})};let Le={data:""},Fe=t=>typeof window=="object"?((t?t.querySelector("#_goober"):window._goober)||Object.assign((t||document.head).appendChild(document.createElement("style")),{innerHTML:" ",id:"_goober"})).firstChild:t||Le,Me=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,De=/\/\*[^]*?\*\/|  +/g,re=/\n+/g,$=(t,s)=>{let r="",n="",l="";for(let a in t){let o=t[a];a[0]=="@"?a[1]=="i"?r=a+" "+o+";":n+=a[1]=="f"?$(o,a):a+"{"+$(o,a[1]=="k"?"":s)+"}":typeof o=="object"?n+=$(o,s?s.replace(/([^,])+/g,c=>a.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,d=>/&/.test(d)?d.replace(/&/g,c):c?c+" "+d:d)):a):o!=null&&(a=/^--/.test(a)?a:a.replace(/[A-Z]/g,"-$&").toLowerCase(),l+=$.p?$.p(a,o):a+":"+o+";")}return r+(s&&l?s+"{"+l+"}":l)+n},N={},ie=t=>{if(typeof t=="object"){let s="";for(let r in t)s+=r+ie(t[r]);return s}return t},Te=(t,s,r,n,l)=>{let a=ie(t),o=N[a]||(N[a]=(d=>{let p=0,x=11;for(;p<d.length;)x=101*x+d.charCodeAt(p++)>>>0;return"go"+x})(a));if(!N[o]){let d=a!==t?t:(p=>{let x,f,v=[{}];for(;x=Me.exec(p.replace(De,""));)x[4]?v.shift():x[3]?(f=x[3].replace(re," ").trim(),v.unshift(v[0][f]=v[0][f]||{})):v[0][x[1]]=x[2].replace(re," ").trim();return v[0]})(t);N[o]=$(l?{["@keyframes "+o]:d}:d,r?"":"."+o)}let c=r&&N.g?N.g:null;return r&&(N.g=N[o]),((d,p,x,f)=>{f?p.data=p.data.replace(f,d):p.data.indexOf(d)===-1&&(p.data=x?d+p.data:p.data+d)})(N[o],s,n,c),o},Re=(t,s,r)=>t.reduce((n,l,a)=>{let o=s[a];if(o&&o.call){let c=o(r),d=c&&c.props&&c.props.className||/^go/.test(c)&&c;o=d?"."+d:c&&typeof c=="object"?c.props?"":$(c,""):c===!1?"":c}return n+l+(o??"")},"");function H(t){let s=this||{},r=t.call?t(s.p):t;return Te(r.unshift?r.raw?Re(r,[].slice.call(arguments,1),s.p):r.reduce((n,l)=>Object.assign(n,l&&l.call?l(s.p):l),{}):r,Fe(s.target),s.g,s.o,s.k)}let oe,B,G;H.bind({g:1});let w=H.bind({k:1});function Oe(t,s,r,n){$.p=s,oe=t,B=r,G=n}function _(t,s){let r=this||{};return function(){let n=arguments;function l(a,o){let c=Object.assign({},a),d=c.className||l.className;r.p=Object.assign({theme:B&&B()},c),r.o=/ *go\d+/.test(d),c.className=H.apply(r,n)+(d?" "+d:"");let p=t;return t[0]&&(p=c.as||t,delete c.as),G&&p[0]&&G(c),oe(p,c)}return l}}var We=t=>typeof t=="function",Z=(t,s)=>We(t)?t(s):t,Ue=(()=>{let t=0;return()=>(++t).toString()})(),qe=(()=>{let t;return()=>{if(t===void 0&&typeof window<"u"){let s=matchMedia("(prefers-reduced-motion: reduce)");t=!s||s.matches}return t}})(),He=20,ne="default",le=(t,s)=>{let{toastLimit:r}=t.settings;switch(s.type){case 0:return{...t,toasts:[s.toast,...t.toasts].slice(0,r)};case 1:return{...t,toasts:t.toasts.map(o=>o.id===s.toast.id?{...o,...s.toast}:o)};case 2:let{toast:n}=s;return le(t,{type:t.toasts.find(o=>o.id===n.id)?1:0,toast:n});case 3:let{toastId:l}=s;return{...t,toasts:t.toasts.map(o=>o.id===l||l===void 0?{...o,dismissed:!0,visible:!1}:o)};case 4:return s.toastId===void 0?{...t,toasts:[]}:{...t,toasts:t.toasts.filter(o=>o.id!==s.toastId)};case 5:return{...t,pausedAt:s.time};case 6:let a=s.time-(t.pausedAt||0);return{...t,pausedAt:void 0,toasts:t.toasts.map(o=>({...o,pauseDuration:o.pauseDuration+a}))}}},Ve=[],Be={toasts:[],pausedAt:void 0,settings:{toastLimit:He}},I={},ce=(t,s=ne)=>{I[s]=le(I[s]||Be,t),Ve.forEach(([r,n])=>{r===s&&n(I[s])})},de=t=>Object.keys(I).forEach(s=>ce(t,s)),Ge=t=>Object.keys(I).find(s=>I[s].toasts.some(r=>r.id===t)),J=(t=ne)=>s=>{ce(s,t)},Ze=(t,s="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:s,ariaProps:{role:"status","aria-live":"polite"},message:t,pauseDuration:0,...r,id:(r==null?void 0:r.id)||Ue()}),M=t=>(s,r)=>{let n=Ze(s,t,r);return J(n.toasterId||Ge(n.id))({type:2,toast:n}),n.id},u=(t,s)=>M("blank")(t,s);u.error=M("error");u.success=M("success");u.loading=M("loading");u.custom=M("custom");u.dismiss=(t,s)=>{let r={type:3,toastId:t};s?J(s)(r):de(r)};u.dismissAll=t=>u.dismiss(void 0,t);u.remove=(t,s)=>{let r={type:4,toastId:t};s?J(s)(r):de(r)};u.removeAll=t=>u.remove(void 0,t);u.promise=(t,s,r)=>{let n=u.loading(s.loading,{...r,...r==null?void 0:r.loading});return typeof t=="function"&&(t=t()),t.then(l=>{let a=s.success?Z(s.success,l):void 0;return a?u.success(a,{id:n,...r,...r==null?void 0:r.success}):u.dismiss(n),l}).catch(l=>{let a=s.error?Z(s.error,l):void 0;a?u.error(a,{id:n,...r,...r==null?void 0:r.error}):u.dismiss(n)}),t};var Je=w`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,Qe=w`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,Xe=w`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,Ye=_("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${t=>t.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${Je} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${Qe} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${t=>t.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${Xe} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,Ke=w`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,et=_("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${t=>t.secondary||"#e0e0e0"};
  border-right-color: ${t=>t.primary||"#616161"};
  animation: ${Ke} 1s linear infinite;
`,tt=w`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,st=w`
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
}`,rt=_("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${t=>t.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${tt} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${st} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${t=>t.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,at=_("div")`
  position: absolute;
`,it=_("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,ot=w`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,nt=_("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${ot} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,lt=({toast:t})=>{let{icon:s,type:r,iconTheme:n}=t;return s!==void 0?typeof s=="string"?m.createElement(nt,null,s):s:r==="blank"?null:m.createElement(it,null,m.createElement(et,{...n}),r!=="loading"&&m.createElement(at,null,r==="error"?m.createElement(Ye,{...n}):m.createElement(rt,{...n})))},ct=t=>`
0% {transform: translate3d(0,${t*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,dt=t=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${t*-150}%,-1px) scale(.6); opacity:0;}
`,mt="0%{opacity:0;} 100%{opacity:1;}",ut="0%{opacity:1;} 100%{opacity:0;}",pt=_("div")`
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
`,xt=_("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,ht=(t,s)=>{let r=t.includes("top")?1:-1,[n,l]=qe()?[mt,ut]:[ct(r),dt(r)];return{animation:s?`${w(n)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${w(l)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}};m.memo(({toast:t,position:s,style:r,children:n})=>{let l=t.height?ht(t.position||s||"top-center",t.visible):{opacity:0},a=m.createElement(lt,{toast:t}),o=m.createElement(xt,{...t.ariaProps},Z(t.message,t));return m.createElement(pt,{className:t.className,style:{...l,...r,...t.style}},typeof n=="function"?n({icon:a,message:o}):m.createElement(m.Fragment,null,a,o))});Oe(m.createElement);H`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;const $t=()=>{var Y;const{appStoreUser:t,connectedScales:s,weightHistory:r,updateUserProfile:n,addConnectedScale:l,addWeightEntry:a}=ae(),[o,c]=m.useState(""),[d,p]=m.useState(""),[x,f]=m.useState(""),[v,A]=m.useState(""),[D,T]=m.useState("moderate"),[R,L]=m.useState("maintain"),[k,b]=m.useState(!1),[y,C]=m.useState(!1),[j,z]=m.useState(!1),[g,O]=m.useState(!1),[S,gt]=m.useState(null),W=t,P=t;m.useEffect(()=>{},[]),m.useEffect(()=>{var i,h,U;t&&(c(((i=t.weight_kg)==null?void 0:i.toString())||""),p(((h=t.height_cm)==null?void 0:h.toString())||""),f(((U=t.age)==null?void 0:U.toString())||""),A(t.gender||""),T(t.activity_level||"moderate"),L(t.fitness_goal||"maintain"))},[t]);const me=async()=>{if(!(t!=null&&t.id)){u.error("Utilisateur non connecté");return}try{await n({weight_kg:parseFloat(o)||void 0,height_cm:parseInt(d)||void 0,age:parseInt(x)||void 0,gender:v||void 0,activity_level:D,fitness_goal:R}),u.success("Profil mis à jour avec succès !")}catch{u.error("Erreur lors de la mise à jour du profil"),console.error("Profile update error:",S)}},ue=async i=>{try{z(!0),await new Promise(U=>setTimeout(U,2e3));const h=Math.random()*20+60;c(h.toFixed(1)),u.success("Poids synchronisé avec succès !")}catch{u.error("Erreur lors de la synchronisation"),console.error("Scale sync error:",S)}finally{z(!1)}},pe=async()=>{try{C(!0),await new Promise(h=>setTimeout(h,3e3));const i=[];i.length===0?u.success("Recherche terminée. Aucune nouvelle balance trouvée."):u.success(`${i.length} balance(s) trouvée(s)`)}catch{u.error("Erreur lors de la recherche"),console.error("Scale scan error:",S)}finally{C(!1)}},xe=()=>{const i=parseFloat(o),h=parseInt(d)/100;return i&&h?(i/(h*h)).toFixed(1):null},he=()=>{if(r.length<2)return null;const i=r.slice(-2),h=i[1].weight-i[0].weight;return{type:h>.5?"up":h<-.5?"down":"stable",diff:Math.abs(h)}},ge=()=>r.length>0?r[r.length-1].weight:null,Q=xe(),E=he(),X=ge();return g&&!W?e.jsx("div",{className:"min-h-screen bg-gray-50 flex items-center justify-center",children:e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx(V,{className:"animate-spin",size:24}),e.jsx("span",{children:"Chargement du profil..."})]})}):e.jsx("div",{className:"min-h-screen bg-gray-50 pb-20",children:e.jsxs("div",{className:"container mx-auto px-4 py-6 max-w-2xl",children:[S&&e.jsx("div",{className:"bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4",children:S}),e.jsx("div",{className:"bg-white rounded-xl shadow-sm p-6 mb-6",children:e.jsxs("div",{className:"flex flex-col items-center",children:[e.jsx(Pe,{}),e.jsx("h1",{className:"text-2xl font-bold mt-4 text-gray-900",children:(W==null?void 0:W.displayName)||((Y=P==null?void 0:P.email)==null?void 0:Y.split("@")[0])||"Utilisateur"}),e.jsx("p",{className:"text-gray-500 mt-1",children:P==null?void 0:P.email}),e.jsxs("div",{className:"flex items-center gap-6 mt-4 text-sm",children:[Q&&e.jsxs("div",{className:"text-center",children:[e.jsx("div",{className:"font-semibold text-blue-600",children:Q}),e.jsx("div",{className:"text-gray-500",children:"IMC"})]}),E&&e.jsxs("div",{className:"text-center",children:[e.jsxs("div",{className:`font-semibold flex items-center gap-1 ${E.type==="up"?"text-red-500":E.type==="down"?"text-green-500":"text-gray-500"}`,children:[E.type==="up"&&e.jsx(K,{size:16}),E.type==="down"&&e.jsx(_e,{size:16}),E.type==="stable"&&e.jsx(ve,{size:16}),E.diff>0?`${E.diff.toFixed(1)}kg`:"Stable"]}),e.jsx("div",{className:"text-gray-500",children:"Tendance"})]}),X&&e.jsxs("div",{className:"text-center",children:[e.jsxs("div",{className:"font-semibold text-green-600",children:[X," kg"]}),e.jsx("div",{className:"text-gray-500",children:"Poids actuel"})]})]})]})}),e.jsxs("div",{className:"bg-white rounded-xl shadow-sm p-6 mb-6",children:[e.jsxs("h2",{className:"text-lg font-semibold mb-4 flex items-center gap-2",children:[e.jsx(ye,{className:"text-blue-500",size:20}),"Données physiques"]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Poids actuel (kg)"}),e.jsx("input",{type:"number",min:"20",max:"300",step:"0.1",value:o,onChange:i=>c(i.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",placeholder:"Ex: 70.5",disabled:g})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Taille (cm)"}),e.jsx("input",{type:"number",min:"100",max:"250",value:d,onChange:i=>p(i.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",placeholder:"Ex: 175",disabled:g})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Âge"}),e.jsx("input",{type:"number",min:"10",max:"120",value:x,onChange:i=>f(i.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",placeholder:"Ex: 25",disabled:g})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Sexe"}),e.jsxs("select",{value:v,onChange:i=>A(i.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",disabled:g,children:[e.jsx("option",{value:"",children:"Sélectionner"}),e.jsx("option",{value:"male",children:"Homme"}),e.jsx("option",{value:"female",children:"Femme"}),e.jsx("option",{value:"other",children:"Autre"})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Niveau d'activité"}),e.jsxs("select",{value:D,onChange:i=>T(i.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",disabled:g,children:[e.jsx("option",{value:"sedentary",children:"Sédentaire"}),e.jsx("option",{value:"light",children:"Légèrement actif"}),e.jsx("option",{value:"moderate",children:"Modérément actif"}),e.jsx("option",{value:"active",children:"Très actif"}),e.jsx("option",{value:"extra_active",children:"Extrêmement actif"})]})]}),e.jsxs("div",{children:[e.jsx("label",{className:"block text-sm font-medium text-gray-700 mb-2",children:"Objectif principal"}),e.jsxs("select",{value:R,onChange:i=>L(i.target.value),className:"w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",disabled:g,children:[e.jsx("option",{value:"lose_weight",children:"Perdre du poids"}),e.jsx("option",{value:"maintain",children:"Maintenir le poids"}),e.jsx("option",{value:"gain_weight",children:"Prendre du poids"}),e.jsx("option",{value:"build_muscle",children:"Prendre du muscle"}),e.jsx("option",{value:"improve_fitness",children:"Améliorer la condition physique"})]})]})]}),e.jsx("button",{onClick:me,disabled:g,className:"w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2",children:g?e.jsxs(e.Fragment,{children:[e.jsx(V,{className:"animate-spin",size:16}),"Enregistrement..."]}):"Enregistrer les modifications"})]}),e.jsxs("div",{className:"bg-white rounded-xl shadow-sm p-6 mb-6",children:[e.jsxs("h2",{className:"text-lg font-semibold mb-4 flex items-center gap-2",children:[e.jsx(se,{className:"text-green-500",size:20}),"Balance connectée"]}),s.length>0?e.jsx("div",{className:"space-y-4",children:s.map(i=>e.jsxs("div",{className:"border border-gray-200 rounded-lg p-4",children:[e.jsxs("div",{className:"flex items-center justify-between mb-3",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsxs("div",{className:`p-2 rounded-full ${i.isConnected?"bg-green-100":"bg-red-100"}`,children:[i.connectionType==="bluetooth"&&e.jsx(ke,{size:16,className:i.isConnected?"text-green-600":"text-red-600"}),i.connectionType==="wifi"&&e.jsx(je,{size:16,className:i.isConnected?"text-green-600":"text-red-600"})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-medium",children:i.name}),e.jsxs("p",{className:"text-sm text-gray-500",children:[i.brand," ",i.model]})]})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[i.batteryLevel&&e.jsxs("div",{className:"text-sm text-gray-500",children:["🔋 ",i.batteryLevel,"%"]}),e.jsx("span",{className:`px-2 py-1 rounded-full text-xs font-medium ${i.isConnected?"bg-green-100 text-green-800":"bg-red-100 text-red-800"}`,children:i.isConnected?"Connectée":"Déconnectée"})]})]}),e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"text-sm text-gray-500",children:["Dernière synchro:"," ",i.lastSync?new Date(i.lastSync).toLocaleString("fr-FR"):"Jamais"]}),e.jsxs("button",{onClick:()=>ue(i.id),disabled:!i.isConnected||j,className:"flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors",children:[e.jsx(ee,{className:j?"animate-spin":"",size:16}),j?"Synchronisation...":"Synchroniser"]})]})]},i.id))}):e.jsxs("div",{className:"text-center py-8",children:[e.jsx(se,{className:"mx-auto text-gray-400 mb-4",size:48}),e.jsx("h3",{className:"text-lg font-medium text-gray-900 mb-2",children:"Aucune balance connectée"}),e.jsx("p",{className:"text-gray-500 mb-4",children:"Connectez votre balance pour synchroniser automatiquement votre poids"})]}),e.jsx("button",{onClick:pe,disabled:y,className:"w-full mt-4 border-2 border-dashed border-gray-300 hover:border-blue-400 text-gray-600 hover:text-blue-600 font-medium py-3 px-4 rounded-lg transition-colors",children:y?e.jsxs("span",{className:"flex items-center justify-center gap-2",children:[e.jsx(ee,{className:"animate-spin",size:16}),"Recherche en cours..."]}):"+ Ajouter une balance"})]}),e.jsxs("div",{className:"bg-white rounded-xl shadow-sm p-6 mb-6",children:[e.jsxs("div",{className:"flex items-center justify-between mb-4",children:[e.jsxs("h2",{className:"text-lg font-semibold flex items-center gap-2",children:[e.jsx(Ne,{className:"text-purple-500",size:20}),"Historique du poids"]}),e.jsx("button",{onClick:()=>b(!k),className:"text-blue-600 hover:text-blue-700 text-sm font-medium",children:k?"Masquer":"Voir tout"})]}),r.length>0?e.jsx("div",{className:"space-y-3",children:(k?r:r.slice(0,3)).map((i,h)=>e.jsxs("div",{className:"flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:`w-2 h-2 rounded-full ${i.source==="connected_scale"?"bg-green-500":i.source==="manual"?"bg-blue-500":"bg-gray-500"}`}),e.jsxs("div",{children:[e.jsxs("div",{className:"font-medium",children:[i.weight," kg"]}),e.jsx("div",{className:"text-sm text-gray-500",children:new Date(i.recorded_at).toLocaleDateString("fr-FR")})]})]}),e.jsx("div",{className:"text-xs text-gray-400 capitalize",children:i.source==="connected_scale"?"Balance":i.source==="manual"?"Manuel":"Import"})]},i.id||h))}):e.jsxs("div",{className:"text-center py-8 text-gray-500",children:[e.jsx(K,{className:"mx-auto mb-2",size:32}),e.jsx("p",{children:"Aucun historique de poids disponible"})]})]}),e.jsx(Ae,{})]})})};export{$t as default};
//# sourceMappingURL=ProfilePage-CcirpMVG.js.map
