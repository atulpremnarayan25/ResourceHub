import { getDatabase } from './storage';
import { supabase, isSupabaseConfigured, mapProfileFromDb } from '../lib/supabase';

export const authService = {
  async login(username, password) {
    if (!username || !password) {
      throw new Error('Please provide both username and password.');
    }

    if (isSupabaseConfigured) {
      const cleanUsername = username.trim().toLowerCase();
      const { data: user, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', cleanUsername)
        .maybeSingle();

      if (error || !user) {
        throw new Error('User account not found. Please check your username.');
      }

      if (user.status === 'DISABLED') {
        throw new Error('This account has been disabled by the administrator.');
      }

      return mapProfileFromDb(user);
    }

    // Fallback: LocalStorage Mock Engine
    await new Promise((resolve) => setTimeout(resolve, 150));
    const db = getDatabase();
    const user = db.users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!user) {
      throw new Error('User account not found. Please check your username.');
    }

    if (user.status === 'DISABLED') {
      throw new Error('This account has been disabled by the administrator.');
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
        role: 'STUDENT',
        label: 'Student Account',
        username: 'student_arun',
        name: 'Arun Patel',
        description: 'Browse topics, download materials, like/unlike resources'
      },
      {
        role: 'FACILITATOR',
        label: 'Facilitator Account',
        username: 'prof_sharma',
        name: 'Prof. Rahul Sharma',
        description: 'Upload PDF/PPTX resources to topics, manage own uploads'
      },
      {
        role: 'ADMIN',
        label: 'Administrator Account',
        username: 'admin_dean',
        name: 'Dean Academic Affairs',
        description: 'Create and manage topics, provision and disable facilitators'
      }
    ];
  }
};
