#!/bin/bash

# Script pour corriger les erreurs systématiques restantes

echo "🔧 Correction des erreurs systématiques..."

# 1. Corriger l'espace irrégulier dans collapsible
echo "📝 Correction de l'espace dans collapsible..."
sed -i 's/\x20/ /g' /workspaces/MyFitHeroV4/client/src/components/ui/collapsible.tsx

# 2. Corriger les interfaces vides dans input.tsx
echo "📝 Correction des interfaces vides..."
sed -i 's/interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}/type InputProps = React.InputHTMLAttributes<HTMLInputElement>/' /workspaces/MyFitHeroV4/client/src/components/ui/input.tsx

# 3. Corriger les interfaces vides dans label.tsx
sed -i 's/interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}/type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>/' /workspaces/MyFitHeroV4/client/src/components/ui/label.tsx

# 4. Corriger les variables error inutilisées
echo "📝 Correction des variables error inutilisées..."
find /workspaces/MyFitHeroV4/client/src -name "*.ts" -o -name "*.tsx" | xargs sed -i 's/} catch (error)/} catch/g'

# 5. Corriger les imports inutilisés dans ExercisesPage
echo "📝 Correction d'ExercisesPage..."
sed -i 's/, useMemo//' /workspaces/MyFitHeroV4/client/src/features/workout/pages/ExercisesPage.tsx
sed -i 's/, AnimatePresence//' /workspaces/MyFitHeroV4/client/src/features/workout/pages/ExercisesPage.tsx

# 6. Corriger les paramètres inutilisés avec underscore
sed -i 's/(filterSport,/(filterSport: unknown,/' /workspaces/MyFitHeroV4/client/src/features/workout/pages/ExercisesPage.tsx
sed -i 's/(filterSport: unknown, filterPosition,/(filterSport: unknown, _filterPosition: unknown,/' /workspaces/MyFitHeroV4/client/src/features/workout/pages/ExercisesPage.tsx
sed -i 's/(filterSport: unknown, _filterPosition: unknown, filterSeasonPhase/(filterSport: unknown, _filterPosition: unknown, _filterSeasonPhase: unknown/' /workspaces/MyFitHeroV4/client/src/features/workout/pages/ExercisesPage.tsx

# 7. Corriger WorkoutPage variables inutilisées
echo "📝 Correction de WorkoutPage..."
sed -i 's/_addExercise =/__addExercise =/' /workspaces/MyFitHeroV4/client/src/features/workout/pages/WorkoutPage.tsx
sed -i 's/_getLastWeightForExercise =/__getLastWeightForExercise =/' /workspaces/MyFitHeroV4/client/src/features/workout/pages/WorkoutPage.tsx
sed -i 's/_error,/__error,/' /workspaces/MyFitHeroV4/client/src/features/workout/pages/WorkoutPage.tsx
sed -i 's/_setError/__setError/' /workspaces/MyFitHeroV4/client/src/features/workout/pages/WorkoutPage.tsx
sed -i 's/_setIsLoading/__setIsLoading/' /workspaces/MyFitHeroV4/client/src/features/workout/pages/WorkoutPage.tsx
sed -i 's/_handleCompleteWorkout =/__handleCompleteWorkout =/' /workspaces/MyFitHeroV4/client/src/features/workout/pages/WorkoutPage.tsx

# 8. Corriger les imports inutilisés dans WorkoutService
echo "📝 Correction de WorkoutService..."
sed -i 's/Exercise,//' /workspaces/MyFitHeroV4/client/src/features/workout/services/WorkoutService.ts
sed -i 's/WorkoutPlan,//' /workspaces/MyFitHeroV4/client/src/features/workout/services/WorkoutService.ts

# 9. Corriger i18n fallbackValue
echo "📝 Correction i18n..."
sed -i 's/fallbackValue/_fallbackValue/g' /workspaces/MyFitHeroV4/client/src/i18n.ts
sed -i 's/fallbackValue/_fallbackValue/g' /workspaces/MyFitHeroV4/client/src/i18n/i18n.ts

# 10. Corriger le doublon FoodPreference
echo "📝 Correction du doublon FoodPreference..."
sed -i '/^export enum FoodPreference {$/,/^}$/d' /workspaces/MyFitHeroV4/client/src/integrations/supabase/database.ts

echo "✅ Corrections systématiques terminées!"
