import { pgTable, text, serial, integer, boolean, timestamp, uuid, jsonb, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Auth Users Table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  username: text("username").unique(),
  password: text("password").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// User Profiles Table
export const user_profiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  username: text("username"),
  full_name: text("full_name"),
  avatar_url: text("avatar_url"),
  age: integer("age"),
  gender: text("gender"),
  height_cm: numeric("height_cm"),
  weight_kg: numeric("weight_kg"),
  activity_level: text("activity_level"),
  timezone: text("timezone"),
  country_code: text("country_code"),
  notifications_enabled: boolean("notifications_enabled").default(true),
  
  // Fitness related fields
  sport: text("sport"),
  sport_position: text("sport_position"),
  sport_level: text("sport_level"),
  fitness_experience: text("fitness_experience"),
  fitness_goal: text("fitness_goal"),
  lifestyle: text("lifestyle"),
  available_time_per_day: integer("available_time_per_day"),
  training_frequency: integer("training_frequency"),
  season_period: text("season_period"),
  primary_goals: text("primary_goals").array(),
  injuries: text("injuries").array(),
  motivation: text("motivation"),
  
  // Module and profile type
  profile_type: text("profile_type"),
  modules: text("modules").array(),
  active_modules: text("active_modules").array(),
  
  // Dietary preferences
  dietary_preference: text("dietary_preference"),
  dietary_restrictions: text("dietary_restrictions").array(),
  food_allergies: text("food_allergies").array(),
  food_dislikes: text("food_dislikes").array(),
  
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Daily Stats Table
export const daily_stats = pgTable("daily_stats", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => user_profiles.id, { onDelete: "cascade" }),
  stat_date: text("stat_date").notNull(),
  
  // Workout stats
  total_workout_minutes: integer("total_workout_minutes"),
  workouts_completed: integer("workouts_completed"),
  calories_burned: integer("calories_burned"),
  
  // Nutrition stats
  total_calories: integer("total_calories"),
  total_protein: numeric("total_protein"),
  total_carbs: numeric("total_carbs"),
  total_fat: numeric("total_fat"),
  
  // Hydration stats
  water_intake_ml: integer("water_intake_ml"),
  hydration_goal_ml: integer("hydration_goal_ml"),
  
  // Sleep stats
  sleep_duration_minutes: integer("sleep_duration_minutes"),
  sleep_quality: integer("sleep_quality"),
  
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Exercises Library Table
export const exercises_library = pgTable("exercises_library", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  instructions: text("instructions"),
  category: text("category"),
  difficulty: text("difficulty"),
  equipment: text("equipment"),
  muscle_groups: text("muscle_groups").array(),
  image_url: text("image_url"),
  video_url: text("video_url"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
});

// Workouts Table
export const workouts = pgTable("workouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => user_profiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type"),
  duration_minutes: integer("duration_minutes"),
  difficulty: text("difficulty"),
  exercises: jsonb("exercises"),
  notes: text("notes"),
  workout_date: text("workout_date"),
  completed: boolean("completed").default(false),
  created_at: timestamp("created_at").defaultNow(),
});

// Hydration Logs Table
export const hydration_logs = pgTable("hydration_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => user_profiles.id, { onDelete: "cascade" }),
  amount_ml: integer("amount_ml").notNull(),
  drink_type: text("drink_type"),
  log_date: text("log_date").notNull(),
  logged_at: timestamp("logged_at").defaultNow(),
  created_at: timestamp("created_at").defaultNow(),
});

// Meals Table
export const meals = pgTable("meals", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => user_profiles.id, { onDelete: "cascade" }),
  meal_type: text("meal_type"),
  meal_date: text("meal_date").notNull(),
  foods: jsonb("foods"),
  total_calories: integer("total_calories"),
  total_protein: numeric("total_protein"),
  total_carbs: numeric("total_carbs"),
  total_fat: numeric("total_fat"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
});

