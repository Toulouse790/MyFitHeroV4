# MyFitHero V4

# 🚀 Description
MyFitHero est une application web de coaching intelligent intégrant :
- Frontend React (initial via Vite)
- Backend Express
- Supabase
- Intégration OpenAI Assistants
- Préparation facile du déploiment Vercel

## 🄨 Structure du projet


```
client/          … Frontend React
server/            ⁦ API Express
shared/           … Schèmas comuns
.env.example      ⁦ Variables d environnement
README.md        ⁦ Instructions vercel
```

## 🇫 Installation

```sh
pnpm install
```

## 😎 Developpement

```sh
pnpm run dev
```

## 📋 Déploiement Vercel

Configurer les variables d'ENV dans Vercel :
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- ORENAI_API_KEY
- REPLICATE_API_TOKEN (optionnel)

## 🇷 Attention
Ne pusher never . env.local -- il est bien automatique dans .gitignore
