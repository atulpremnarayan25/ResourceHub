-- ============================================================================
-- ResourceHub: Database Schema & Initial Seed Data
-- ============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop existing tables if re-applying
DROP TABLE IF EXISTS public.likes CASCADE;
DROP TABLE IF EXISTS public.resources CASCADE;
DROP TABLE IF EXISTS public.topics CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 3. Profiles Table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('STUDENT', 'FACILITATOR', 'ADMIN')),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISABLED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- 4. Topics Table
CREATE TABLE public.topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  code TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_topics_name ON public.topics(name);

-- 5. Resources Table
CREATE TABLE public.resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  stored_filename TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('PDF', 'PPT', 'PPTX')),
  file_size TEXT NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  uploader_name TEXT NOT NULL,
  like_count INTEGER NOT NULL DEFAULT 0 CHECK (like_count >= 0),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_resources_topic_id ON public.resources(topic_id);
CREATE INDEX idx_resources_uploaded_by ON public.resources(uploaded_by);
CREATE INDEX idx_resources_uploaded_at ON public.resources(uploaded_at DESC);

-- 6. Likes Table with Strict Unique Constraint
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT NOT NULL,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT unique_student_resource_like UNIQUE (student_id, resource_id)
);

CREATE INDEX idx_likes_student_id ON public.likes(student_id);
CREATE INDEX idx_likes_resource_id ON public.likes(resource_id);

-- 7. Atomic Like Count Update Trigger Function
CREATE OR REPLACE FUNCTION public.handle_like_count_update()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.resources
    SET like_count = like_count + 1
    WHERE id = NEW.resource_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.resources
    SET like_count = GREATEST(0, like_count - 1)
    WHERE id = OLD.resource_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_update_resource_like_count
AFTER INSERT OR DELETE ON public.likes
FOR EACH ROW
EXECUTE FUNCTION public.handle_like_count_update();

-- 8. Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Allow public read access to profiles"
  ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow admin manage profiles"
  ON public.profiles FOR ALL USING (true);

-- Topics Policies
CREATE POLICY "Allow public read access to topics"
  ON public.topics FOR SELECT USING (true);
CREATE POLICY "Allow admin manage topics"
  ON public.topics FOR ALL USING (true);

-- Resources Policies
CREATE POLICY "Allow public read access to resources"
  ON public.resources FOR SELECT USING (true);
CREATE POLICY "Allow facilitator and admin insert resources"
  ON public.resources FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow author and admin delete resources"
  ON public.resources FOR DELETE USING (true);

-- Likes Policies
CREATE POLICY "Allow public read access to likes"
  ON public.likes FOR SELECT USING (true);
CREATE POLICY "Allow students to insert likes"
  ON public.likes FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow students to delete own likes"
  ON public.likes FOR DELETE USING (true);

-- 9. Storage Bucket Configuration (Resources Bucket)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resources',
  'resources',
  true,
  15728640, -- 15 MB limit
  ARRAY[
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 15728640,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];

-- Storage Object Policies
CREATE POLICY "Allow public download of resources"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resources');

CREATE POLICY "Allow authenticated facilitator upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'resources');

CREATE POLICY "Allow author or admin delete files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'resources');

-- ============================================================================
-- 10. Seed Profiles
-- ============================================================================
INSERT INTO public.profiles (id, username, name, role, status) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'student_arun', 'Arun Patel', 'STUDENT', 'ACTIVE'),
  ('a0000000-0000-0000-0000-000000000002', 'student_ananya', 'Ananya Rao', 'STUDENT', 'ACTIVE'),
  ('a0000000-0000-0000-0000-000000000003', 'prof_sharma', 'Prof. Rahul Sharma', 'FACILITATOR', 'ACTIVE'),
  ('a0000000-0000-0000-0000-000000000004', 'dr_atul', 'Dr. Atul Verma', 'FACILITATOR', 'ACTIVE'),
  ('a0000000-0000-0000-0000-000000000005', 'priya_nair', 'Priya Nair', 'FACILITATOR', 'DISABLED'),
  ('a0000000-0000-0000-0000-000000000006', 'admin_dean', 'Dean Academic Affairs', 'ADMIN', 'ACTIVE')
ON CONFLICT (username) DO NOTHING;

-- ============================================================================
-- 11. Seed Topics
-- ============================================================================
INSERT INTO public.topics (id, name, code, description) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Data Structures and Algorithms', 'CS201', 'Foundational algorithmic strategies, asymptotic analysis, trees, heaps, graphs, and dynamic programming.'),
  ('b0000000-0000-0000-0000-000000000002', 'Web Engineering and React', 'CS303', 'Client-server architecture, modern JavaScript, component hierarchies, state management, and accessibility.'),
  ('b0000000-0000-0000-0000-000000000003', 'Database Management Systems', 'CS204', 'Relational data models, normalization, transaction processing, ACID properties, and indexing structures.'),
  ('b0000000-0000-0000-0000-000000000004', 'Operating Systems and Virtualization', 'CS305', 'Concurrency primitives, kernel process scheduling, virtual memory management, and file system layouts.'),
  ('b0000000-0000-0000-0000-000000000005', 'Computer Networks and Security', 'CS306', 'TCP/IP protocol suites, socket programming, cryptography fundamentals, and routing algorithms.')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 12. Seed Resources
