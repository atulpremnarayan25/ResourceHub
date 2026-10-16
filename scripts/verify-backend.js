import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('--- Starting Backend & Database Verification ---');

// 1. Verify schema.sql
const schemaPath = path.resolve('supabase/schema.sql');
assert(fs.existsSync(schemaPath), 'schema.sql must exist');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');

assert(schemaContent.includes('CREATE TABLE public.profiles'), 'profiles table missing');
assert(schemaContent.includes('CREATE TABLE public.topics'), 'topics table missing');
assert(schemaContent.includes('CREATE TABLE public.resources'), 'resources table missing');
assert(schemaContent.includes('CREATE TABLE public.likes'), 'likes table missing');
assert(schemaContent.includes('CONSTRAINT unique_student_resource_like UNIQUE (student_id, resource_id)'), 'unique constraint missing');
assert(schemaContent.includes('REFERENCES public.topics(id) ON DELETE RESTRICT'), 'topic delete restrict missing');
assert(schemaContent.includes('CREATE TRIGGER trigger_update_resource_like_count'), 'like trigger missing');
assert(schemaContent.includes("INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)"), 'storage bucket missing');
console.log('✓ schema.sql verification passed');

// 2. Verify seed.sql
const seedPath = path.resolve('supabase/seed.sql');
assert(fs.existsSync(seedPath), 'seed.sql must exist');
const seedContent = fs.readFileSync(seedPath, 'utf8');

assert(seedContent.includes('INSERT INTO public.profiles'), 'profiles seed missing');
assert(seedContent.includes('INSERT INTO public.topics'), 'topics seed missing');
assert(seedContent.includes('INSERT INTO public.resources'), 'resources seed missing');
assert(seedContent.includes('INSERT INTO public.likes'), 'likes seed missing');

// Validate all UUIDs in seed are valid 36-character UUID strings
const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
const matches = seedContent.match(uuidRegex);
assert(matches && matches.length >= 20, 'Expected at least 20 valid UUIDs in seed data');
for (const uuid of matches) {
  assert.strictEqual(uuid.length, 36, `UUID ${uuid} should be 36 characters`);
}
console.log(`✓ seed.sql verification passed (${matches.length} valid UUIDs checked)`);

// 3. Verify .env.example
const envPath = path.resolve('.env.example');
assert(fs.existsSync(envPath), '.env.example must exist');
const envContent = fs.readFileSync(envPath, 'utf8');
assert(envContent.includes('VITE_SUPABASE_URL'), 'VITE_SUPABASE_URL missing in .env.example');
assert(envContent.includes('VITE_SUPABASE_ANON_KEY'), 'VITE_SUPABASE_ANON_KEY missing in .env.example');
console.log('✓ .env.example verification passed');

console.log('--- All Backend Architecture Checks Passed ---');
