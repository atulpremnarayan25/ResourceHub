import { getDatabase, saveDatabase } from './storage';
import { generateStoredFilename } from '../utils/namingConvention';
import { supabase, isSupabaseConfigured, mapResourceFromDb } from '../lib/supabase';

export const resourceService = {
  async getResources({ topicId, uploader, searchQuery, fileType } = {}) {
    if (isSupabaseConfigured) {
      let query = supabase
        .from('resources')
        .select('*, topics(name)')
        .order('uploaded_at', { ascending: false });

      if (topicId) query = query.eq('topic_id', topicId);
      if (uploader) query = query.eq('uploaded_by', uploader);
      if (fileType && fileType !== 'ALL') query = query.eq('file_type', fileType.toUpperCase());

      const { data, error } = await query;
      if (error) {
        if (error.code === 'PGRST205') {
          console.warn('[resourceService] Supabase tables not migrated yet. Falling back to local storage.');
        } else {
          throw new Error(error.message);
        }
      } else {
        let list = (data || []).map(mapResourceFromDb);
        if (searchQuery && searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          list = list.filter(
            (r) =>
              r.title.toLowerCase().includes(q) ||
              (r.storedFilename && r.storedFilename.toLowerCase().includes(q)) ||
              (r.uploaderName && r.uploaderName.toLowerCase().includes(q))
          );
        }
        return list;
      }
    }

    // Fallback: LocalStorage Mock Engine
    await new Promise((resolve) => setTimeout(resolve, 100));
    const db = getDatabase();
    let list = [...db.resources];

    if (topicId) {
      list = list.filter((r) => r.topicId === topicId);
    }

    if (uploader) {
      list = list.filter((r) => r.uploadedBy === uploader);
    }

    if (fileType && fileType !== 'ALL') {
      list = list.filter((r) => r.fileType.toUpperCase() === fileType.toUpperCase());
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          (r.storedFilename && r.storedFilename.toLowerCase().includes(q)) ||
          (r.uploaderName && r.uploaderName.toLowerCase().includes(q))
      );
    }

    // Attach topic name for cross-topic listings
    list = list.map((r) => {
      const topic = db.topics.find((t) => t.id === r.topicId);
      return {
        ...r,
        topicName: topic ? topic.name : 'General'
      };
    });

    // Sort newest first
    list.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    return list;
  },

  async getResourceById(id) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from('resources')
        .select('*, topics(name)')
        .eq('id', id)
        .single();

      if (error || !data) throw new Error('Resource not found.');
      return mapResourceFromDb(data);
    }

    // Fallback: LocalStorage Mock Engine
    await new Promise((resolve) => setTimeout(resolve, 80));
    const db = getDatabase();
    const resource = db.resources.find((r) => r.id === id);
    if (!resource) {
      throw new Error('Resource not found.');
    }
    const topic = db.topics.find((t) => t.id === resource.topicId);
    return {
      ...resource,
      topicName: topic ? topic.name : 'General'
    };
  },

  async uploadResource({ topicId, title, file, uploader }) {
    if (!topicId) throw new Error('Please select a topic.');
    if (!title || !title.trim()) throw new Error('Resource title is required.');
    if (!file) throw new Error('Please select a file to upload.');

    const extension = file.name.split('.').pop().toLowerCase();
    const allowed = ['pdf', 'ppt', 'pptx'];
    if (!allowed.includes(extension)) {
      throw new Error('Invalid file format. Only PDF, PPT, and PPTX files are allowed.');
    }

    // Maximum 15 MB check
    const maxBytes = 15 * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new Error('File exceeds the 15 MB size limit.');
    }

    const normalizedExt = extension === 'pdf' ? 'pdf' : 'pptx';
    const fileType = extension === 'pdf' ? 'PDF' : 'PPTX';
    const storedFilename = generateStoredFilename(
      uploader.username,
      title,
      normalizedExt,
      new Date()
    );

    // Format file size string
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    const fileSize = `${sizeInMb} MB`;

    if (isSupabaseConfigured) {
      // 1. Upload file binary directly to Supabase Storage bucket 'resources'
      const { error: storageError } = await supabase.storage
        .from('resources')
        .upload(storedFilename, file, { cacheControl: '3600', upsert: false });

      if (storageError) {
        throw new Error(`Storage upload failed: ${storageError.message}`);
      }

      // 2. Fetch public URL for uploaded asset
      const { data: publicUrlData } = supabase.storage
        .from('resources')
        .getPublicUrl(storedFilename);

      const fileUrl = publicUrlData?.publicUrl || '';

      // 3. Insert metadata record in PostgreSQL 'resources' table
      const { data, error: insertError } = await supabase
        .from('resources')
        .insert([{
          topic_id: topicId,
          title: title.trim(),
          original_filename: file.name,
          stored_filename: storedFilename,
          file_type: fileType,
          file_size: fileSize,
          file_url: fileUrl,
          uploaded_by: uploader.username,
          uploader_name: uploader.name || uploader.username,
          like_count: 0
        }])
        .select('*, topics(name)')
        .single();

      if (insertError) {
        if (insertError.code === 'PGRST205') {
          console.warn('[resourceService] Supabase tables not migrated yet. Falling back to local storage.');
        } else {
          // Rollback uploaded file if metadata insertion fails
          await supabase.storage.from('resources').remove([storedFilename]);
          throw new Error(insertError.message);
        }
      } else {
        return mapResourceFromDb(data);
      }
    }

    // Fallback: LocalStorage Mock Engine
    await new Promise((resolve) => setTimeout(resolve, 200));
    const db = getDatabase();
    const topic = db.topics.find((t) => t.id === topicId);
    if (!topic) throw new Error('Selected topic does not exist.');

    let fileUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    try {
      fileUrl = URL.createObjectURL(file);
    } catch {
      // fallback if objectURL unavailable
    }

    const newResource = {
      id: `res_${Date.now()}`,
      topicId,
      title: title.trim(),
      originalFilename: file.name,
      storedFilename,
      fileType,
      fileSize,
      fileUrl,
      uploadedBy: uploader.username,
      uploaderName: uploader.name || uploader.username,
      uploadedAt: new Date().toISOString(),
      likeCount: 0
    };

    db.resources.unshift(newResource);
    saveDatabase(db);

    return newResource;
  },

  async deleteResource(id, currentUsername, currentUserRole) {
    if (isSupabaseConfigured) {
      const { data: resource, error: fetchErr } = await supabase
        .from('resources')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchErr && fetchErr.code === 'PGRST205') {
        console.warn('[resourceService] Supabase tables not migrated yet. Falling back to local storage.');
      } else if (fetchErr || !resource) {
        throw new Error('Resource not found.');
      } else {
        const isAuthor = resource.uploaded_by === currentUsername;
        const isAdmin = currentUserRole === 'ADMIN';

        if (!isAuthor && !isAdmin) {
          throw new Error('You do not have permission to delete this resource.');
        }

        // Delete storage binary if present
        if (resource.stored_filename) {
          await supabase.storage.from('resources').remove([resource.stored_filename]);
        }

        // Delete record (Postgres foreign key CASCADE deletes associated likes)
        const { error: deleteErr } = await supabase
          .from('resources')
          .delete()
          .eq('id', id);

        if (deleteErr) throw new Error(deleteErr.message);
        return true;
      }
    }

    // Fallback: LocalStorage Mock Engine
    await new Promise((resolve) => setTimeout(resolve, 150));
    const db = getDatabase();
    const resource = db.resources.find((r) => r.id === id);

    if (!resource) {
      throw new Error('Resource not found.');
    }

    const isAuthor = resource.uploadedBy === currentUsername;
    const isAdmin = currentUserRole === 'ADMIN';

    if (!isAuthor && !isAdmin) {
      throw new Error('You do not have permission to delete this resource.');
    }

    db.resources = db.resources.filter((r) => r.id !== id);
    db.likes = db.likes.filter((l) => l.resourceId !== id);

    saveDatabase(db);
    return true;
  }
};
