import { useState, useEffect, useCallback } from 'react';

// Mock Supabase client interface for development
interface MockSupabaseClient {
  auth: {
    signIn: (credentials: { email: string; password: string }) => Promise<{ data: any; error: any }>;
    signUp: (userData: { email: string; password: string }) => Promise<{ data: any; error: any }>;
    signOut: () => Promise<{ error: any }>;
    getUser: () => Promise<{ data: { user: any }; error: any }>;
    onAuthStateChange: (callback: (event: string, session: any) => void) => { unsubscribe: () => void };
  };
  from: (table: string) => {
    select: (fields?: string) => Promise<{ data: any; error: any }>;
    insert: (data: any) => Promise<{ data: any; error: any }>;
    update: (data: any) => Promise<{ data: any; error: any }>;
    delete: () => Promise<{ data: any; error: any }>;
    eq: (column: string, value: any) => any;
  };
  storage: {
    from: (bucket: string) => {
      upload: (path: string, file: File) => Promise<{ data: any; error: any }>;
      download: (path: string) => Promise<{ data: any; error: any }>;
      remove: (paths: string[]) => Promise<{ data: any; error: any }>;
    };
  };
}

// Mock implementation for development
const createMockSupabaseClient = (): MockSupabaseClient => {
  return {
    auth: {
      signIn: async (credentials) => {
        // Mock authentication
        console.log('Mock Supabase: signIn', credentials);
        return {
          data: { user: { id: '1', email: credentials.email } },
          error: null
        };
      },
      signUp: async (userData) => {
        console.log('Mock Supabase: signUp', userData);
        return {
          data: { user: { id: '1', email: userData.email } },
          error: null
        };
      },
      signOut: async () => {
        console.log('Mock Supabase: signOut');
        return { error: null };
      },
      getUser: async () => {
        console.log('Mock Supabase: getUser');
        return {
          data: { user: { id: '1', email: 'user@example.com' } },
          error: null
        };
      },
      onAuthStateChange: (callback) => {
        console.log('Mock Supabase: onAuthStateChange');
        // Mock auth state change
        setTimeout(() => {
          callback('SIGNED_IN', { user: { id: '1', email: 'user@example.com' } });
        }, 100);
        return { unsubscribe: () => console.log('Unsubscribed from auth changes') };
      }
    },
    from: (table: string) => ({
      select: async (fields) => {
        console.log(`Mock Supabase: select from ${table}`, fields);
        return { data: [], error: null };
      },
      insert: async (data) => {
        console.log(`Mock Supabase: insert into ${table}`, data);
        return { data: [{ id: Date.now(), ...data }], error: null };
      },
      update: async (data) => {
        console.log(`Mock Supabase: update ${table}`, data);
        return { data: [{ id: 1, ...data }], error: null };
      },
      delete: async () => {
        console.log(`Mock Supabase: delete from ${table}`);
        return { data: null, error: null };
      },
      eq: (column, value) => {
        console.log(`Mock Supabase: filter ${column} = ${value}`);
        return {
          select: async (fields) => ({ data: [], error: null }),
          update: async (data) => ({ data: [data], error: null }),
          delete: async () => ({ data: null, error: null })
        };
      }
    }),
    storage: {
      from: (bucket: string) => ({
        upload: async (path: string, file: File) => {
          console.log(`Mock Supabase: upload to ${bucket}/${path}`, file.name);
          return { 
            data: { path: `${bucket}/${path}`, fullPath: `mock-url/${bucket}/${path}` }, 
            error: null 
          };
        },
        download: async (path: string) => {
          console.log(`Mock Supabase: download from ${bucket}/${path}`);
          return { data: new Blob(['mock file content']), error: null };
        },
        remove: async (paths: string[]) => {
          console.log(`Mock Supabase: remove from ${bucket}`, paths);
          return { data: null, error: null };
        }
      })
    }
  };
};

