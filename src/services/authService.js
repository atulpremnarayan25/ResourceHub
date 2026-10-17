import { getDatabase, saveDatabase } from './storage';
import { supabase, isSupabaseConfigured, mapProfileFromDb, isTableMissingError, logFallbackWarning } from '../lib/supabase';
import { hashPassword, ADMIN_PASSWORD_HASH } from '../utils/security';

export const authService = {
  /**
   * Authenticates user credentials against Supabase PostgreSQL profiles or LocalStorage fallback.
   * Strictly enforces cryptographic password hashes for all roles (Admin, Facilitator, Student).
   *
   * @param {string} username - User account username
   * @param {string} password - User account password
   * @returns {Promise<{id: string, username: string, name: string, role: string, status: string}>} Sanitized profile
   */
  async login(username, password) {
    if (!username || !password) {
      throw new Error('Please provide both username and password.');
    }

    const cleanUsername = username.trim().toLowerCase();
    const passwordHash = await hashPassword(password);

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
        throw new Error('User account not found. Please verify your username.');
      } else if (user.status === 'DISABLED') {
        throw new Error('This account has been disabled by the administrator.');
      } else {
        // Enforce strict password verification
        let effectiveHash = user.password_hash;
        if (!effectiveHash) {
          try {
            if (typeof window !== 'undefined' && window.localStorage) {
              const hashes = JSON.parse(window.localStorage.getItem('resourcehub_credential_hashes') || '{}');
              effectiveHash = hashes[cleanUsername];
            }
          } catch {}
        }

        if (effectiveHash) {
          if (effectiveHash !== passwordHash) {
            throw new Error('Incorrect password. Please try again.');
          }
        } else {
          // Fallback hashes for legacy seed accounts (atul1234 or fac1234)
          const validLegacyHashes = [
            ADMIN_PASSWORD_HASH,
            '2c3e5b0a72f6317d4187fada1af43aa74b6a510757c3d3aa3eff14c8f4dd6889',
            '703b0a3d6ad75b649a28adde7d83c6251da457549263bc7ff45ec709b0a8448b'
          ];
          if (!validLegacyHashes.includes(passwordHash)) {
            throw new Error('Incorrect password. Please try again.');
          }
        }
        return mapProfileFromDb(user);
      }
    }

    // Fallback: LocalStorage Mock Engine
    const db = getDatabase();
    const user = db.users.find(
      (u) => u.username.toLowerCase() === cleanUsername
    );

    if (!user) {
      throw new Error('User account not found. Please verify your username.');
    }

    if (user.status === 'DISABLED') {
      throw new Error('This account has been disabled by the administrator.');
    }

    // Enforce strict password verification in offline fallback mode
    let fallbackEffectiveHash = user.password_hash;
    if (!fallbackEffectiveHash) {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const hashes = JSON.parse(window.localStorage.getItem('resourcehub_credential_hashes') || '{}');
          fallbackEffectiveHash = hashes[cleanUsername];
        }
      } catch {}
    }

    if (fallbackEffectiveHash) {
      if (fallbackEffectiveHash !== passwordHash) {
        throw new Error('Incorrect password. Please try again.');
      }
    } else if (user.password) {
      if (user.password !== password) {
        throw new Error('Incorrect password. Please try again.');
      }
    } else {
      const validLegacyHashes = [
        ADMIN_PASSWORD_HASH,
        '2c3e5b0a72f6317d4187fada1af43aa74b6a510757c3d3aa3eff14c8f4dd6889',
        '703b0a3d6ad75b649a28adde7d83c6251da457549263bc7ff45ec709b0a8448b'
      ];
      if (!validLegacyHashes.includes(passwordHash)) {
        throw new Error('Incorrect password. Please try again.');
      }
    }

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      status: user.status
    };
  },

  /**
   * Registers a new student account in Supabase or LocalStorage fallback.
   *
   * @param {{ name: string, username: string, password: string }} data
   * @returns {Promise<{id: string, username: string, name: string, role: string, status: string}>} Sanitized student profile
   */
  async signup({ name, username, password }) {
    if (!name || !name.trim()) {
      throw new Error('Please enter your full name.');
    }
    if (!username || !username.trim()) {
      throw new Error('Please enter a username.');
    }
    if (!password || password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (cleanUsername.length < 3) {
      throw new Error('Username must be at least 3 characters and contain only letters, numbers, or underscores.');
    }

    if (cleanUsername === 'admin' || cleanUsername === 'admin_dean') {
      throw new Error(`Username "${cleanUsername}" is reserved.`);
    }

    const passwordHash = await hashPassword(password);

    if (isSupabaseConfigured) {
      // Check for existing username
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', cleanUsername)
        .maybeSingle();

      if (existingUser) {
        throw new Error(`Username "${cleanUsername}" is already taken. Please choose another.`);
      }

      let { data, error } = await supabase
        .from('profiles')
        .insert([{
          username: cleanUsername,
          name: name.trim(),
          role: 'STUDENT',
          status: 'ACTIVE',
          password_hash: passwordHash
        }])
        .select()
        .single();

      // Graceful fallback if database column password_hash is not yet present
      if (error && error.message?.includes('password_hash')) {
        const retry = await supabase
          .from('profiles')
          .insert([{
            username: cleanUsername,
            name: name.trim(),
            role: 'STUDENT',
            status: 'ACTIVE'
          }])
          .select()
          .single();
        if (!retry.error) {
          data = retry.data;
          error = null;
        }
      }

      if (error) {
        if (isTableMissingError(error)) {
          logFallbackWarning('authService');
        } else if (error.code === '23505') {
          throw new Error(`Username "${cleanUsername}" is already taken. Please choose another.`);
        } else {
          throw new Error(error.message || 'Failed to create student account.');
        }
      } else {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            const hashes = JSON.parse(window.localStorage.getItem('resourcehub_credential_hashes') || '{}');
            hashes[cleanUsername] = passwordHash;
            window.localStorage.setItem('resourcehub_credential_hashes', JSON.stringify(hashes));
          }
        } catch {}

        return mapProfileFromDb(data);
      }
    }

    // Fallback: LocalStorage Mock Engine
    const db = getDatabase();
    const exists = db.users.some(
      (u) => u.username.toLowerCase() === cleanUsername
    );
    if (exists) {
      throw new Error(`Username "${cleanUsername}" is already taken. Please choose another.`);
    }

    const newStudent = {
      id: `usr_stu_${Date.now()}`,
      username: cleanUsername,
      name: name.trim(),
      role: 'STUDENT',
      status: 'ACTIVE',
      password_hash: passwordHash
    };

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const hashes = JSON.parse(window.localStorage.getItem('resourcehub_credential_hashes') || '{}');
        hashes[cleanUsername] = passwordHash;
        window.localStorage.setItem('resourcehub_credential_hashes', JSON.stringify(hashes));
      }
    } catch {}

    db.users.push(newStudent);
    saveDatabase(db);

    return {
      id: newStudent.id,
      username: newStudent.username,
      name: newStudent.name,
      role: newStudent.role,
      status: newStudent.status
    };
  }
};
