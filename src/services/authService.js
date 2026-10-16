import { getDatabase } from './storage';
import { supabase, isSupabaseConfigured, mapProfileFromDb } from '../lib/supabase';

export const authService = {
  async login(username, password) {
    if (!username || !password) {
      throw new Error('Please provide both username and password.');
    }

    const cleanUsername = username.trim().toLowerCase();

    // Enforce Admin credentials with designated password atul1234
    if (cleanUsername === 'admin' || cleanUsername === 'admin_dean') {
      if (password !== 'atul1234') {
        throw new Error('Incorrect password. Please enter the valid admin password.');
      }
      return {
        id: 'usr_adm_1',
        username: 'admin',
        name: 'System Administrator',
        role: 'ADMIN',
        status: 'ACTIVE'
      };
    }

    if (isSupabaseConfigured) {
      const { data: user, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', cleanUsername)
        .maybeSingle();

      if (error && error.code === 'PGRST205') {
        console.warn('[authService] Supabase tables not migrated yet. Falling back to local storage.');
      } else if (error || !user) {
        throw new Error('User account not found. Only the admin account is currently configured.');
      } else if (user.status === 'DISABLED') {
        throw new Error('This account has been disabled by the administrator.');
      } else {
        return mapProfileFromDb(user);
      }
    }

    // Fallback: LocalStorage Mock Engine
    await new Promise((resolve) => setTimeout(resolve, 150));
    const db = getDatabase();
    const user = db.users.find(
      (u) => u.username.toLowerCase() === cleanUsername
    );

    if (!user) {
      throw new Error('User account not found. Only the admin account is currently configured.');
    }

    if (user.status === 'DISABLED') {
      throw new Error('This account has been disabled by the administrator.');
    }

    if (user.password && user.password !== password) {
      throw new Error('Incorrect password. Please try again.');
    }

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      status: user.status
    };
  },

  getPresetAccounts() {
    return [
      {
        role: 'ADMIN',
        label: 'Administrator Account',
        username: 'admin',
        name: 'System Administrator',
        description: 'Full portal access: manage topics, provision facilitators, and oversee resources'
      }
    ];
  }
};