export interface UseSupabaseReturn {
  client: MockSupabaseClient;
  isConnected: boolean;
  error: string | null;
  // Auth methods
  signIn: (email: string, password: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  signOut: () => Promise<{ success: boolean; error?: string }>;
  getCurrentUser: () => Promise<{ success: boolean; data?: any; error?: string }>;
  // Database methods
  query: (table: string, options?: { select?: string; filters?: Record<string, any> }) => Promise<{ success: boolean; data?: any; error?: string }>;
  insert: (table: string, data: any) => Promise<{ success: boolean; data?: any; error?: string }>;
  update: (table: string, id: any, data: any) => Promise<{ success: boolean; data?: any; error?: string }>;
  remove: (table: string, id: any) => Promise<{ success: boolean; error?: string }>;
  // Storage methods
  uploadFile: (bucket: string, path: string, file: File) => Promise<{ success: boolean; data?: any; error?: string }>;
  downloadFile: (bucket: string, path: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  deleteFile: (bucket: string, paths: string[]) => Promise<{ success: boolean; error?: string }>;
}

export const useSupabase = (): UseSupabaseReturn => {
  const [client] = useState<MockSupabaseClient>(() => createMockSupabaseClient());
  const [isConnected, setIsConnected] = useState(true); // Mock as always connected
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Mock connection check
    const checkConnection = () => {
      setIsConnected(true);
      setError(null);
    };

    checkConnection();
  }, []);

  // Auth methods
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await client.auth.signIn({ email, password });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Sign in failed' 
      };
    }
  }, [client]);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await client.auth.signUp({ email, password });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Sign up failed' 
      };
    }
  }, [client]);

  const signOut = useCallback(async () => {
    try {
      const { error } = await client.auth.signOut();
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Sign out failed' 
      };
    }
  }, [client]);

  const getCurrentUser = useCallback(async () => {
    try {
      const { data, error } = await client.auth.getUser();
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data: data.user };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Get user failed' 
      };
    }
  }, [client]);

  // Database methods
  const query = useCallback(async (
    table: string, 
    options?: { select?: string; filters?: Record<string, any> }
  ) => {
    try {
      let queryBuilder = client.from(table);
      
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          queryBuilder = queryBuilder.eq(key, value);
        });
      }
      
      const { data, error } = await queryBuilder.select(options?.select);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Query failed' 
      };
    }
  }, [client]);

  const insert = useCallback(async (table: string, data: any) => {
    try {
      const { data: insertedData, error } = await client.from(table).insert(data);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data: insertedData };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Insert failed' 
      };
    }
  }, [client]);

  const update = useCallback(async (table: string, id: any, data: any) => {
    try {
      const { data: updatedData, error } = await client.from(table).eq('id', id).update(data);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data: updatedData };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Update failed' 
      };
    }
  }, [client]);

  const remove = useCallback(async (table: string, id: any) => {
    try {
      const { error } = await client.from(table).eq('id', id).delete();
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Delete failed' 
      };
    }
  }, [client]);

  // Storage methods
  const uploadFile = useCallback(async (bucket: string, path: string, file: File) => {
    try {
      const { data, error } = await client.storage.from(bucket).upload(path, file);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Upload failed' 
      };
    }
  }, [client]);

  const downloadFile = useCallback(async (bucket: string, path: string) => {
    try {
      const { data, error } = await client.storage.from(bucket).download(path);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true, data };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Download failed' 
      };
    }
  }, [client]);

  const deleteFile = useCallback(async (bucket: string, paths: string[]) => {
    try {
      const { error } = await client.storage.from(bucket).remove(paths);
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err) {
      return { 
        success: false, 
        error: err instanceof Error ? err.message : 'Delete failed' 
      };
    }
  }, [client]);

  return {
    client,
    isConnected,
    error,
    signIn,
    signUp,
    signOut,
    getCurrentUser,
    query,
    insert,
    update,
    remove,
    uploadFile,
    downloadFile,
    deleteFile
  };
};

export default useSupabase;
