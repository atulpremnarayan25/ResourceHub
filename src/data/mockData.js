export const initialMockData = {
  users: [
    {
      id: 'usr_stu_1',
      username: 'student_arun',
      name: 'Arun Patel',
      role: 'STUDENT',
      status: 'ACTIVE'
    },
    {
      id: 'usr_stu_2',
      username: 'student_ananya',
      name: 'Ananya Rao',
      role: 'STUDENT',
      status: 'ACTIVE'
    },
    {
      id: 'usr_fac_1',
      username: 'prof_sharma',
      name: 'Prof. Rahul Sharma',
      role: 'FACILITATOR',
      status: 'ACTIVE'
    },
    {
      id: 'usr_fac_2',
      username: 'dr_atul',
      name: 'Dr. Atul Verma',
      role: 'FACILITATOR',
      status: 'ACTIVE'
    },
    {
      id: 'usr_fac_3',
      username: 'priya_nair',
      name: 'Priya Nair',
      role: 'FACILITATOR',
      status: 'DISABLED'
    },
    {
      id: 'usr_adm_1',
      username: 'admin_dean',
      name: 'Dean Academic Affairs',
      role: 'ADMIN',
      status: 'ACTIVE'
    }
  ],
  topics: [
    {
      id: 'top_1',
      name: 'Data Structures and Algorithms',
      code: 'CS201',
      description: 'Foundational algorithmic strategies, asymptotic analysis, trees, heaps, graphs, and dynamic programming.'
    },
    {
      id: 'top_2',
      name: 'Web Engineering and React',
      code: 'CS303',
      description: 'Client-server architecture, modern JavaScript, component hierarchies, state management, and accessibility.'
    },
    {
      id: 'top_3',
      name: 'Database Management Systems',
      code: 'CS204',
      description: 'Relational data models, normalization, transaction processing, ACID properties, and indexing structures.'
    },
    {
      id: 'top_4',
      name: 'Operating Systems and Virtualization',
      code: 'CS305',
      description: 'Concurrency primitives, kernel process scheduling, virtual memory management, and file system layouts.'
    },
    {
      id: 'top_5',
      name: 'Computer Networks and Security',
      code: 'CS306',
      description: 'TCP/IP protocol suites, socket programming, cryptography fundamentals, and routing algorithms.'
    }
  ],
  resources: [
    {
      id: 'res_1',
      topicId: 'top_1',
      title: 'Balanced Binary Search Trees and AVL Rotations',
      originalFilename: 'avl-rotations-guide.pdf',
      storedFilename: 'prof_sharma_20260914_1030_balanced-binary-search-trees.pdf',
      fileType: 'PDF',
      fileSize: '2.4 MB',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      uploadedBy: 'prof_sharma',
      uploaderName: 'Prof. Rahul Sharma',
      uploadedAt: '2026-09-14T10:30:00Z',
      likeCount: 4
    },
    {
      id: 'res_2',
      topicId: 'top_1',
      title: 'Graph Traversal Algorithms: BFS and DFS Implementation',
      originalFilename: 'graph-bfs-dfs.pptx',
      storedFilename: 'dr_atul_20260918_1545_graph-traversal-algorithms.pptx',
      fileType: 'PPTX',
      fileSize: '4.8 MB',
      fileUrl: '',
      uploadedBy: 'dr_atul',
      uploaderName: 'Dr. Atul Verma',
      uploadedAt: '2026-09-18T15:45:00Z',
      likeCount: 6
    },
    {
      id: 'res_3',
      topicId: 'top_1',
      title: 'Dynamic Programming Patterns and Memoization Techniques',
      originalFilename: 'dynamic-programming-patterns.pdf',
      storedFilename: 'prof_sharma_20260922_0915_dynamic-programming-patterns.pdf',
      fileType: 'PDF',
      fileSize: '1.9 MB',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      uploadedBy: 'prof_sharma',
      uploaderName: 'Prof. Rahul Sharma',
      uploadedAt: '2026-09-22T09:15:00Z',
      likeCount: 9
    },
    {
      id: 'res_4',
      topicId: 'top_2',
      title: 'React Component Architecture and Custom Hooks',
      originalFilename: 'react-hooks-architecture.pdf',
      storedFilename: 'dr_atul_20260925_1120_react-component-architecture.pdf',
      fileType: 'PDF',
      fileSize: '3.1 MB',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      uploadedBy: 'dr_atul',
      uploaderName: 'Dr. Atul Verma',
      uploadedAt: '2026-09-25T11:20:00Z',
      likeCount: 12
    },
    {
      id: 'res_5',
      topicId: 'top_2',
      title: 'State Management and Context API in Modern Frontends',
      originalFilename: 'context-api-guide.pptx',
      storedFilename: 'prof_sharma_20260928_1400_state-management-and-context.pptx',
      fileType: 'PPTX',
      fileSize: '5.6 MB',
      fileUrl: '',
      uploadedBy: 'prof_sharma',
      uploaderName: 'Prof. Rahul Sharma',
      uploadedAt: '2026-09-28T14:00:00Z',
      likeCount: 7
    },
    {
      id: 'res_6',
      topicId: 'top_2',
      title: 'Accessible Web Forms and ARIA Landmark Practices',
      originalFilename: 'web-accessibility-aria.pdf',
      storedFilename: 'dr_atul_20261002_1630_accessible-web-forms.pdf',
      fileType: 'PDF',
      fileSize: '1.5 MB',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      uploadedBy: 'dr_atul',
      uploaderName: 'Dr. Atul Verma',
      uploadedAt: '2026-10-02T16:30:00Z',
      likeCount: 3
    },
    {
      id: 'res_7',
      topicId: 'top_3',
      title: 'Relational Database Schema Design and Normal Forms',
      originalFilename: 'database-normalization.pdf',
      storedFilename: 'prof_sharma_20261005_1000_relational-database-schema.pdf',
      fileType: 'PDF',
      fileSize: '2.8 MB',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      uploadedBy: 'prof_sharma',
      uploaderName: 'Prof. Rahul Sharma',
      uploadedAt: '2026-10-05T10:00:00Z',
      likeCount: 8
    },
    {
      id: 'res_8',
      topicId: 'top_3',
      title: 'Indexing Mechanics: B-Trees, Hash Indexes, and Query Plans',
      originalFilename: 'db-indexing-mechanics.ppt',
      storedFilename: 'dr_atul_20261008_1345_indexing-mechanics-btrees.ppt',
      fileType: 'PPT',
      fileSize: '3.7 MB',
      fileUrl: '',
      uploadedBy: 'dr_atul',
      uploaderName: 'Dr. Atul Verma',
      uploadedAt: '2026-10-08T13:45:00Z',
      likeCount: 5
    },
    {
      id: 'res_9',
      topicId: 'top_4',
      title: 'CPU Scheduling Algorithms and Multilevel Feedback Queues',
      originalFilename: 'cpu-scheduling-algorithms.pdf',
      storedFilename: 'prof_sharma_20261011_0930_cpu-scheduling-algorithms.pdf',
      fileType: 'PDF',
      fileSize: '2.2 MB',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      uploadedBy: 'prof_sharma',
      uploaderName: 'Prof. Rahul Sharma',
      uploadedAt: '2026-10-11T09:30:00Z',
      likeCount: 11
    },
    {
      id: 'res_10',
      topicId: 'top_4',
      title: 'Virtual Memory Paging, TLB, and Replacement Strategies',
      originalFilename: 'virtual-memory-paging.pptx',
      storedFilename: 'dr_atul_20261014_1510_virtual-memory-paging.pptx',
      fileType: 'PPTX',
      fileSize: '6.2 MB',
      fileUrl: '',
      uploadedBy: 'dr_atul',
      uploaderName: 'Dr. Atul Verma',
      uploadedAt: '2026-10-14T15:10:00Z',
      likeCount: 4
    }
  ],
  likes: [
    { id: 'lik_1', studentId: 'usr_stu_1', resourceId: 'res_1', createdAt: '2026-09-15T12:00:00Z' },
    { id: 'lik_2', studentId: 'usr_stu_1', resourceId: 'res_4', createdAt: '2026-09-26T14:30:00Z' },
    { id: 'lik_3', studentId: 'usr_stu_1', resourceId: 'res_9', createdAt: '2026-10-12T10:15:00Z' },
    { id: 'lik_4', studentId: 'usr_stu_2', resourceId: 'res_1', createdAt: '2026-09-16T08:00:00Z' },
    { id: 'lik_5', studentId: 'usr_stu_2', resourceId: 'res_3', createdAt: '2026-09-23T11:20:00Z' }
  ]
};
