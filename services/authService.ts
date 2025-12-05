import { supabase, isSupabaseConfigured } from './supabaseClient';
import { User } from '../types';

// Mock user for fallback
const MOCK_USER: User = {
  id: 'mock-user-123',
  email: 'demo@businessos.ai',
  name: 'Demo Coach'
};

export const authService = {
  signUp: async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
    if (!isSupabaseConfigured() || !supabase) {
      console.warn("Supabase not configured. Using mock signup.");
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate latency
      return { user: { ...MOCK_USER, email }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      
      return { 
        user: data.user ? { id: data.user.id, email: data.user.email!, name: '' } : null, 
        error: null 
      };
    } catch (err: any) {
      return { user: null, error: err.message };
    }
  },

  signIn: async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
    if (!isSupabaseConfigured() || !supabase) {
      console.warn("Supabase not configured. Using mock login.");
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate latency
      return { user: { ...MOCK_USER, email }, error: null };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { 
        user: data.user ? { id: data.user.id, email: data.user.email!, name: '' } : null, 
        error: null 
      };
    } catch (err: any) {
      return { user: null, error: err.message };
    }
  },

  signOut: async () => {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    if (!isSupabaseConfigured() || !supabase) {
      return null;
    }
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    return { id: user.id, email: user.email!, name: '' };
  }
};