-- ============================================================================
INSERT INTO public.resources (id, topic_id, title, original_filename, stored_filename, file_type, file_size, file_url, uploaded_by, uploader_name, like_count, uploaded_at) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Balanced Binary Search Trees and AVL Rotations', 'avl-rotations-guide.pdf', 'prof_sharma_20260914_1030_balanced-binary-search-trees.pdf', 'PDF', '2.4 MB', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'prof_sharma', 'Prof. Rahul Sharma', 0, '2026-09-14T10:30:00Z'),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Graph Traversal Algorithms: BFS and DFS Implementation', 'graph-bfs-dfs.pptx', 'dr_atul_20260918_1545_graph-traversal-algorithms.pptx', 'PPTX', '4.8 MB', '', 'dr_atul', 'Dr. Atul Verma', 0, '2026-09-18T15:45:00Z'),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'Dynamic Programming Patterns and Memoization Techniques', 'dynamic-programming-patterns.pdf', 'prof_sharma_20260922_0915_dynamic-programming-patterns.pdf', 'PDF', '1.9 MB', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'prof_sharma', 'Prof. Rahul Sharma', 0, '2026-09-22T09:15:00Z'),
  ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002', 'React Component Architecture and Custom Hooks', 'react-hooks-architecture.pdf', 'dr_atul_20260925_1120_react-component-architecture.pdf', 'PDF', '3.1 MB', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'dr_atul', 'Dr. Atul Verma', 0, '2026-09-25T11:20:00Z'),
  ('c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000002', 'State Management and Context API in Modern Frontends', 'context-api-guide.pptx', 'prof_sharma_20260928_1400_state-management-and-context.pptx', 'PPTX', '5.6 MB', '', 'prof_sharma', 'Prof. Rahul Sharma', 0, '2026-09-28T14:00:00Z'),
  ('c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000002', 'Accessible Web Forms and ARIA Landmark Practices', 'web-accessibility-aria.pdf', 'dr_atul_20261002_1630_accessible-web-forms.pdf', 'PDF', '1.5 MB', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'dr_atul', 'Dr. Atul Verma', 0, '2026-10-02T16:30:00Z'),
  ('c0000000-0000-0000-0000-000000000007', 'b0000000-0000-0000-0000-000000000003', 'Relational Database Schema Design and Normal Forms', 'database-normalization.pdf', 'prof_sharma_20261005_1000_relational-database-schema.pdf', 'PDF', '2.8 MB', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'prof_sharma', 'Prof. Rahul Sharma', 0, '2026-10-05T10:00:00Z'),
  ('c0000000-0000-0000-0000-000000000008', 'b0000000-0000-0000-0000-000000000003', 'Indexing Mechanics: B-Trees, Hash Indexes, and Query Plans', 'db-indexing-mechanics.ppt', 'dr_atul_20261008_1345_indexing-mechanics-btrees.ppt', 'PPT', '3.7 MB', '', 'dr_atul', 'Dr. Atul Verma', 0, '2026-10-08T13:45:00Z'),
  ('c0000000-0000-0000-0000-000000000009', 'b0000000-0000-0000-0000-000000000004', 'CPU Scheduling Algorithms and Multilevel Feedback Queues', 'cpu-scheduling-algorithms.pdf', 'prof_sharma_20261011_0930_cpu-scheduling-algorithms.pdf', 'PDF', '2.2 MB', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', 'prof_sharma', 'Prof. Rahul Sharma', 0, '2026-10-11T09:30:00Z'),
  ('c0000000-0000-0000-0000-000000000010', 'b0000000-0000-0000-0000-000000000004', 'Virtual Memory Paging, TLB, and Replacement Strategies', 'virtual-memory-paging.pptx', 'dr_atul_20261014_1510_virtual-memory-paging.pptx', 'PPTX', '6.2 MB', '', 'dr_atul', 'Dr. Atul Verma', 0, '2026-10-14T15:10:00Z')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 13. Seed Likes (Database trigger automatically increments like_count)
-- ============================================================================
INSERT INTO public.likes (id, student_id, resource_id, created_at) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'student_arun', 'c0000000-0000-0000-0000-000000000001', '2026-09-15T12:00:00Z'),
  ('d0000000-0000-0000-0000-000000000002', 'student_arun', 'c0000000-0000-0000-0000-000000000004', '2026-09-26T14:30:00Z'),
  ('d0000000-0000-0000-0000-000000000003', 'student_arun', 'c0000000-0000-0000-0000-000000000009', '2026-10-12T10:15:00Z'),
  ('d0000000-0000-0000-0000-000000000004', 'student_ananya', 'c0000000-0000-0000-0000-000000000001', '2026-09-16T08:00:00Z'),
  ('d0000000-0000-0000-0000-000000000005', 'student_ananya', 'c0000000-0000-0000-0000-000000000003', '2026-09-23T11:20:00Z')
ON CONFLICT (student_id, resource_id) DO NOTHING;
