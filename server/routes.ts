import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";

// Types simplifiés
interface User {
  id: string;
  email: string;
  username?: string;
}

// Interface pour les requêtes authentifiées
interface AuthenticatedRequest extends Request {
  user: User;
}

function isAuthenticatedRequest(req: Request): req is AuthenticatedRequest {
  return 'user' in req && req.user !== undefined;
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// === FONCTIONS UTILITAIRES AI ===

// Génération de coaching adaptatif basé sur le contexte utilisateur
function generateAdaptiveCoaching(userContext: any, currentState: any, goal: any): string {
  const hour = new Date().getHours();
  const responses = {
    morning: [
      `🌅 Bonjour ${userContext?.name || 'Champion'} ! Prêt pour une journée de victoires ?`,
      `☀️ Le matin est parfait pour ${goal === 'hydration' ? 'bien s\'hydrater' : 'se motiver'} !`,
      `🎯 Aujourd'hui, focus sur ${goal} pour optimiser votre ${userContext?.sport || 'performance'} !`
    ],
    afternoon: [
      `⚡ ${userContext?.name || 'Champion'}, l'après-midi est crucial pour maintenir le rythme !`,
      `🔥 Votre énergie ${userContext?.sport === 'rugby' ? 'de warrior' : 'de champion'} peut faire la différence !`,
      `🎪 Moment parfait pour ${goal === 'workout' ? 'un entraînement intense' : 'rester dans le flow'} !`
    ],
    evening: [
      `🌆 Bonsoir ${userContext?.name || 'Champion'} ! Comment se termine cette journée de héros ?`,
      `🏆 Vous avez ${currentState?.progress || 75}% de votre objectif. Finissons en beauté !`,
      `💤 Pensez à votre récupération pour être au top demain !`
    ]
  };

  let timeSlot: keyof typeof responses;
  if (hour < 12) timeSlot = 'morning';
  else if (hour < 18) timeSlot = 'afternoon';
  else timeSlot = 'evening';

  const messages = responses[timeSlot];
  return messages[Math.floor(Math.random() * messages.length)];
}

// Génération de recommandations contextuelles (simulation n8n)
function generateContextualRecommendations(context: any, userProfile: any, currentTime: any) {
  const hour = new Date().getHours();
  const day = new Date().getDay();
  const isWeekend = [0, 6].includes(day);
  
  const recommendations = [];

  // Recommandations basées sur l'heure
  if (hour >= 6 && hour <= 9) {
    recommendations.push({
      type: 'morning_routine',
      title: 'Routine Matinale Optimisée',
      message: `${userProfile?.sport === 'rugby' ? '🏉 Warrior' : '🏆 Champion'}, commencez fort !`,
      actions: ['Hydratation++', 'Petit-déj protéiné', 'Étirements 5min'],
      priority: 'high'
    });
  }

  if (hour >= 14 && hour <= 16) {
    recommendations.push({
      type: 'afternoon_boost',
      title: 'Boost Après-Midi',
      message: 'Évitez la baisse d\'énergie naturelle !',
      actions: ['Eau + électrolytes', 'Snack protéiné', 'Marche 10min'],
      priority: 'medium'
    });
  }

  // Recommandations basées sur le profil sportif
  if (userProfile?.sport === 'rugby') {
    recommendations.push({
      type: 'sport_specific',
      title: 'Spécial Rugby',
      message: `💪 ${userProfile?.sport_position || 'Warrior'}, optimisez votre puissance !`,
      actions: ['Récup musculaire', 'Hydratation intense', 'Sommeil 8h+'],
      priority: 'high'
    });
  }

  // Recommandations météo et contexte
  if (context?.weather === 'hot' || hour > 12) {
    recommendations.push({
      type: 'weather_adaptation',
      title: 'Adaptation Climatique',
      message: '🌡️ Chaleur détectée, adaptez votre hydratation !',
      actions: ['Eau froide', 'Évitez 12h-16h', 'Électrolytes++'],
      priority: 'medium'
    });
  }

  // Recommandations weekend vs semaine
  if (isWeekend) {
    recommendations.push({
      type: 'weekend_optimization',
      title: 'Mode Weekend',
      message: '🎉 Profitez pour optimiser votre récupération !',
      actions: ['Sommeil++', 'Activité ludique', 'Préparation semaine'],
      priority: 'low'
    });
  }

  return recommendations.slice(0, 3); // Max 3 recommandations
}

// Middleware d'authentification simplifié
const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    // Pour l'instant, on simule l'utilisateur
    (req as AuthenticatedRequest).user = { 
      id: decoded.userId || '1', 
      email: 'test@example.com',
      username: 'test'
    };
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Routes de base simplifiées
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Server is running" });
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Simulation de l'authentification
      if (email && password) {
        const token = jwt.sign({ userId: '1' }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
          user: { id: '1', email, username: 'test' },
          token
        });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: Request, res: Response) => {
    try {
      if (!isAuthenticatedRequest(req)) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      res.json({
        user: req.user,
        profile: {}
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // Routes des données simplifiées
  app.get("/api/daily-stats/:date", authenticateToken, async (req: Request, res: Response) => {
    try {
      res.json({
        user_id: '1',
        stat_date: req.params.date,
        water_intake_ml: 1500,
        hydration_goal_ml: 2500,
        total_calories: 1800,
        sleep_duration_minutes: 480
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to get daily stats" });
    }
  });

  app.post("/api/hydration", authenticateToken, async (req: Request, res: Response) => {
    try {
      res.json({ 
        id: '1',
        amount_ml: req.body.amount_ml || 250,
        logged_at: new Date().toISOString()
      });
    } catch (error) {
      res.status(400).json({ message: "Failed to add hydration log" });
    }
  });

  // === ROUTES AI AVANCÉES ===
  
  // Analyse prédictive des patterns utilisateur
  app.post("/api/ai/analyze-patterns", authenticateToken, async (req: Request, res: Response) => {
    try {
      if (!isAuthenticatedRequest(req)) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const { pillar, timeframe = '7d' } = req.body;
      
      // Simulation d'analyse prédictive avancée
      const patterns = {
        hydration: {
          trend: 'improving',
          consistency_score: 78,
          best_time: '09:00',
          predicted_intake: 2300,
          risk_factors: ['afternoon_drop'],
          recommendations: [
            'Augmentez votre hydratation entre 14h-16h',
            'Placez une alarme à 9h pour optimiser votre routine'
          ]
        },
        nutrition: {
          trend: 'stable',
          consistency_score: 65,
          macro_balance: { protein: 'good', carbs: 'high', fat: 'optimal' },
          predicted_calories: 2100,
          recommendations: [
            'Réduisez les glucides de 15% pour optimiser la composition corporelle',
            'Augmentez les protéines au petit-déjeuner'
          ]
        },
        sleep: {
          trend: 'declining',
          consistency_score: 45,
          sleep_debt: 180, // minutes
          optimal_bedtime: '22:30',
          recommendations: [
            'Couchez-vous 30min plus tôt cette semaine',
            'Évitez les écrans 1h avant le coucher'
          ]
        },
        workout: {
          trend: 'improving',
          consistency_score: 82,
          recovery_status: 'good',
          predicted_performance: 'peak',
          recommendations: [
            'Vous êtes prêt pour augmenter l\'intensité de 10%',
            'Ajoutez un jour de récupération active'
          ]
        }
      };

      res.json({
        pillar,
        analysis: patterns[pillar as keyof typeof patterns] || patterns.hydration,
        generated_at: new Date().toISOString(),
        confidence: 0.87
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to analyze patterns" });
    }
  });

  // Coaching adaptatif personnalisé
  app.post("/api/ai/adaptive-coaching", authenticateToken, async (req: Request, res: Response) => {
    try {
      if (!isAuthenticatedRequest(req)) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const { user_context, current_state, goal } = req.body;
      
      // Simulation de coaching IA contextuel
      const coachingResponse = {
        message: generateAdaptiveCoaching(user_context, current_state, goal),
        priority: 'high',
        type: 'motivational',
        actions: [
          {
            title: 'Action Immédiate',
            description: 'Buvez 500ml d\'eau maintenant',
            pillar: 'hydration'
          },
          {
            title: 'Objectif 24h',
            description: 'Atteignez 8h de sommeil ce soir',
            pillar: 'sleep'
          }
        ],
        next_check_in: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() // 4h
      };

      res.json(coachingResponse);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate coaching" });
    }
  });

  // Détection d'anomalies intelligente
  app.post("/api/ai/detect-anomalies", authenticateToken, async (req: Request, res: Response) => {
    try {
      if (!isAuthenticatedRequest(req)) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const { data_points, pillar } = req.body;
      
      // Simulation de détection d'anomalies
      const anomalies = [
        {
          type: 'deviation',
          pillar: 'hydration',
          severity: 'medium',
          message: 'Hydratation 40% en dessous de la moyenne sur 3 jours',
          suggestion: 'Augmentez progressivement votre consommation',
          detected_at: new Date().toISOString()
        },
        {
          type: 'pattern_break',
          pillar: 'sleep',
          severity: 'high', 
          message: 'Perturbation inhabituelle du cycle de sommeil',
          suggestion: 'Consultez votre médecin si cela persiste',
          detected_at: new Date().toISOString()
        }
      ];

      res.json({
        anomalies: anomalies.filter(a => !pillar || a.pillar === pillar),
        analysis_date: new Date().toISOString(),
        recommendations: [
          'Maintenez une routine cohérente',
          'Surveillez les signaux de votre corps'
        ]
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to detect anomalies" });
    }
  });

  // Prédictions personnalisées
  app.post("/api/ai/predictions", authenticateToken, async (req: Request, res: Response) => {
    try {
      if (!isAuthenticatedRequest(req)) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const { horizon = '7d' } = req.body;
      
      const predictions = {
        performance: {
          expected_improvement: 12, // %
          peak_days: ['2025-07-15', '2025-07-18'],
          recovery_needed: ['2025-07-16']
        },
        goals: {
          hydration: { probability: 0.78, expected_achievement: '2025-07-18' },
          nutrition: { probability: 0.65, expected_achievement: '2025-07-20' },
          sleep: { probability: 0.45, expected_achievement: '2025-07-25' },
          workout: { probability: 0.89, expected_achievement: '2025-07-14' }
        },
        risk_alerts: [
          'Risque de fatigue élevé jeudi prochain',
          'Déshydratation probable si tendance continue'
        ]
      };

      res.json({
        horizon,
        predictions,
        confidence: 0.82,
        last_updated: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate predictions" });
    }
  });

  // Route de recommandations contextuelles n8n
  app.post("/api/ai/contextual-recommendations", authenticateToken, async (req: Request, res: Response) => {
    try {
      if (!isAuthenticatedRequest(req)) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const { context, user_profile, current_time } = req.body;
      
      // Simulation d'intégration n8n pour recommandations contextuelles
      const recommendations = generateContextualRecommendations(context, user_profile, current_time);
      
      res.json({
        recommendations,
        context_analyzed: context,
        personalization_score: 0.91,
        generated_at: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate contextual recommendations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
