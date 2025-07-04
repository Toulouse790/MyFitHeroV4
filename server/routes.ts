import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertUserProfileSchema, insertHydrationLogSchema, insertMealSchema, insertSleepSessionSchema, insertAiRequestSchema, type User } from "@shared/schema";
import jwt from "jsonwebtoken";
import { z } from "zod";

// Extend Request interface to include user
interface AuthenticatedRequest extends Request {
  user: User;
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Middleware to verify JWT token
const authenticateToken = async (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({
        user: { id: user.id, email: user.email, username: user.username },
        token
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await storage.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({
        user: { id: user.id, email: user.email, username: user.username },
        token
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ message: "Login failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req, res) => {
    try {
      const userProfile = await storage.getUserProfile(req.user.id);
      res.json({
        user: req.user,
        profile: userProfile
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user" });
    }
  });

  // User profile routes
  app.post("/api/profile", authenticateToken, async (req, res) => {
    try {
      const profileData = insertUserProfileSchema.parse({
        ...req.body,
        user_id: req.user.id
      });
      
      const profile = await storage.createUserProfile(profileData);
      res.json(profile);
    } catch (error) {
      console.error("Create profile error:", error);
      res.status(400).json({ message: "Failed to create profile" });
    }
  });

  app.put("/api/profile", authenticateToken, async (req, res) => {
    try {
      const updates = req.body;
      const profile = await storage.updateUserProfile(req.user.id, updates);
      res.json(profile);
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(400).json({ message: "Failed to update profile" });
    }
  });

  app.get("/api/profile", authenticateToken, async (req, res) => {
    try {
      const profile = await storage.getUserProfile(req.user.id);
      res.json(profile);
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ message: "Failed to get profile" });
    }
  });

  // Daily stats routes
  app.get("/api/daily-stats/:date", authenticateToken, async (req, res) => {
    try {
      const { date } = req.params;
      const stats = await storage.getDailyStats(req.user.id, date);
      res.json(stats);
    } catch (error) {
      console.error("Get daily stats error:", error);
      res.status(500).json({ message: "Failed to get daily stats" });
    }
  });

  // Hydration routes
  app.post("/api/hydration", authenticateToken, async (req, res) => {
    try {
      const logData = insertHydrationLogSchema.parse({
        ...req.body,
        user_id: req.user.id
      });
      
      const log = await storage.addHydrationLog(logData);
      
      // Update daily stats
      const today = new Date().toISOString().split('T')[0];
      const existingStats = await storage.getDailyStats(req.user.id, today);
      const currentIntake = existingStats?.water_intake_ml || 0;
      
      await storage.upsertDailyStats({
        user_id: req.user.id,
        stat_date: today,
        water_intake_ml: currentIntake + logData.amount_ml,
        hydration_goal_ml: existingStats?.hydration_goal_ml || 2000
      });
      
      res.json(log);
    } catch (error) {
      console.error("Add hydration error:", error);
      res.status(400).json({ message: "Failed to add hydration log" });
    }
  });

  app.get("/api/hydration/:date", authenticateToken, async (req, res) => {
    try {
      const { date } = req.params;
      const logs = await storage.getHydrationLogs(req.user.id, date);
      res.json(logs);
    } catch (error) {
      console.error("Get hydration logs error:", error);
      res.status(500).json({ message: "Failed to get hydration logs" });
    }
  });

  // Meals routes
  app.post("/api/meals", authenticateToken, async (req, res) => {
    try {
      const mealData = insertMealSchema.parse({
        ...req.body,
        user_id: req.user.id
      });
      
      const meal = await storage.addMeal(mealData);
      
      // Update daily stats
      const today = new Date().toISOString().split('T')[0];
      const existingStats = await storage.getDailyStats(req.user.id, today);
      
      await storage.upsertDailyStats({
        user_id: req.user.id,
        stat_date: today,
        total_calories: (existingStats?.total_calories || 0) + (mealData.total_calories || 0),
        total_protein: ((existingStats?.total_protein || 0) as number) + ((mealData.total_protein || 0) as number),
        total_carbs: ((existingStats?.total_carbs || 0) as number) + ((mealData.total_carbs || 0) as number),
        total_fat: ((existingStats?.total_fat || 0) as number) + ((mealData.total_fat || 0) as number)
      });
      
      res.json(meal);
    } catch (error) {
      console.error("Add meal error:", error);
      res.status(400).json({ message: "Failed to add meal" });
    }
  });

  app.get("/api/meals/:date", authenticateToken, async (req, res) => {
    try {
      const { date } = req.params;
      const meals = await storage.getMeals(req.user.id, date);
      res.json(meals);
    } catch (error) {
      console.error("Get meals error:", error);
      res.status(500).json({ message: "Failed to get meals" });
    }
  });

  // Sleep routes
  app.post("/api/sleep", authenticateToken, async (req, res) => {
    try {
      const sleepData = insertSleepSessionSchema.parse({
        ...req.body,
        user_id: req.user.id
      });
      
      const session = await storage.addSleepSession(sleepData);
      
      // Update daily stats
      const today = new Date().toISOString().split('T')[0];
      await storage.upsertDailyStats({
        user_id: req.user.id,
        stat_date: today,
        sleep_duration_minutes: sleepData.duration_minutes || 0,
        sleep_quality: sleepData.quality_rating || 0
      });
      
      res.json(session);
    } catch (error) {
      console.error("Add sleep session error:", error);
      res.status(400).json({ message: "Failed to add sleep session" });
    }
  });

  app.get("/api/sleep/:date", authenticateToken, async (req, res) => {
    try {
      const { date } = req.params;
      const sessions = await storage.getSleepSessions(req.user.id, date);
      res.json(sessions);
    } catch (error) {
      console.error("Get sleep sessions error:", error);
      res.status(500).json({ message: "Failed to get sleep sessions" });
    }
  });

  // AI recommendations routes
  app.post("/api/ai/request", authenticateToken, async (req, res) => {
    try {
      const requestData = insertAiRequestSchema.parse({
        ...req.body,
        user_id: req.user.id,
        status: 'pending'
      });
      
      const aiRequest = await storage.createAiRequest(requestData);
      res.json(aiRequest);
    } catch (error) {
      console.error("Create AI request error:", error);
      res.status(400).json({ message: "Failed to create AI request" });
    }
  });

  app.get("/api/ai/recommendations", authenticateToken, async (req, res) => {
    try {
      const { pillar_type, limit } = req.query;
      const recommendations = await storage.getAiRecommendations(
        req.user.id, 
        pillar_type as string, 
        limit ? parseInt(limit as string) : undefined
      );
      res.json(recommendations);
    } catch (error) {
      console.error("Get AI recommendations error:", error);
      res.status(500).json({ message: "Failed to get AI recommendations" });
    }
  });

  // Profile management
  app.post("/api/profile", authenticateToken, async (req, res) => {
    try {
      const profileData = req.body;
      const profile = await storage.createUserProfile({
        user_id: req.user.id,
        age: profileData.age,
        gender: profileData.gender,
        sport: profileData.sport,
        sport_position: profileData.sport_position,
        sport_level: profileData.sport_level,
        lifestyle: profileData.lifestyle,
        fitness_experience: profileData.fitness_experience,
        primary_goals: profileData.primary_goals,
        training_frequency: profileData.training_frequency,
        available_time_per_day: profileData.available_time_per_day,
        active_modules: profileData.active_modules,
        modules: profileData.modules,
        profile_type: profileData.profile_type,
        motivation: profileData.motivation
      });
      res.json(profile);
    } catch (error) {
      console.error("Create profile error:", error);
      res.status(500).json({ message: "Failed to create profile" });
    }
  });

  app.get("/api/profile", authenticateToken, async (req, res) => {
    try {
      const profile = await storage.getUserProfile(req.user.id);
      res.json(profile);
    } catch (error) {
      console.error("Get profile error:", error);
      res.status(500).json({ message: "Failed to get profile" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
