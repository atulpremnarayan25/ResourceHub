import { getDatabase, saveDatabase } from './storage';
import { supabase, isSupabaseConfigured, mapProfileFromDb, isTableMissingError, logFallbackWarning } from '../lib/supabase';
import { hashPassword } from '../utils/security';

export const adminService = {
  async getFacilitators() {
    if (isSupabaseConfigured) {
      const { data: facilitators, error: fErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'FACILITATOR')
        .order('created_at', { ascending: true });

      if (fErr) {
        if (isTableMissingError(fErr)) {
          logFallbackWarning('adminService');
        } else {
          throw new Error(fErr.message);
        }
      } else {
        const { data: resources, error: rErr } = await supabase
          .from('resources')
          .select('uploaded_by');

        if (rErr) throw new Error(rErr.message);

        const counts = (resources || []).reduce((acc, r) => {
          acc[r.uploaded_by] = (acc[r.uploaded_by] || 0) + 1;
          return acc;
        }, {});

        return (facilitators || []).map((f) => ({
          ...mapProfileFromDb(f),
          uploadCount: counts[f.username] || 0
        }));
      }
    }

    // Fallback: LocalStorage Mock Engine
    const db = getDatabase();

    const facilitators = db.users
      .filter((u) => u.role === 'FACILITATOR')
      .map((f) => {
        const uploadCount = db.resources.filter((r) => r.uploadedBy === f.username).length;
        return {
          ...f,
          uploadCount
        };
      });

    return facilitators;
  },

  async createFacilitator({ username, name, password }) {
    if (!username || !username.trim()) {
      throw new Error('Username is required.');
    }
    if (!name || !name.trim()) {
      throw new Error('Full name is required.');
    }
    if (!password || password.length < 6) {
      throw new Error('Initial password must be at least 6 characters.');
    }

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    const passwordHash = await hashPassword(password);

    if (isSupabaseConfigured) {
      let { data, error } = await supabase
        .from('profiles')
        .insert([{
          username: cleanUsername,
          name: name.trim(),
          role: 'FACILITATOR',
          status: 'ACTIVE',
          password_hash: passwordHash
        }])
        .select()
        .single();

      // Graceful fallback if database column password_hash is not yet added
      if (error && error.message?.includes('password_hash')) {
        const retry = await supabase
          .from('profiles')
          .insert([{
            username: cleanUsername,
            name: name.trim(),
            role: 'FACILITATOR',
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
          logFallbackWarning('adminService');
        } else if (error.code === '23505') {
          throw new Error(`Username "${cleanUsername}" is already taken.`);
        } else {
          throw new Error(error.message);
        }
      } else {
        // Cache password hash in localStorage for client-side fallback when Supabase lacks password_hash column
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            const hashes = JSON.parse(window.localStorage.getItem('resourcehub_credential_hashes') || '{}');
            hashes[cleanUsername] = passwordHash;
            window.localStorage.setItem('resourcehub_credential_hashes', JSON.stringify(hashes));
          }
        } catch {}

        return {
          ...mapProfileFromDb(data),
          uploadCount: 0
        };
      }
    }

    // Fallback: LocalStorage Mock Engine
    const db = getDatabase();

    const exists = db.users.some(
      (u) => u.username.toLowerCase() === cleanUsername
    );
    if (exists) {
      throw new Error(`Username "${cleanUsername}" is already taken.`);
    }

    const newFacilitator = {
      id: `usr_fac_${Date.now()}`,
      username: cleanUsername,
      name: name.trim(),
      role: 'FACILITATOR',
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

    db.users.push(newFacilitator);
    saveDatabase(db);

    return {
      ...newFacilitator,
      uploadCount: 0
    };
  },

  async toggleFacilitatorStatus(id) {
    if (isSupabaseConfigured) {
      const { data: current, error: fetchErr } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', id)
        .single();

      if (fetchErr && isTableMissingError(fetchErr)) {
        logFallbackWarning('adminService');
      } else if (fetchErr || !current) {
        throw new Error('Facilitator not found.');
      } else {
        const newStatus = current.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';

        const { data, error: updateErr } = await supabase
          .from('profiles')
          .update({ status: newStatus })
          .eq('id', id)
          .select()
          .single();

        if (updateErr) throw new Error(updateErr.message);
        return mapProfileFromDb(data);
      }
    }

    // Fallback: LocalStorage Mock Engine
    const db = getDatabase();
    const facilitator = db.users.find((u) => u.id === id && u.role === 'FACILITATOR');

    if (!facilitator) {
      throw new Error('Facilitator not found.');
    }

    facilitator.status = facilitator.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    saveDatabase(db);

    return facilitator;
  },

  async deleteFacilitator(id) {
    if (isSupabaseConfigured) {
      const { data: fac, error: fetchErr } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', id)
        .single();

      if (fetchErr && isTableMissingError(fetchErr)) {
        logFallbackWarning('adminService');
      } else if (fetchErr || !fac) {
        throw new Error('Facilitator not found.');
      } else {
        // Check active uploads
        const { count, error: countErr } = await supabase
          .from('resources')
          .select('*', { count: 'exact', head: true })
          .eq('uploaded_by', fac.username);

        if (countErr) throw new Error(countErr.message);

        if ((count || 0) > 0) {
          throw new Error('Cannot delete facilitator with existing resource uploads. Disable their account instead.');
        }

        const { error: delErr } = await supabase
          .from('profiles')
          .delete()
          .eq('id', id);

        if (delErr) throw new Error(delErr.message);
        return true;
      }
    }

    // Fallback: LocalStorage Mock Engine
    const db = getDatabase();
    const facilitator = db.users.find((u) => u.id === id && u.role === 'FACILITATOR');

    if (!facilitator) {
      throw new Error('Facilitator not found.');
    }

    const hasUploads = db.resources.some((r) => r.uploadedBy === facilitator.username);
    if (hasUploads) {
      throw new Error('Cannot delete facilitator with existing resource uploads. Disable their account instead.');
    }

    db.users = db.users.filter((u) => u.id !== id);
    saveDatabase(db);
    return true;
  }
};
