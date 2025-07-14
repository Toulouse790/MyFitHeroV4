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

  const httpServer = createServer(app);
  return httpServer;
}
