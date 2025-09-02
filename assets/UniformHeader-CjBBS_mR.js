import{d as i,u as C,j as e}from"./index-CjnEZlsY.js";import{B as t,d as U}from"./badge-0XDKnG36.js";import{T as A}from"./trending-up-Cmv-0pKX.js";import{T as M}from"./trophy-CS6fcHcf.js";import{U as T}from"./user-BtYr8gLe.js";/**
 * @license lucide-react v0.541.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=[["path",{d:"m12 19-7-7 7-7",key:"1l729n"}],["path",{d:"M19 12H5",key:"x3x0zl"}]],H=i("arrow-left",L);/**
 * @license lucide-react v0.541.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const S=[["path",{d:"M10.268 21a2 2 0 0 0 3.464 0",key:"vwvbt9"}],["path",{d:"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326",key:"11g9vi"}]],E=i("bell",S);/**
 * @license lucide-react v0.541.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const I=[["path",{d:"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915",key:"1i5ecw"}],["circle",{cx:"12",cy:"12",r:"3",key:"1v7zrd"}]],R=i("settings",I),K=({title:g,subtitle:l,showBackButton:v=!1,showSettings:w=!1,showNotifications:f=!1,showProfile:y=!1,showStats:j=!1,showBadges:p=!1,onBack:c,onSettings:h,onNotifications:o,onProfile:n,onStats:x,onBadges:m,notificationCount:r=0,className:N="",rightContent:d,gradient:s=!1})=>{const[,a]=C(),b=()=>{c?c():window.history.back()},k=()=>{h?h():a("/settings")},$=()=>{n?n():a("/profile")},u=()=>{o?o():a("/notifications")},z=()=>{x?x():a("/analytics")},_=()=>{m?m():a("/achievements")},B=`
    ${s?"bg-gradient-to-r from-blue-600 to-purple-600 text-white":"bg-white border-b border-gray-200"}
    ${N}
  `;return e.jsx("header",{className:B,children:e.jsx("div",{className:"px-4 py-3",children:e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsxs("div",{className:"flex items-center space-x-3",children:[v&&e.jsx(t,{variant:"ghost",size:"sm",onClick:b,className:`${s?"text-white hover:bg-white/20":"text-gray-600 hover:bg-gray-100"}`,children:e.jsx(H,{className:"w-5 h-5"})}),e.jsxs("div",{children:[e.jsx("h1",{className:`text-lg font-semibold ${s?"text-white":"text-gray-900"}`,children:g}),l&&e.jsx("p",{className:`text-sm ${s?"text-white/80":"text-gray-600"}`,children:l})]})]}),e.jsxs("div",{className:"flex items-center space-x-2",children:[d&&e.jsx("div",{className:"mr-2",children:d}),w&&e.jsx(t,{variant:"ghost",size:"sm",onClick:k,className:`${s?"text-white hover:bg-white/20":"text-gray-600 hover:bg-gray-100"}`,children:e.jsx(R,{className:"w-5 h-5"})}),j&&e.jsx(t,{variant:"ghost",size:"sm",onClick:z,className:`${s?"text-white hover:bg-white/20":"text-gray-600 hover:bg-gray-100"}`,children:e.jsx(A,{className:"w-5 h-5"})}),p&&e.jsx(t,{variant:"ghost",size:"sm",onClick:_,className:`${s?"text-white hover:bg-white/20":"text-gray-600 hover:bg-gray-100"}`,children:e.jsx(M,{className:"w-5 h-5"})}),f&&e.jsxs(t,{variant:"ghost",size:"sm",onClick:u,className:`relative ${s?"text-white hover:bg-white/20":"text-gray-600 hover:bg-gray-100"}`,children:[e.jsx(E,{className:"w-5 h-5"}),r>0&&e.jsx(U,{variant:"destructive",className:"absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center",children:r>9?"9+":r})]}),y&&e.jsx(t,{variant:"ghost",size:"sm",onClick:$,className:`${s?"text-white hover:bg-white/20":"text-gray-600 hover:bg-gray-100"}`,children:e.jsx(T,{className:"w-5 h-5"})})]})]})})})};export{E as B,R as S,K as U};
//# sourceMappingURL=UniformHeader-CjBBS_mR.js.map
