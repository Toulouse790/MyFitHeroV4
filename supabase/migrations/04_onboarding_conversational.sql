-- SQL pour créer les tables nécessaires à l'onboarding conversationnel
-- Exécuter dans Supabase SQL Editor

-- Table pour les suggestions de sports par les utilisateurs
CREATE TABLE IF NOT EXISTS sport_suggestions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  sport_name text NOT NULL,
  suggested_position text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_sport_suggestions_user_id ON sport_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_sport_suggestions_status ON sport_suggestions(status);

-- RLS pour les suggestions de sports
ALTER TABLE sport_suggestions ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre aux utilisateurs de créer leurs propres suggestions
CREATE POLICY "Users can create their own sport suggestions"
  ON sport_suggestions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy pour permettre aux utilisateurs de voir leurs propres suggestions
CREATE POLICY "Users can view their own sport suggestions"
  ON sport_suggestions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Mise à jour de la table sports_library si elle n'existe pas
CREATE TABLE IF NOT EXISTS sports_library (
  id text PRIMARY KEY,
  name text NOT NULL,
  emoji text DEFAULT '🏃‍♂️',
  positions text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Activer RLS sur sports_library
ALTER TABLE sports_library ENABLE ROW LEVEL SECURITY;

-- Policy pour permettre la lecture publique des sports actifs
CREATE POLICY "Anyone can view active sports"
  ON sports_library
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Insertion des sports de base si la table est vide
INSERT INTO sports_library (id, name, emoji, positions, is_active) VALUES
  ('football', 'Football', '⚽', ARRAY['Gardien', 'Défenseur central', 'Latéral droit', 'Latéral gauche', 'Milieu défensif', 'Milieu central', 'Milieu offensif', 'Ailier droit', 'Ailier gauche', 'Attaquant', 'Avant-centre'], true),
  ('basketball', 'Basketball', '🏀', ARRAY['Meneur (PG)', 'Arrière (SG)', 'Ailier (SF)', 'Ailier Fort (PF)', 'Pivot (C)'], true),
  ('rugby', 'Rugby', '🏉', ARRAY['Pilier', 'Talonneur', 'Deuxième ligne', 'Troisième ligne', 'Demi de mêlée', 'Demi d''ouverture', 'Centre', 'Ailier', 'Arrière'], true),
  ('tennis', 'Tennis', '🎾', ARRAY['Joueur de fond de court', 'Joueur offensif', 'Joueur polyvalent'], true),
  ('american_football', 'Football Américain', '🏈', ARRAY['Quarterback (QB)', 'Running Back (RB)', 'Wide Receiver (WR)', 'Tight End (TE)', 'Offensive Line', 'Defensive Line', 'Linebacker (LB)', 'Cornerback (CB)', 'Safety'], true),
  ('volleyball', 'Volleyball', '🏐', ARRAY['Passeur', 'Attaquant', 'Central', 'Libéro', 'Universel'], true),
  ('running', 'Course à Pied', '🏃‍♂️', ARRAY['Sprint', 'Demi-fond', 'Fond', 'Marathon', 'Trail'], true),
  ('cycling', 'Cyclisme', '🚴‍♂️', ARRAY['Route', 'VTT', 'Piste', 'BMX'], true),
  ('swimming', 'Natation', '🏊‍♂️', ARRAY['Nage libre', 'Brasse', 'Dos crawlé', 'Papillon', 'Quatre nages'], true),
  ('musculation', 'Musculation', '💪', ARRAY['Bodybuilding', 'Powerlifting', 'Haltérophilie', 'CrossFit', 'Fitness général'], true),
  ('boxing', 'Boxe', '🥊', ARRAY['Boxe anglaise', 'Boxe française', 'Kickboxing', 'MMA'], true),
  ('martial_arts', 'Arts Martiaux', '🥋', ARRAY['Karaté', 'Judo', 'Taekwondo', 'Jiu-jitsu', 'Aikido'], true),
  ('gymnastics', 'Gymnastique', '🤸‍♀️', ARRAY['Artistique', 'Rythmique', 'Acrobatique', 'Trampoline'], true),
  ('climbing', 'Escalade', '🧗‍♂️', ARRAY['Bloc', 'Voie', 'Grande voie', 'Compétition'], true),
  ('skiing', 'Ski', '🎿', ARRAY['Ski alpin', 'Ski de fond', 'Ski freestyle', 'Snowboard'], true),
  ('other', 'Autre sport', '🎯', ARRAY[], true)
ON CONFLICT (id) DO NOTHING;

-- Ajout des nouvelles colonnes à user_profiles si elles n'existent pas
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS main_objective text,
ADD COLUMN IF NOT EXISTS selected_modules text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS sport text,
ADD COLUMN IF NOT EXISTS sport_position text,
ADD COLUMN IF NOT EXISTS sport_level text,
ADD COLUMN IF NOT EXISTS season_period text,
ADD COLUMN IF NOT EXISTS training_frequency integer,
ADD COLUMN IF NOT EXISTS equipment_level text,
ADD COLUMN IF NOT EXISTS strength_objective text,
ADD COLUMN IF NOT EXISTS strength_experience text,
ADD COLUMN IF NOT EXISTS dietary_preference text,
ADD COLUMN IF NOT EXISTS food_allergies text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS nutrition_objective text,
ADD COLUMN IF NOT EXISTS dietary_restrictions text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS cooking_skill text,
ADD COLUMN IF NOT EXISTS meal_prep_time integer,
ADD COLUMN IF NOT EXISTS average_sleep_hours numeric,
ADD COLUMN IF NOT EXISTS sleep_difficulties boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sleep_schedule text,
ADD COLUMN IF NOT EXISTS sleep_environment text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS hydration_goal numeric,
ADD COLUMN IF NOT EXISTS hydration_reminders boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS hydration_context text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS stress_level integer,
ADD COLUMN IF NOT EXISTS mental_health_focus text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS recovery_preferences text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS motivation text,
ADD COLUMN IF NOT EXISTS specific_goals text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS challenges text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS privacy_consent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS marketing_consent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS lifestyle text,
ADD COLUMN IF NOT EXISTS available_time_per_day integer,
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS language text DEFAULT 'fr',
ADD COLUMN IF NOT EXISTS email_validated boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS last_login timestamp with time zone,
ADD COLUMN IF NOT EXISTS subscription_status text DEFAULT 'free';

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour sport_suggestions
CREATE TRIGGER update_sport_suggestions_updated_at
  BEFORE UPDATE ON sport_suggestions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour sports_library
CREATE TRIGGER update_sports_library_updated_at
  BEFORE UPDATE ON sports_library
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Commentaires sur les tables
COMMENT ON TABLE sport_suggestions IS 'Suggestions de nouveaux sports par les utilisateurs';
COMMENT ON TABLE sports_library IS 'Bibliothèque des sports disponibles avec leurs positions';

-- Commentaires sur les colonnes importantes
COMMENT ON COLUMN user_profiles.selected_modules IS 'Modules sélectionnés par l''utilisateur (sport, strength, nutrition, etc.)';
COMMENT ON COLUMN user_profiles.sport IS 'Sport principal de l''utilisateur';
COMMENT ON COLUMN user_profiles.sport_position IS 'Position ou spécialité dans le sport';
COMMENT ON COLUMN user_profiles.onboarding_completed IS 'Indique si l''onboarding a été terminé';
COMMENT ON COLUMN user_profiles.available_time_per_day IS 'Temps disponible par jour en minutes';

-- Vue pour les statistiques d'onboarding
CREATE OR REPLACE VIEW onboarding_stats AS
SELECT 
  COUNT(*) as total_users,
  COUNT(CASE WHEN onboarding_completed = true THEN 1 END) as completed_onboarding,
  COUNT(CASE WHEN onboarding_completed = false THEN 1 END) as pending_onboarding,
  ROUND(
    COUNT(CASE WHEN onboarding_completed = true THEN 1 END) * 100.0 / COUNT(*), 2
  ) as completion_rate,
  MODE() WITHIN GROUP (ORDER BY main_objective) as most_common_objective,
  MODE() WITHIN GROUP (ORDER BY sport) as most_common_sport,
  AVG(available_time_per_day) as avg_available_time,
  AVG(age) as avg_age
FROM user_profiles
WHERE created_at >= NOW() - INTERVAL '30 days';

-- Vue pour les sports populaires
CREATE OR REPLACE VIEW popular_sports AS
SELECT 
  s.id,
  s.name,
  s.emoji,
  COUNT(p.sport) as user_count,
  ROUND(COUNT(p.sport) * 100.0 / NULLIF(total_users.count, 0), 2) as percentage
FROM sports_library s
LEFT JOIN user_profiles p ON s.id = p.sport
CROSS JOIN (SELECT COUNT(*) as count FROM user_profiles WHERE sport IS NOT NULL) total_users
WHERE s.is_active = true
GROUP BY s.id, s.name, s.emoji, total_users.count
ORDER BY user_count DESC, s.name;

-- Grant permissions pour les vues
GRANT SELECT ON onboarding_stats TO authenticated;
GRANT SELECT ON popular_sports TO authenticated;
