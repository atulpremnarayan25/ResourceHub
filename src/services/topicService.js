import { getDatabase, saveDatabase } from './storage';
import { supabase, isSupabaseConfigured, mapTopicFromDb } from '../lib/supabase';

export const topicService = {
  async getTopics(searchQuery = '') {
    if (isSupabaseConfigured) {
      let query = supabase
        .from('topics')
        .select('*, resources(count)')
        .order('created_at', { ascending: true });

      const { data, error } = await query;
      if (error) throw new Error(error.message);

      let list = (data || []).map(mapTopicFromDb);
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        list = list.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            (t.code && t.code.toLowerCase().includes(q)) ||
            (t.description && t.description.toLowerCase().includes(q))
        );
      }
      return list;
    }

    // Fallback: LocalStorage Mock Engine
    await new Promise((resolve) => setTimeout(resolve, 120));
    const db = getDatabase();

    let list = db.topics.map((topic) => {
      const resourceCount = db.resources.filter((r) => r.topicId === topic.id).length;
      return {
        ...topic,
        resourceCount
      };
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          (t.code && t.code.toLowerCase().includes(q)) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    return list;
  },

  async getTopicById(id) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('topics')
        .select('*, resources(count)')
        .eq('id', id)
        .single();

      if (error || !data) throw new Error('Topic not found.');
      return mapTopicFromDb(data);
    }

    // Fallback: LocalStorage Mock Engine
    await new Promise((resolve) => setTimeout(resolve, 100));
    const db = getDatabase();
    const topic = db.topics.find((t) => t.id === id);
    if (!topic) {
      throw new Error('Topic not found.');
    }
    const resourceCount = db.resources.filter((r) => r.topicId === topic.id).length;
    return {
      ...topic,
      resourceCount
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
        if (error.code === '23505') {
          throw new Error(`A topic named "${trimmedName}" already exists.`);
        }
        throw new Error(error.message);
      }

      return {
        ...mapTopicFromDb(data),
        resourceCount: 0
      };
    }

    // Fallback: LocalStorage Mock Engine
    await new Promise((resolve) => setTimeout(resolve, 150));
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
        // PostgreSQL Foreign Key Violation (23503)
        if (error.code === '23503') {
          throw new Error('Cannot delete topic with active resources. Delete or reassign resources first.');
        }
        throw new Error(error.message);
      }
      return true;
    }

    // Fallback: LocalStorage Mock Engine
    await new Promise((resolve) => setTimeout(resolve, 150));
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
