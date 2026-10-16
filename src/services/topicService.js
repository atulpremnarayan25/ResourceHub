import { getDatabase, saveDatabase } from './storage';
import { supabase, isSupabaseConfigured, mapTopicFromDb, isTableMissingError, logFallbackWarning } from '../lib/supabase';

const filterTopics = (list, searchQuery) => {
  if (!searchQuery || !searchQuery.trim()) return list;
  const q = searchQuery.toLowerCase().trim();
  return list.filter(
    (t) =>
      t.name.toLowerCase().includes(q) ||
      (t.code && t.code.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q))
  );
};

export const topicService = {
  async getTopics(searchQuery = '') {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('topics')
        .select('*, resources(count)')
        .order('created_at', { ascending: true });

      if (error) {
        if (isTableMissingError(error)) {
          logFallbackWarning('topicService');
        } else {
          throw new Error(error.message);
        }
      } else {
        return filterTopics((data || []).map(mapTopicFromDb), searchQuery);
      }
    }

    // Fallback: LocalStorage Mock Engine
    const db = getDatabase();
    const list = db.topics.map((topic) => ({
      ...topic,
      resourceCount: db.resources.filter((r) => r.topicId === topic.id).length
    }));

    return filterTopics(list, searchQuery);
  },

  async getTopicById(id) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('topics')
        .select('*, resources(count)')
        .eq('id', id)
        .single();

      if (error && isTableMissingError(error)) {
        logFallbackWarning('topicService');
      } else if (error || !data) {
        throw new Error('Topic not found.');
      } else {
        return mapTopicFromDb(data);
      }
    }

    // Fallback: LocalStorage Mock Engine
    const db = getDatabase();
    const topic = db.topics.find((t) => t.id === id);
    if (!topic) {
      throw new Error('Topic not found.');
    }
    return {
      ...topic,
      resourceCount: db.resources.filter((r) => r.topicId === topic.id).length
    };
  },

  async createTopic({ name, code, description }) {
    if (!name || !name.trim()) {
      throw new Error('Topic name is required.');
    }
    const trimmedName = name.trim();

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('topics')
        .insert([{
          name: trimmedName,
          code: (code || '').trim().toUpperCase(),
          description: (description || '').trim()
        }])
        .select()
        .single();

      if (error) {
        if (isTableMissingError(error)) {
          logFallbackWarning('topicService');
        } else if (error.code === '23505') {
          throw new Error(`A topic named "${trimmedName}" already exists.`);
        } else {
          throw new Error(error.message);
        }
      } else {
        return {
          ...mapTopicFromDb(data),
          resourceCount: 0
        };
      }
    }

    // Fallback: LocalStorage Mock Engine
    const db = getDatabase();
    const exists = db.topics.some(
      (t) => t.name.toLowerCase() === trimmedName.toLowerCase()
    );
    if (exists) {
      throw new Error(`A topic named "${trimmedName}" already exists.`);
    }

    const newTopic = {
      id: `top_${Date.now()}`,
      name: trimmedName,
      code: (code || '').trim().toUpperCase(),
      description: (description || '').trim()
    };

    db.topics.push(newTopic);
    saveDatabase(db);

    return {
      ...newTopic,
      resourceCount: 0
    };
  },

  async deleteTopic(id) {
    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('topics')
        .delete()
        .eq('id', id);

      if (error) {
        if (isTableMissingError(error)) {
          logFallbackWarning('topicService');
        } else if (error.code === '23503') {
          throw new Error('Cannot delete topic with active resources. Delete or reassign resources first.');
        } else {
          throw new Error(error.message);
        }
      } else {
        return true;
      }
    }

    // Fallback: LocalStorage Mock Engine
    const db = getDatabase();
    const hasResources = db.resources.some((r) => r.topicId === id);
    if (hasResources) {
      throw new Error('Cannot delete topic with active resources. Delete or reassign resources first.');
    }

    db.topics = db.topics.filter((t) => t.id !== id);
    saveDatabase(db);
    return true;
  }
};
