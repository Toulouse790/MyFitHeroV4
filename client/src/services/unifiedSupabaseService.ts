import { supabase } from '@/config/supabaseClient';

// Types génériques pour les opérations Supabase
export interface SupabaseQueryOptions {
  select?: string;
  limit?: number;
  offset?: number;
  orderBy?: { column: string; ascending?: boolean };
  filters?: Array<{
    column: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'ilike' | 'in';
    value: string | number | boolean | null;
  }>;
}

export interface SupabaseResponse<T> {
  data: T | null;
  error: Error | null;
  count?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  currentPage: number;
  totalPages: number;
}

/**
 * Service centralisé unifié pour toutes les opérations Supabase
 * Élimine la duplication des 30+ appels Supabase identiques
 */
class UnifiedSupabaseService {
  // CRUD générique
  async findMany<T>(
    table: string,
    options: SupabaseQueryOptions = {}
  ): Promise<SupabaseResponse<T[]>> {
    try {
      let query = supabase.from(table).select(options.select || '*', {
        count: 'exact',
      });

      // Appliquer les filtres
      if (options.filters) {
        options.filters.forEach(filter => {
          query = query[filter.operator](filter.column, filter.value);
        });
      }

      // Appliquer l'ordre
      if (options.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true,
        });
      }

      // Appliquer la pagination
      if (options.limit) {
        query = query.limit(options.limit);
      }
      if (options.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      return await query;
    } catch (error) {
      return { data: null, error };
    }
  }

  async findById<T>(table: string, id: string, select?: string): Promise<SupabaseResponse<T>> {
    try {
      return await supabase
        .from(table)
        .select(select || '*')
        .eq('id', id)
        .single();
    } catch (error) {
      return { data: null, error };
    }
  }

  async findByUserId<T>(
    table: string,
    userId: string,
    options: SupabaseQueryOptions = {}
  ): Promise<SupabaseResponse<T[]>> {
    return this.findMany<T>(table, {
      ...options,
      filters: [{ column: 'user_id', operator: 'eq', value: userId }, ...(options.filters || [])],
    });
  }

  async create<T>(table: string, data: Partial<T>): Promise<SupabaseResponse<T>> {
    try {
      return await supabase.from(table).insert(data).select().single();
    } catch (error) {
      return { data: null, error };
    }
  }

  async createMany<T>(table: string, data: Partial<T>[]): Promise<SupabaseResponse<T[]>> {
    try {
      return await supabase.from(table).insert(data).select();
    } catch (error) {
      return { data: null, error };
    }
  }

  async update<T>(table: string, id: string, data: Partial<T>): Promise<SupabaseResponse<T>> {
    try {
      return await supabase.from(table).update(data).eq('id', id).select().single();
    } catch (error) {
      return { data: null, error };
    }
  }

  async upsert<T>(table: string, data: Partial<T>): Promise<SupabaseResponse<T>> {
    try {
      return await supabase.from(table).upsert(data).select().single();
    } catch (error) {
      return { data: null, error };
    }
  }

  async delete(table: string, id: string): Promise<SupabaseResponse<null>> {
    try {
      return await supabase.from(table).delete().eq('id', id);
    } catch (error) {
      return { data: null, error };
    }
  }

  // Méthodes spécialisées communes
  async findWithPagination<T>(
    table: string,
    page: number = 1,
    limit: number = 10,
    options: Omit<SupabaseQueryOptions, 'limit' | 'offset'> = {}
  ): Promise<PaginatedResponse<T>> {
    const offset = (page - 1) * limit;

    const { data, error, count } = await this.findMany<T>(table, {
      ...options,
      limit,
      offset,
    });

    if (error || !data) {
      throw new Error(error?.message || 'Erreur lors de la récupération des données');
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data,
      count: count || 0,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      currentPage: page,
      totalPages,
    };
  }

  async searchByText<T>(
    table: string,
    searchColumn: string,
    searchTerm: string,
    options: SupabaseQueryOptions = {}
  ): Promise<SupabaseResponse<T[]>> {
    return this.findMany<T>(table, {
      ...options,
      filters: [
        { column: searchColumn, operator: 'ilike', value: `%${searchTerm}%` },
        ...(options.filters || []),
      ],
    });
  }

  // Gestion des stats/métriques
  async getDailyStats(userId: string, date: string) {
    return this.findMany('daily_stats', {
      filters: [
        { column: 'user_id', operator: 'eq', value: userId },
        { column: 'date', operator: 'eq', value: date },
      ],
    });
  }

  async getWeeklyStats(userId: string, startDate: string, endDate: string) {
    return this.findMany('daily_stats', {
      filters: [
        { column: 'user_id', operator: 'eq', value: userId },
        { column: 'date', operator: 'gte', value: startDate },
        { column: 'date', operator: 'lte', value: endDate },
      ],
      orderBy: { column: 'date', ascending: true },
    });
  }

  // Authentification helper
  async getCurrentUser() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return { data: user, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }
}

// Instance singleton
export const unifiedSupabaseService = new UnifiedSupabaseService();
export default unifiedSupabaseService;
