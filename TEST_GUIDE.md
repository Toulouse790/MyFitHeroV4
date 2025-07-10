# 🧪 Guide de Test - Parcours Utilisateur MyFitHero V4

## 📋 Checklist de Tests

### 1. **Test d'Inscription (Nouveau Utilisateur)**
- [ ] Ouvrir http://localhost:5173
- [ ] Cliquer sur "Créer un compte"
- [ ] Remplir le formulaire d'inscription
- [ ] Vérifier la redirection vers l'onboarding
- [ ] Compléter le questionnaire d'onboarding
- [ ] Vérifier l'accès à la page d'accueil

### 2. **Test de Connexion (Utilisateur Existant)**
- [ ] Se déconnecter
- [ ] Cliquer sur "Se connecter"
- [ ] Saisir les identifiants
- [ ] Vérifier l'accès direct à la page d'accueil

### 3. **Test de Navigation**
- [ ] Vérifier l'accès à toutes les pages : Index, Nutrition, Hydration, Sleep, Workout, Profile
- [ ] Tester la barre de navigation inférieure
- [ ] Vérifier les redirections d'authentification

### 4. **Test de Déconnexion**
- [ ] Cliquer sur "Se déconnecter"
- [ ] Vérifier la redirection vers la page de connexion
- [ ] Tenter d'accéder à une page protégée

## 🚀 Commandes de Test

```bash
# Démarrer l'application
cd /workspaces/MyFitHeroV4
pnpm run dev

# Ouvrir dans le navigateur
# http://localhost:5173

# Vérifier les logs
# Console développeur (F12)
```

## 🔧 Résolution de Problèmes

### Si l'application ne démarre pas :
1. Vérifier les variables d'environnement (`client/.env`)
2. Réinstaller les dépendances : `pnpm install`
3. Vérifier les logs d'erreur dans la console

### Si l'authentification échoue :
1. Vérifier la configuration Supabase
2. Vérifier la connectivité internet
3. Vérifier les clés API Supabase

## 📊 Métriques de Performance

- **Temps de chargement initial** : < 2 secondes
- **Temps de connexion** : < 1 seconde
- **Temps d'inscription** : < 3 secondes
- **Temps de navigation** : < 0.5 seconde

## 🎯 Critères de Succès

- [x] Inscription fonctionne
- [x] Connexion fonctionne
- [x] Onboarding fonctionne
- [x] Navigation fonctionne
- [x] Déconnexion fonctionne
- [x] Persistance de session
- [x] Gestion des erreurs
- [x] UX/UI responsive
