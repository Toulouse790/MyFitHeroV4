var $=Object.defineProperty;var z=(c,r,s)=>r in c?$(c,r,{enumerable:!0,configurable:!0,writable:!0,value:s}):c[r]=s;var _=(c,r,s)=>z(c,typeof r!="symbol"?r+"":r,s);import{f as O,r as m,e as D,j as e}from"./index-CjnEZlsY.js";class E{constructor(){_(this,"baseUrl","/api/ai")}async analyzePatterns(r,s="7d"){try{const n=await fetch(`${this.baseUrl}/analyze-patterns`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.getAuthToken()}`},body:JSON.stringify({pillar:r,timeframe:s})});if(!n.ok)throw new Error("Failed to analyze patterns");return await n.json()}catch{throw console.error("Pattern analysis error:",error),error}}async getAdaptiveCoaching(r,s,n){try{const a=await fetch(`${this.baseUrl}/adaptive-coaching`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.getAuthToken()}`},body:JSON.stringify({user_context:r,current_state:s,goal:n})});if(!a.ok)throw new Error("Failed to get adaptive coaching");return await a.json()}catch{throw console.error("Adaptive coaching error:",error),error}}async detectAnomalies(r,s){try{const n=await fetch(`${this.baseUrl}/detect-anomalies`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.getAuthToken()}`},body:JSON.stringify({data_points:r,pillar:s})});if(!n.ok)throw new Error("Failed to detect anomalies");return await n.json()}catch{throw console.error("Anomaly detection error:",error),error}}async getPredictions(r="7d"){try{const s=await fetch(`${this.baseUrl}/predictions`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.getAuthToken()}`},body:JSON.stringify({horizon:r})});if(!s.ok)throw new Error("Failed to get predictions");return await s.json()}catch{throw console.error("Predictions error:",error),error}}async getContextualRecommendations(r,s){try{const n=await fetch(`${this.baseUrl}/contextual-recommendations`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.getAuthToken()}`},body:JSON.stringify({context:r,user_profile:s,current_time:new Date().toISOString()})});if(!n.ok)throw new Error("Failed to get contextual recommendations");return await n.json()}catch{throw console.error("Contextual recommendations error:",error),error}}async getHabitsInsights(r,s){try{const{data:n}=await O.from(`${s}_logs`).select("*").eq("user_id",r).gte("created_at",new Date(Date.now()-2592e6).toISOString()).order("created_at",{ascending:!1});if(!n)return null;const a=this.analyzeHabitsLocally(n);return{pillar:s,insights:a,data_points:n.length,analysis_period:"30d",generated_at:new Date().toISOString()}}catch{throw console.error("Habits insights error:",error),error}}async getProactiveCoaching(){try{const[r,s,n]=await Promise.all([this.analyzePatterns("general"),this.getPredictions("3d"),this.detectAnomalies([])]),a=this.generateProactiveAdvice(r,s,n);return{advice:a,confidence:.85,next_action:this.getNextRecommendedAction(a),generated_at:new Date().toISOString()}}catch{throw console.error("Proactive coaching error:",error),error}}getAuthToken(){return localStorage.getItem("auth_token")||""}analyzeHabitsLocally(r){const s=r.reduce((a,i)=>{const t=new Date(i.created_at).getDay();return a[t]=(a[t]||0)+1,a},{}),n=r.reduce((a,i)=>{const t=new Date(i.created_at).getHours();return a[t]=(a[t]||0)+1,a},{});return{best_days:Object.entries(s).sort(([,a],[,i])=>i-a).slice(0,3),best_hours:Object.entries(n).sort(([,a],[,i])=>i-a).slice(0,3),consistency_score:this.calculateConsistency(r),total_actions:r.length,avg_per_day:r.length/30}}calculateConsistency(r){const s=r.reduce((i,t)=>{const u=new Date(t.created_at).toDateString();return i[u]=(i[u]||0)+1,i},{}),n=Object.keys(s).length;return Math.round(n/30*100)}generateProactiveAdvice(r,s,n){var i,t,u,l;const a={immediate:[],short_term:[],long_term:[]};return((i=n.anomalies)==null?void 0:i.length)>0&&a.immediate.push({type:"correction",message:"Anomalie détectée dans vos habitudes",action:n.anomalies[0].suggestion}),((u=(t=s.predictions)==null?void 0:t.performance)==null?void 0:u.expected_improvement)>10&&a.short_term.push({type:"optimization",message:"Potentiel d'amélioration élevé détecté",action:"Intensifiez vos efforts cette semaine"}),((l=r.analysis)==null?void 0:l.consistency_score)<70&&a.long_term.push({type:"habit_building",message:"Travaillons sur la consistance",action:"Établissez une routine quotidienne fixe"}),a}getNextRecommendedAction(r){var s,n;return((s=r.immediate)==null?void 0:s.length)>0?r.immediate[0].action:((n=r.short_term)==null?void 0:n.length)>0?r.short_term[0].action:"Continuez votre excellent travail !"}}const x=new E,R=(c=0)=>{const[r,s]=m.useState(!1);return m.useEffect(()=>{const n=setTimeout(()=>{s(!0)},c);return()=>clearTimeout(n)},[c]),r},F=m.createContext(void 0),M=()=>{const c=m.useContext(F);if(!c)throw new Error("useTheme must be used within a ThemeProvider");return c},H=()=>{const{resolvedTheme:c}=M();return{light:{background:"bg-gray-50",surface:"bg-white",text:"text-gray-900",textSecondary:"text-gray-600",border:"border-gray-200",accent:"text-blue-600"},dark:{background:"bg-gray-900",surface:"bg-gray-800",text:"text-white",textSecondary:"text-gray-300",border:"border-gray-700",accent:"text-blue-400"}}[c]},B=({pillar:c="general",showPredictions:r=!0,showCoaching:s=!0,showRecommendations:n=!0,className:a=""})=>{const{appStoreUser:i}=D(),t=H(),u=R(),[l,A]=m.useState(null),[g,k]=m.useState(null),[y,C]=m.useState([]),[S,b]=m.useState(!0),[f,j]=m.useState(null),[d,p]=m.useState("insights");m.useEffect(()=>{v()},[c,i==null?void 0:i.id]);const v=async()=>{if(i!=null&&i.id)try{b(!0),j(null);const o=[];o.push(x.analyzePatterns(c,"7d")),s&&o.push(x.getAdaptiveCoaching({user_id:i.id,profile:i},{current_pillar:c,time:new Date().toISOString()},"improve_consistency")),n&&o.push(x.getContextualRecommendations({time_of_day:new Date().getHours(),day_of_week:new Date().getDay(),weather:"sunny",location:"home"},i));const h=await Promise.all(o);A(h[0]),s&&h[1]&&k(h[1]),n&&h[2]&&C(h[2].recommendations||[]),console.log("Intelligence AI mise à jour")}catch(o){j("Erreur lors du chargement de l'intelligence AI"),console.error("AI Intelligence error:",o)}finally{b(!1)}},w=()=>{v()},T=o=>{switch(o){case"improving":return"#22c55e";case"stable":return"#f59e0b";case"declining":return"#ef4444";default:return t.text}},N=o=>{switch(o){case"high":return"#ef4444";case"medium":return"#f59e0b";case"low":return"#22c55e";default:return t.text}};return S?e.jsx("div",{className:`ai-intelligence loading ${a}`,children:e.jsxs("div",{className:"ai-loading-spinner",children:[e.jsx("div",{className:"spinner"}),e.jsx("p",{children:"Analyse en cours..."})]})}):f?e.jsx("div",{className:`ai-intelligence error ${a}`,children:e.jsxs("div",{className:"error-message",children:[e.jsx("p",{children:f}),e.jsx("button",{onClick:w,className:"retry-btn",children:"Réessayer"})]})}):e.jsxs("div",{className:`ai-intelligence ${u?"animated":""} ${a}`,style:{borderColor:t.border},children:[e.jsxs("div",{className:"ai-header",children:[e.jsxs("div",{className:"ai-title",children:[e.jsx("h3",{style:{color:t.text},children:"🧠 Intelligence AI"}),e.jsx("button",{onClick:w,className:"refresh-btn",style:{color:t.accent},children:"↻"})]}),e.jsxs("div",{className:"ai-tabs",children:[e.jsx("button",{className:`tab ${d==="insights"?"active":""}`,onClick:()=>p("insights"),style:{backgroundColor:d==="insights"?t.accent:"transparent",color:d==="insights"?"white":t.text},children:"Insights"}),s&&e.jsx("button",{className:`tab ${d==="coaching"?"active":""}`,onClick:()=>p("coaching"),style:{backgroundColor:d==="coaching"?t.accent:"transparent",color:d==="coaching"?"white":t.text},children:"Coaching"}),r&&e.jsx("button",{className:`tab ${d==="predictions"?"active":""}`,onClick:()=>p("predictions"),style:{backgroundColor:d==="predictions"?t.accent:"transparent",color:d==="predictions"?"white":t.text},children:"Prédictions"})]})]}),e.jsxs("div",{className:"ai-content",children:[d==="insights"&&l&&e.jsxs("div",{className:"insights-panel",children:[e.jsxs("div",{className:"trend-analysis",children:[e.jsx("h4",{style:{color:t.text},children:"Analyse de tendance"}),e.jsxs("div",{className:"trend-info",children:[e.jsxs("span",{className:"trend-indicator",style:{color:T(l.trend)},children:[l.trend==="improving"?"📈":l.trend==="stable"?"➡️":"📉",l.trend==="improving"?"En progression":l.trend==="stable"?"Stable":"En baisse"]}),e.jsxs("span",{className:"confidence",children:["Confiance: ",Math.round(l.confidence*100),"%"]})]})]}),e.jsxs("div",{className:"consistency-score",children:[e.jsx("h4",{style:{color:t.text},children:"Score de consistance"}),e.jsx("div",{className:"score-display",children:e.jsx("div",{className:"score-circle",style:{borderColor:t.accent},children:e.jsxs("span",{style:{color:t.accent},children:[Math.round(l.consistency_score),"%"]})})})]}),e.jsxs("div",{className:"recommendations-list",children:[e.jsx("h4",{style:{color:t.text},children:"Recommandations AI"}),l.recommendations.map((o,h)=>e.jsx("div",{className:"recommendation-item",style:{borderLeft:`3px solid ${t.accent}`},children:e.jsx("p",{style:{color:t.text},children:o})},h))]})]}),d==="coaching"&&g&&e.jsxs("div",{className:"coaching-panel",children:[e.jsxs("div",{className:"coaching-message",children:[e.jsx("div",{className:"priority-badge",style:{backgroundColor:N(g.priority)},children:g.priority.toUpperCase()}),e.jsx("h4",{style:{color:t.text},children:"Message personnalisé"}),e.jsx("p",{style:{color:t.text},children:g.message})]}),e.jsxs("div",{className:"action-items",children:[e.jsx("h4",{style:{color:t.text},children:"Actions recommandées"}),g.actions.map((o,h)=>e.jsxs("div",{className:"action-item",style:{backgroundColor:t.surface},children:[e.jsx("h5",{style:{color:t.accent},children:o.title}),e.jsx("p",{style:{color:t.text},children:o.description}),e.jsx("span",{className:"pillar-tag",style:{color:t.accent},children:o.pillar})]},h))]}),e.jsx("div",{className:"next-checkin",children:e.jsxs("p",{style:{color:t.textSecondary},children:["Prochain check-in: ",new Date(g.next_check_in).toLocaleDateString("fr-FR")]})})]}),d==="predictions"&&e.jsxs("div",{className:"predictions-panel",children:[e.jsxs("div",{className:"prediction-cards",children:[e.jsxs("div",{className:"prediction-card",style:{backgroundColor:t.surface},children:[e.jsx("h4",{style:{color:t.text},children:"Performance prédite"}),e.jsx("div",{className:"prediction-chart",children:e.jsx("div",{className:"chart-bar",style:{backgroundColor:t.accent}})}),e.jsx("p",{style:{color:t.textSecondary},children:"+15% d'amélioration attendue cette semaine"})]}),e.jsxs("div",{className:"prediction-card",style:{backgroundColor:t.surface},children:[e.jsx("h4",{style:{color:t.text},children:"Risques identifiés"}),e.jsxs("div",{className:"risk-indicators",children:[e.jsx("span",{className:"risk-low",children:"Fatigue: Faible"}),e.jsx("span",{className:"risk-medium",children:"Motivation: Moyenne"})]})]})]}),y.length>0&&e.jsxs("div",{className:"contextual-recommendations",children:[e.jsx("h4",{style:{color:t.text},children:"Recommandations contextuelles"}),y.map((o,h)=>e.jsxs("div",{className:"context-rec",style:{backgroundColor:t.surface,borderLeft:`3px solid ${N(o.priority)}`},children:[e.jsx("h5",{style:{color:t.accent},children:o.title}),e.jsx("p",{style:{color:t.text},children:o.message}),e.jsx("div",{className:"rec-actions",children:o.actions.map((I,P)=>e.jsx("button",{className:"action-btn",style:{backgroundColor:t.accent,color:"white"},children:I},P))})]},h))]})]})]}),e.jsx("style",{dangerouslySetInnerHTML:{__html:`
        .ai-intelligence {
          background: ${t.surface};
          border-radius: 12px;
          padding: 20px;
          margin: 16px 0;
          border: 1px solid ${t.border};
          transition: all 0.3s ease;
        }

        .ai-intelligence.animated {
          animation: slideInUp 0.6s ease-out;
        }

        .ai-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .ai-title {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .ai-title h3 {
          margin: 0;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .refresh-btn {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 5px;
          border-radius: 50%;
          transition: transform 0.3s ease;
        }

        .refresh-btn:hover {
          transform: rotate(180deg);
        }

        .ai-tabs {
          display: flex;
          gap: 8px;
        }

        .tab {
          padding: 8px 16px;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .tab:hover {
          opacity: 0.8;
        }

        .ai-content {
          min-height: 200px;
        }

        .prediction-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 20px;
        }

        @media (max-width: 768px) {
          .prediction-cards {
            grid-template-columns: 1fr;
          }
        }

        .prediction-card {
          padding: 16px;
          border-radius: 8px;
          text-align: center;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-left: 4px solid ${t.accent};
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}})]})};export{B as A};
//# sourceMappingURL=AIIntelligence-4kibXt-7.js.map
