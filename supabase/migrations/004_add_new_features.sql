-- Migration pour les nouvelles fonctionnalités MyFitHero V4

-- Table pour les paramètres de confidentialité
CREATE TABLE IF NOT EXISTS user_privacy_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends', 'private')),
  show_activity BOOLEAN DEFAULT true,
  show_progress BOOLEAN DEFAULT true,
  show_badges BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  data_analytics BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Table pour les check-ins quotidiens
CREATE TABLE IF NOT EXISTS daily_check_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  completed_goals TEXT[] DEFAULT '{}',
  total_goals INTEGER DEFAULT 0,
  completion_rate INTEGER DEFAULT 0,
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5),
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  motivation_level INTEGER CHECK (motivation_level >= 1 AND motivation_level <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Table pour les badges utilisateur
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  progress INTEGER DEFAULT 0,
  UNIQUE(user_id, badge_id)
);

-- Table pour les objectifs quotidiens
CREATE TABLE IF NOT EXISTS daily_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pillar_type TEXT NOT NULL CHECK (pillar_type IN ('hydration', 'nutrition', 'sleep', 'workout')),
  date DATE NOT NULL,
  goal_description TEXT NOT NULL,
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  unit TEXT,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, pillar_type, date)
);

-- Table pour les données de suivi piliers
CREATE TABLE IF NOT EXISTS pillar_tracking_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pillar_type TEXT NOT NULL CHECK (pillar_type IN ('hydration', 'nutrition', 'sleep', 'workout')),
  date DATE NOT NULL,
  data_type TEXT NOT NULL, -- 'intake', 'session', 'measurement', etc.
  value NUMERIC NOT NULL,
  unit TEXT,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, pillar_type, date, data_type)
);

-- Ajouter la colonne avatar_url à user_profiles si elle n'existe pas
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS daily_calories INTEGER;

-- Créer un bucket pour les avatars dans Supabase Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-avatars', 'user-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Politique de sécurité pour les avatars
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own avatar"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Politiques RLS pour les nouvelles tables
ALTER TABLE user_privacy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE pillar_tracking_data ENABLE ROW LEVEL SECURITY;

-- Politiques pour user_privacy_settings
CREATE POLICY "Users can view their own privacy settings"
ON user_privacy_settings FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own privacy settings"
ON user_privacy_settings FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify their own privacy settings"
ON user_privacy_settings FOR UPDATE
USING (auth.uid() = user_id);

-- Politiques pour daily_check_ins
CREATE POLICY "Users can view their own check-ins"
ON daily_check_ins FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own check-ins"
ON daily_check_ins FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own check-ins"
ON daily_check_ins FOR UPDATE
USING (auth.uid() = user_id);

-- Politiques pour user_badges
CREATE POLICY "Users can view their own badges"
ON user_badges FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can earn badges"
ON user_badges FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Politiques pour daily_goals
CREATE POLICY "Users can view their own goals"
ON daily_goals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals"
ON daily_goals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
ON daily_goals FOR UPDATE
USING (auth.uid() = user_id);

-- Politiques pour pillar_tracking_data
CREATE POLICY "Users can view their own tracking data"
ON pillar_tracking_data FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tracking data"
ON pillar_tracking_data FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracking data"
ON pillar_tracking_data FOR UPDATE
USING (auth.uid() = user_id);

-- Indexes pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_daily_check_ins_user_date ON daily_check_ins(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_goals_user_pillar_date ON daily_goals(user_id, pillar_type, date);
CREATE INDEX IF NOT EXISTS idx_pillar_tracking_user_pillar_date ON pillar_tracking_data(user_id, pillar_type, date);

-- Triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_privacy_settings_updated_at
  BEFORE UPDATE ON user_privacy_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_check_ins_updated_at
  BEFORE UPDATE ON daily_check_ins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_goals_updated_at
  BEFORE UPDATE ON daily_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
