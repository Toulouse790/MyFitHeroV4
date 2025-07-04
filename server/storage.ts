import { db } from "./db";
import { users, user_profiles, daily_stats, hydration_logs, meals, sleep_sessions, ai_requests, ai_recommendations } from "@shared/schema";
import type { 
  User, 
  InsertUser, 
  UserProfile, 
  InsertUserProfile, 
  DailyStats, 
  InsertDailyStats, 
  HydrationLog, 
  InsertHydrationLog,
  Meal,
  InsertMeal,
  SleepSession,
  InsertSleepSession,
  AiRequest,
  InsertAiRequest,
  AiRecommendation
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
  
  // User profile management
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | undefined>;
  
  // Daily stats
  getDailyStats(userId: string, date: string): Promise<DailyStats | undefined>;
  upsertDailyStats(stats: InsertDailyStats): Promise<DailyStats>;
  
  // Hydration
  addHydrationLog(log: InsertHydrationLog): Promise<HydrationLog>;
  getHydrationLogs(userId: string, date: string): Promise<HydrationLog[]>;
  
  // Meals
  addMeal(meal: InsertMeal): Promise<Meal>;
  getMeals(userId: string, date: string): Promise<Meal[]>;
  
  // Sleep
  addSleepSession(session: InsertSleepSession): Promise<SleepSession>;
  getSleepSessions(userId: string, date: string): Promise<SleepSession[]>;
  
  // AI requests and recommendations
  createAiRequest(request: InsertAiRequest): Promise<AiRequest>;
  getAiRecommendations(userId: string, pillarType?: string, limit?: number): Promise<AiRecommendation[]>;
  updateAiRequestStatus(requestId: string, status: string, webhookResponse?: any): Promise<void>;
  createAiRecommendation(recommendation: Omit<AiRecommendation, 'id' | 'created_at'>): Promise<AiRecommendation>;
}

export class DatabaseStorage implements IStorage {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await this.hashPassword(insertUser.password);
    const result = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword
    }).returning();
    return result[0];
  }

  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const result = await db.select().from(user_profiles).where(eq(user_profiles.user_id, userId)).limit(1);
    return result[0];
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const result = await db.insert(user_profiles).values(profile).returning();
    return result[0];
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | undefined> {
    const result = await db.update(user_profiles)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(user_profiles.user_id, userId))
      .returning();
    return result[0];
  }

  async getDailyStats(userId: string, date: string): Promise<DailyStats | undefined> {
    const result = await db.select().from(daily_stats)
      .where(and(eq(daily_stats.user_id, userId), eq(daily_stats.stat_date, date)))
      .limit(1);
    return result[0];
  }

  async upsertDailyStats(stats: InsertDailyStats): Promise<DailyStats> {
    const existing = await this.getDailyStats(stats.user_id!, stats.stat_date);
    
    if (existing) {
      const result = await db.update(daily_stats)
        .set({ ...stats, updated_at: new Date() })
        .where(and(eq(daily_stats.user_id, stats.user_id!), eq(daily_stats.stat_date, stats.stat_date)))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(daily_stats).values(stats).returning();
      return result[0];
    }
  }

  async addHydrationLog(log: InsertHydrationLog): Promise<HydrationLog> {
    const result = await db.insert(hydration_logs).values(log).returning();
    return result[0];
  }

  async getHydrationLogs(userId: string, date: string): Promise<HydrationLog[]> {
    return await db.select().from(hydration_logs)
      .where(and(eq(hydration_logs.user_id, userId), eq(hydration_logs.log_date, date)))
      .orderBy(desc(hydration_logs.logged_at));
  }

  async addMeal(meal: InsertMeal): Promise<Meal> {
    const result = await db.insert(meals).values(meal).returning();
    return result[0];
  }

  async getMeals(userId: string, date: string): Promise<Meal[]> {
    return await db.select().from(meals)
      .where(and(eq(meals.user_id, userId), eq(meals.meal_date, date)))
      .orderBy(desc(meals.created_at));
  }

  async addSleepSession(session: InsertSleepSession): Promise<SleepSession> {
    const result = await db.insert(sleep_sessions).values(session).returning();
    return result[0];
  }

  async getSleepSessions(userId: string, date: string): Promise<SleepSession[]> {
    return await db.select().from(sleep_sessions)
      .where(and(eq(sleep_sessions.user_id, userId), eq(sleep_sessions.sleep_date, date)))
      .orderBy(desc(sleep_sessions.created_at));
  }

  async createAiRequest(request: InsertAiRequest): Promise<AiRequest> {
    const result = await db.insert(ai_requests).values(request).returning();
    return result[0];
  }

  async getAiRecommendations(userId: string, pillarType?: string, limit: number = 10): Promise<AiRecommendation[]> {
    if (pillarType) {
      return await db.select().from(ai_recommendations)
        .where(and(eq(ai_recommendations.user_id, userId), eq(ai_recommendations.pillar_type, pillarType)))
        .orderBy(desc(ai_recommendations.created_at))
        .limit(limit);
    }
    
    return await db.select().from(ai_recommendations)
      .where(eq(ai_recommendations.user_id, userId))
      .orderBy(desc(ai_recommendations.created_at))
      .limit(limit);
  }

  async updateAiRequestStatus(requestId: string, status: string, webhookResponse?: any): Promise<void> {
    await db.update(ai_requests)
      .set({ 
        status, 
        webhook_response: webhookResponse,
        updated_at: new Date()
      })
      .where(eq(ai_requests.id, requestId));
  }

  async createAiRecommendation(recommendation: Omit<AiRecommendation, 'id' | 'created_at'>): Promise<AiRecommendation> {
    const result = await db.insert(ai_recommendations).values(recommendation).returning();
    return result[0];
  }
}

export const storage = new DatabaseStorage();
