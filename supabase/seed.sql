-- ============================================================================
-- ResourceHub: Initial Seed Data (Supabase / PostgreSQL)
-- Course: CSF303 Web Engineering
-- ============================================================================

-- 1. Seed Profiles (Students, Facilitators, Administrator)
INSERT INTO public.profiles (id, username, name, role, status) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'student_arun', 'Arun Patel', 'STUDENT', 'ACTIVE'),
  ('a0000000-0000-0000-0000-000000000002', 'student_ananya', 'Ananya Rao', 'STUDENT', 'ACTIVE'),
  ('a0000000-0000-0000-0000-000000000003', 'prof_sharma', 'Prof. Rahul Sharma', 'FACILITATOR', 'ACTIVE'),
  ('a0000000-0000-0000-0000-000000000004', 'dr_atul', 'Dr. Atul Verma', 'FACILITATOR', 'ACTIVE'),
  ('a0000000-0000-0000-0000-000000000005', 'priya_nair', 'Priya Nair', 'FACILITATOR', 'DISABLED'),
  ('a0000000-0000-0000-0000-000000000006', 'admin_dean', 'Dean Academic Affairs', 'ADMIN', 'ACTIVE')
ON CONFLICT (username) DO NOTHING;

-- 2. Seed Topics
INSERT INTO public.topics (id, name, code, description) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Data Structures and Algorithms', 'CS201', 'Foundational algorithmic strategies, asymptotic analysis, trees, heaps, graphs, and dynamic programming.'),
  ('b0000000-0000-0000-0000-000000000002', 'Web Engineering and React', 'CS303', 'Client-server architecture, modern JavaScript, component hierarchies, state management, and accessibility.'),
  ('b0000000-0000-0000-0000-000000000003', 'Database Management Systems', 'CS204', 'Relational data models, normalization, transaction processing, ACID properties, and indexing structures.'),
  ('b0000000-0000-0000-0000-000000000004', 'Operating Systems and Virtualization', 'CS305', 'Concurrency primitives, kernel process scheduling, virtual memory management, and file system layouts.'),
  ('b0000000-0000-0000-0000-000000000005', 'Computer Networks and Security', 'CS306', 'TCP/IP protocol suites, socket programming, cryptography fundamentals, and routing algorithms.')
ON CONFLICT (name) DO NOTHING;

-- 3. Seed Resources
-- Initial like_count is set to 0; inserting rows into likes table below will trigger atomic increment
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

-- 4. Seed Likes (Database trigger automatically synchronizes like_count)
INSERT INTO public.likes (id, student_id, resource_id, created_at) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'student_arun', 'c0000000-0000-0000-0000-000000000001', '2026-09-15T12:00:00Z'),
  ('d0000000-0000-0000-0000-000000000002', 'student_arun', 'c0000000-0000-0000-0000-000000000004', '2026-09-26T14:30:00Z'),
  ('d0000000-0000-0000-0000-000000000003', 'student_arun', 'c0000000-0000-0000-0000-000000000009', '2026-10-12T10:15:00Z'),
  ('d0000000-0000-0000-0000-000000000004', 'student_ananya', 'c0000000-0000-0000-0000-000000000001', '2026-09-16T08:00:00Z'),
  ('d0000000-0000-0000-0000-000000000005', 'student_ananya', 'c0000000-0000-0000-0000-000000000003', '2026-09-23T11:20:00Z')
ON CONFLICT (student_id, resource_id) DO NOTHING;
