# Système de Routes MyFitHero V4

## Vue d'ensemble

Ce dossier contient un système de routage complet et modulaire pour l'application MyFitHero V4, basé sur **Wouter** pour la navigation.

## Structure des fichiers

```
routes/
├── types.ts                 # Types TypeScript pour les routes
├── auth.ts                  # Routes d'authentification
├── dashboard.ts             # Routes du tableau de bord et profil
├── fitness.ts               # Routes liées au fitness et entraînement
├── wellness.ts              # Routes bien-être (nutrition, hydratation, sommeil)
├── social.ts                # Routes sociales et communautaires
├── admin.ts                 # Routes d'administration et légales
├── index.ts                 # Point d'entrée principal avec toutes les routes
├── AppRouter.tsx            # Composant Router principal
├── hooks.ts                 # Hooks utilitaires pour la navigation
├── NavigationMenu.tsx       # Composant de menu de navigation
└── README.md               # Cette documentation
```

## Fonctionnalités

### ✅ Routes organisées par catégories
- **Auth** : Authentification, inscription, connexion
- **Dashboard** : Tableau de bord, profil, paramètres
- **Fitness** : Entraînements, exercices, défis, récupération
- **Wellness** : Nutrition, hydratation, sommeil, objets connectés
- **Social** : Communauté, amis, défis collaboratifs
- **Admin** : Administration, support
- **Legal** : Confidentialité, termes d'utilisation

### ✅ Lazy Loading
Toutes les pages sont chargées de manière asynchrone pour optimiser les performances.

### ✅ Routes protégées
- Système de protection des routes avec authentification
- Support des rôles utilisateur (admin, moderator, etc.)
- Redirection automatique vers la page de connexion

### ✅ Métadonnées enrichies
Chaque route contient :
- Titre et description
- Icône suggérée
- Catégorie
- Statut de protection
- Rôles requis

### ✅ Hooks utilitaires
- `useCurrentRoute()` : Informations sur la route actuelle
- `useAppNavigation()` : Navigation programmée avec métadonnées
- `useNavigationRoutes()` : Routes filtrées par catégorie
- `useRoutePermissions()` : Vérification des permissions

## Utilisation

### Import du Router principal
```tsx
import { AppRouter } from '@/routes/AppRouter';

function App() {
  return <AppRouter />;
}
```

### Navigation programmée
```tsx
import { useAppNavigation } from '@/routes/hooks';

function MyComponent() {
  const { navigateTo, goBack, goHome } = useAppNavigation();
  
  const handleClick = () => {
    navigateTo('/hydration');
  };
  
  return (
    <button onClick={handleClick}>
      Aller à l'hydratation
    </button>
  );
}
```

### Informations sur la route actuelle
```tsx
import { useCurrentRoute } from '@/routes/hooks';

function Header() {
  const { currentRoute, isProtectedRoute } = useCurrentRoute();
  
  return (
    <header>
      <h1>{currentRoute?.metadata?.title || 'MyFitHero'}</h1>
      {isProtectedRoute && <span>🔒</span>}
    </header>
  );
}
```

### Menu de navigation
```tsx
import { NavigationMenu } from '@/routes/NavigationMenu';

function TopBar() {
  return (
    <div className="flex justify-between items-center">
      <h1>MyFitHero</h1>
      <NavigationMenu />
    </div>
  );
}
```

## Routes disponibles

### Authentification
- `/` - Page d'accueil
- `/login` - Connexion
- `/register` - Inscription
- `/auth` - Authentification
- `/landing` - Page de présentation

### Dashboard
- `/dashboard` - Tableau de bord principal
- `/analytics` - Analytiques détaillées
- `/profile` - Profil utilisateur
- `/profile/complete` - Complétion du profil
- `/settings` - Paramètres

### Fitness
- `/workout` - Sessions d'entraînement
- `/workout/:id` - Détail d'une session
- `/exercises` - Bibliothèque d'exercices
- `/exercises/:id` - Détail d'un exercice
- `/challenges` - Défis fitness
- `/recovery` - Suivi de récupération
- `/ai-coach` - Coach IA

### Bien-être
- `/nutrition` - Suivi nutritionnel
- `/hydration` - Suivi d'hydratation
- `/hydration/history` - Historique hydratation
- `/sleep` - Suivi du sommeil
- `/wearables` - Objets connectés

### Social
- `/social` - Hub social principal
- `/social/feed` - Fil d'actualité
- `/social/challenges` - Défis communautaires
- `/social/friends` - Gestion des amis

### Administration
- `/admin` - Panneau d'administration (rôles requis)
- `/support` - Centre d'aide

### Légal
- `/privacy` - Politique de confidentialité
- `/terms` - Conditions d'utilisation

## Ajout de nouvelles routes

1. **Créer le composant de page** dans `/pages/`
2. **Ajouter la route** dans le fichier de catégorie approprié (`fitness.ts`, `wellness.ts`, etc.)
3. **Définir les métadonnées** (titre, description, icône, protection)
4. **Tester la navigation**

Exemple :
```tsx
// Dans wellness.ts
{
  path: '/meditation',
  component: lazy(() => import('@/pages/Meditation')),
  isProtected: true,
  metadata: {
    title: 'Méditation',
    description: 'Sessions de méditation guidée',
    icon: 'Brain',
    category: 'wellness'
  }
}
```

## Performance

- **Lazy Loading** : Chargement à la demande des composants
- **Code Splitting** : Division automatique du bundle
- **Cache de routes** : Mise en cache des composants chargés
- **Préchargement intelligent** : Compatible avec le hook `useIntelligentPreloading`

## Sécurité

- **Routes protégées** : Authentification obligatoire
- **Contrôle des rôles** : Vérification des permissions
- **Redirection sécurisée** : Gestion des accès non autorisés

---

*Système créé pour MyFitHero V4 - Votre compagnon fitness intelligent*
