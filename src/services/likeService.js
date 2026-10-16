import { getDatabase, saveDatabase } from './storage';
import { supabase, isSupabaseConfigured, isTableMissingError, logFallbackWarning } from '../lib/supabase';

export const likeService = {
  /**
   * Get an array of resourceIds liked by the given student.
   */
  async getLikedResourceIds(studentId) {
    if (!studentId) return [];

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('likes')
        .select('resource_id')
        .eq('student_id', studentId);

      if (error) {
        if (isTableMissingError(error)) {
          logFallbackWarning('likeService');
        } else {
          console.error('Error fetching likes:', error);
          return [];
        }
      } else {
        return (data || []).map((l) => l.resource_id);
      }
    }

    // Fallback: LocalStorage Mock Engine
    const db = getDatabase();
    return db.likes
      .filter((l) => l.studentId === studentId)
      .map((l) => l.resourceId);
  },

  /**
   * Check whether a specific resource has been liked by the student.
   */
  async hasStudentLiked(studentId, resourceId) {
    if (!studentId || !resourceId) return false;

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('likes')
        .select('id')
        .eq('student_id', studentId)
        .eq('resource_id', resourceId)
        .maybeSingle();

      if (error) {
        if (isTableMissingError(error)) {
          logFallbackWarning('likeService');
        } else {
          return false;
        }
      } else {
        return Boolean(data);
      }
    }

    // Fallback: LocalStorage Mock Engine
    const db = getDatabase();
    return db.likes.some(
      (l) => l.studentId === studentId && l.resourceId === resourceId
    );
  },

  /**
   * Toggle like status for a student on a resource.
   * Enforces pair uniqueness: 1 like per student per resource.
   * Leverages Postgres composite unique constraint and trigger.
   */
  async toggleLike(studentId, resourceId) {
    if (!studentId) throw new Error('Student identifier is required to like.');
    if (!resourceId) throw new Error('Resource identifier is required.');

    if (isSupabaseConfigured) {
      const { data: existing, error: fetchErr } = await supabase
        .from('likes')
        .select('id')
        .eq('student_id', studentId)
        .eq('resource_id', resourceId)
        .maybeSingle();

      if (fetchErr && isTableMissingError(fetchErr)) {
        logFallbackWarning('likeService');
      } else if (fetchErr) {
        throw new Error(fetchErr.message);
      } else {
        let isLiked = false;
        if (existing) {
          // Remove like (PostgreSQL trigger automatically decrements resources.like_count)
          const { error: delErr } = await supabase
            .from('likes')
            .delete()
            .eq('id', existing.id);

          if (delErr) throw new Error(delErr.message);
          isLiked = false;
        } else {
          // Insert like (PostgreSQL trigger automatically increments resources.like_count)
          const { error: insErr } = await supabase
            .from('likes')
            .insert([{
              student_id: studentId,
              resource_id: resourceId
            }]);

          if (insErr) {
            // Catch unique constraint violation (23505) gracefully
            if (insErr.code === '23505') {
              isLiked = true;
            } else {
              throw new Error(insErr.message);
            }
          } else {
            isLiked = true;
          }
        }

        // Fetch atomic synchronized like_count from database
        const { data: resRow } = await supabase
          .from('resources')
          .select('like_count')
          .eq('id', resourceId)
          .single();

        return {
          liked: isLiked,
          likeCount: resRow?.like_count ?? 0
        };
      }
    }

    // Fallback: LocalStorage Mock Engine
    const db = getDatabase();
    const resource = db.resources.find((r) => r.id === resourceId);
    if (!resource) {
      throw new Error('Resource not found.');
    }

    const existingIndex = db.likes.findIndex(
      (l) => l.studentId === studentId && l.resourceId === resourceId
    );

    let isLiked = false;
    if (existingIndex >= 0) {
      // Remove like (unlike)
      db.likes.splice(existingIndex, 1);
      resource.likeCount = Math.max(0, (resource.likeCount || 1) - 1);
      isLiked = false;
    } else {
      // Add like
      db.likes.push({
        id: `lik_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        studentId,
        resourceId,
        createdAt: new Date().toISOString()
      });
      resource.likeCount = (resource.likeCount || 0) + 1;
      isLiked = true;
    }

    saveDatabase(db);
    return {
      liked: isLiked,
      likeCount: resource.likeCount
    };
  }
};