// Sleep Sessions Table
export const sleep_sessions = pgTable("sleep_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => user_profiles.id, { onDelete: "cascade" }),
  sleep_date: text("sleep_date").notNull(),
  bedtime: text("bedtime"),
  wake_time: text("wake_time"),
  duration_minutes: integer("duration_minutes"),
  quality_rating: integer("quality_rating"),
  mood_rating: integer("mood_rating"),
  energy_level: integer("energy_level"),
  factors: jsonb("factors"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
});

// Foods Library Table
export const foods_library = pgTable("foods_library", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  brand: text("brand"),
  category: text("category"),
  calories_per_100g: integer("calories_per_100g"),
  protein_per_100g: numeric("protein_per_100g"),
  carbs_per_100g: numeric("carbs_per_100g"),
  fat_per_100g: numeric("fat_per_100g"),
  fiber_per_100g: numeric("fiber_per_100g"),
  sugar_per_100g: numeric("sugar_per_100g"),
  common_units: jsonb("common_units"),
  created_at: timestamp("created_at").defaultNow(),
});

// User Goals Table
export const user_goals = pgTable("user_goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => user_profiles.id, { onDelete: "cascade" }),
  goal_type: text("goal_type"),
  category: text("category"),
  target_value: numeric("target_value"),
  current_value: numeric("current_value"),
  unit: text("unit"),
  target_date: text("target_date"),
  start_date: text("start_date"),
  achieved_at: timestamp("achieved_at"),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
});

// AI Requests Table
export const ai_requests = pgTable("ai_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => user_profiles.id, { onDelete: "cascade" }),
  prompt: text("prompt").notNull(),
  pillar_type: text("pillar_type"),
  context: jsonb("context"),
  status: text("status"),
  webhook_response: jsonb("webhook_response"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// AI Recommendations Table
export const ai_recommendations = pgTable("ai_recommendations", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => user_profiles.id, { onDelete: "cascade" }),
  request_id: uuid("request_id").references(() => ai_requests.id, { onDelete: "cascade" }),
  recommendation: text("recommendation").notNull(),
  pillar_type: text("pillar_type"),
  metadata: jsonb("metadata"),
  is_applied: boolean("is_applied").default(false),
  created_at: timestamp("created_at").defaultNow(),
});

// Pillar Coordination Table
export const pillar_coordination = pgTable("pillar_coordination", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").references(() => user_profiles.id, { onDelete: "cascade" }),
  coordination_data: jsonb("coordination_data").notNull(),
  active: boolean("active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Create insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  username: true,
  password: true,
});

export const insertUserProfileSchema = createInsertSchema(user_profiles).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertDailyStatsSchema = createInsertSchema(daily_stats).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const insertHydrationLogSchema = createInsertSchema(hydration_logs).omit({
  id: true,
  created_at: true,
  logged_at: true,
});

export const insertMealSchema = createInsertSchema(meals).omit({
  id: true,
  created_at: true,
});

export const insertSleepSessionSchema = createInsertSchema(sleep_sessions).omit({
  id: true,
  created_at: true,
});

export const insertAiRequestSchema = createInsertSchema(ai_requests).omit({
  id: true,
  created_at: true,
  updated_at: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UserProfile = typeof user_profiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type DailyStats = typeof daily_stats.$inferSelect;
export type InsertDailyStats = z.infer<typeof insertDailyStatsSchema>;
export type HydrationLog = typeof hydration_logs.$inferSelect;
export type InsertHydrationLog = z.infer<typeof insertHydrationLogSchema>;
export type Meal = typeof meals.$inferSelect;
export type InsertMeal = z.infer<typeof insertMealSchema>;
export type SleepSession = typeof sleep_sessions.$inferSelect;
export type InsertSleepSession = z.infer<typeof insertSleepSessionSchema>;
export type Exercise = typeof exercises_library.$inferSelect;
export type Workout = typeof workouts.$inferSelect;
export type FoodLibraryEntry = typeof foods_library.$inferSelect;
export type UserGoal = typeof user_goals.$inferSelect;
export type AiRequest = typeof ai_requests.$inferSelect;
export type InsertAiRequest = z.infer<typeof insertAiRequestSchema>;
export type AiRecommendation = typeof ai_recommendations.$inferSelect;
export type PillarCoordination = typeof pillar_coordination.$inferSelect;
