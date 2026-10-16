import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  rawUrl.trim() !== '' &&
  rawKey.trim() !== '' &&
  !rawUrl.includes('your-project-id') &&
  !rawUrl.includes('placeholder')
);

if (isSupabaseConfigured) {
  console.info('[ResourceHub] Supabase backend connected successfully.');
} else {
  console.info('[ResourceHub] Running in offline fallback mode with mock data.');
}

export const supabase = isSupabaseConfigured
  ? createClient(rawUrl, rawKey)
  : null;

/**
 * Checks if a Supabase PostgREST error represents a missing table (unmigrated database).
 */
export const isTableMissingError = (error) => Boolean(error && error.code === 'PGRST205');

/**
 * Standardizes console warnings when falling back to localStorage.
 */
export const logFallbackWarning = (serviceName) => {
  console.warn(`[${serviceName}] Supabase tables not migrated yet. Falling back to local storage.`);
};

/**
 * Maps Postgres snake_case resource row to frontend camelCase contract
 */
export const mapResourceFromDb = (row) => ({
  id: row.id,
  topicId: row.topic_id,
  title: row.title,
  originalFilename: row.original_filename,
  storedFilename: row.stored_filename,
  fileType: row.file_type,
  fileSize: row.file_size,
  fileUrl: row.file_url,
  uploadedBy: row.uploaded_by,
  uploaderName: row.uploader_name,
  uploadedAt: row.uploaded_at,
  likeCount: row.like_count ?? 0,
  topicName: row.topics?.name || 'General'
});

/**
 * Maps Postgres snake_case topic row to frontend camelCase contract
 */
export const mapTopicFromDb = (row) => ({
  id: row.id,
  name: row.name,
  code: row.code,
  description: row.description,
  resourceCount: row.resources?.[0]?.count ?? 0
});

/**
 * Maps Postgres snake_case profile row to frontend camelCase contract
 */
export const mapProfileFromDb = (row) => ({
  id: row.id,
  username: row.username,
  name: row.name,
  role: row.role,
  status: row.status
});
