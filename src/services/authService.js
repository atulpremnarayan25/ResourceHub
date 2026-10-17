import { getDatabase } from './storage';
import { supabase, isSupabaseConfigured, mapProfileFromDb, isTableMissingError, logFallbackWarning } from '../lib/supabase';

// SHA-256 hash of authorized administrator password
const ADMIN_PASSWORD_HASH = '1f3d10477ff4b02ceeb0e3b177e52d338319db885cbb1d6402a39043a6023483';

const computeHash = async (text) => {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoded = new TextEncoder().encode(text);
    const buffer = await crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return text;
};

export const authService = {
  async login(username, password) {
    if (!username || !password) {
      throw new Error('Please provide both username and password.');
    }

    const cleanUsername = username.trim().toLowerCase();
    const passwordHash = await computeHash(password);

    // Enforce Admin credentials via cryptographic hash comparison
    if (cleanUsername === 'admin' || cleanUsername === 'admin_dean') {
      if (passwordHash !== ADMIN_PASSWORD_HASH) {
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

      if (error && isTableMissingError(error)) {
        logFallbackWarning('authService');
      } else if (error || !user) {
        throw new Error('User account not found. Only the admin account is currently configured.');
      } else if (user.status === 'DISABLED') {
        throw new Error('This account has been disabled by the administrator.');
      } else {
        return mapProfileFromDb(user);
      }
    }

    // Fallback: LocalStorage Mock Engine
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
  }
};
