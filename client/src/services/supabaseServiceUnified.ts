// services/unifiedSupabaseService.ts - SERVICE UNIFIÉ
// 🎯 Centralise les 30+ patterns Supabase dupliqués

import { supabase } from '@/config/supabaseClient';
import type { Database } from '@/features/workout/types/database';

// Types génériques pour les opérations CRUD
type TableName = keyof Database['public']['Tables'];
type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row'];
type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert'];
type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update'];

// Interface standardisée pour les réponses
export interface SupabaseResponse<T = unknown> {
  data: T | null;
  error: string | null;
  count?: number;
}

// Interface pour les filtres
export interface QueryFilter {
  column: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in';
  value: string | number | boolean | null | string[];
}

// Interface pour les options de requête
export interface QueryOptions {
  filters?: QueryFilter[];
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
  offset?: number;
  columns?: string;
}

class UnifiedSupabaseService {
  // GET - Récupération avec gestion d'erreur unifiée
  async get<T extends TableName>(
    table: T,
    options: QueryOptions = {}
  ): Promise<SupabaseResponse<TableRow<T>[]>> {
    try {
      const { columns = '*', filters = [], orderBy, limit, offset } = options;

      let query = supabase.from(table).select(columns, { count: 'exact' });

      // Appliquer les filtres
      filters.forEach(filter => {
        query = query[filter.operator](filter.column, filter.value);
      });

      // Appliquer le tri
      if (orderBy) {
        query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
      }

      // Appliquer la pagination
      if (limit) query = query.limit(limit);
      if (offset) query = query.range(offset, offset + (limit || 10) - 1);

      const { data, error, count } = await query;

      return {
        data: data as TableRow<T>[],
        error: error?.message || null,
        count: count || 0,
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Erreur inconnue',
        count: 0,
      };
    }
  }

  // GET BY ID - Récupération d'un enregistrement par ID
  async getById<T extends TableName>(
    table: T,
    id: string,
    columns: string = '*'
  ): Promise<SupabaseResponse<TableRow<T>>> {
    try {
      const { data: _data, error: _error } = await supabase.from(table).select(columns).eq('id', id).single();

      return {
        data: data as TableRow<T>,
        error: error?.message || null,
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Erreur inconnue',
      };
    }
  }

  // GET BY USER - Pattern très fréquent pour les données utilisateur
  async getByUserId<T extends TableName>(
    table: T,
    userId: string,
    options: Omit<QueryOptions, 'filters'> = {}
  ): Promise<SupabaseResponse<TableRow<T>[]>> {
    return this.get(table, {
      ...options,
      filters: [{ column: 'user_id', operator: 'eq', value: userId }],
    });
  }

  // CREATE - Insertion avec gestion d'erreur unifiée
  async create<T extends TableName>(
    table: T,
    data: TableInsert<T>
  ): Promise<SupabaseResponse<TableRow<T>>> {
    try {
      const { data: insertedData, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();

      return {
        data: insertedData as TableRow<T>,
        error: error?.message || null,
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Erreur inconnue',
      };
    }
  }

  // UPSERT - Pattern très utilisé pour les statistics/logs
  async upsert<T extends TableName>(
    table: T,
    data: TableInsert<T>,
    conflictColumns?: string[]
  ): Promise<SupabaseResponse<TableRow<T>>> {
    try {
      const { data: upsertedData, error } = await supabase
        .from(table)
        .upsert(data, {
          onConflict: conflictColumns?.join(',') || 'id',
          ignoreDuplicates: false,
        })
        .select()
        .single();

      return {
        data: upsertedData as TableRow<T>,
        error: error?.message || null,
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Erreur inconnue',
      };
    }
  }

  // UPDATE - Mise à jour avec gestion d'erreur unifiée
  async update<T extends TableName>(
    table: T,
    id: string,
    data: TableUpdate<T>
  ): Promise<SupabaseResponse<TableRow<T>>> {
    try {
      const { data: updatedData, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      return {
        data: updatedData as TableRow<T>,
        error: error?.message || null,
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Erreur inconnue',
      };
    }
  }

  // DELETE - Suppression avec gestion d'erreur unifiée
  async delete<T extends TableName>(table: T, id: string): Promise<SupabaseResponse<void>> {
    try {
      const { error } = await supabase.from(table).delete().eq('id', id);

      return {
        data: null,
        error: error?.message || null,
      };
    } catch (err) {
      return {
        data: null,
        error: err instanceof Error ? err.message : 'Erreur inconnue',
      };
    }
  }

  // Helpers spécialisés pour les patterns les plus fréquents

  // Pattern workout: récupérer les workouts d'un utilisateur avec tri par date
  async getUserWorkouts(userId: string, limit = 50) {
    return this.getByUserId('workouts', userId, {
      orderBy: { column: 'created_at', ascending: false },
      limit,
    });
  }

  // Pattern daily_stats: upsert des stats quotidiennes
  async upsertDailyStats(userId: string, date: string, stats: Record<string, unknown>) {
    return this.upsert(
      'daily_stats',
      {
        user_id: userId,
        stat_date: date,
        ...stats,
        updated_at: new Date().toISOString(),
      },
      ['user_id', 'stat_date']
    );
  }

  // Pattern user_profile: récupérer le profil complet
  async getUserProfile(userId: string) {
    return this.getById('user_profiles', userId);
  }
}

// Instance singleton exportée
export const supabaseService = new UnifiedSupabaseService();

// Export des types pour faciliter l'utilisation
export type { SupabaseResponse, QueryFilter, QueryOptions, TableRow, TableInsert, TableUpdate };
