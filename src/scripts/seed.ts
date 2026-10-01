import { connectDB, disconnectDB } from '../config/database';
import { User } from '../modules/users/user.model';
import { Note } from '../modules/notes/note.model';
import { Post } from '../modules/posts/post.model';
import { hashPassword } from '../utils/password';
import { UserRole } from '../constants';

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  await connectDB();

  // Clear existing collections to ensure a fresh, consistent environment
  console.log('🧹 Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    Note.deleteMany({}),
    Post.deleteMany({}),
  ]);

  const defaultPassword = await hashPassword('123456789');

  console.log('👥 Creating Admin and 4 Normal Users with realistic human names...');

  // 1. Admin User
  const admin = await User.create({
    name: 'Tajul Islam (Admin)',
    email: 'dev.tajulislam505@gmail.com',
    password: defaultPassword,
    role: UserRole.ADMIN,
    interests: ['Cybersecurity', 'Cloud Computing', 'System Architecture', 'DevOps'],
  });

  // 2. Normal User 1: Sarah Jenkins
  const user1 = await User.create({
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@example.com',
    password: defaultPassword,
    role: UserRole.USER,
    interests: ['Chess', 'Reading', 'Cybersecurity', 'Technology'],
  });

  // 3. Normal User 2: David Miller
  const user2 = await User.create({
    name: 'David Miller',
    email: 'david.miller@example.com',
    password: defaultPassword,
    role: UserRole.USER,
    interests: ['Music', 'Reading', 'Photography', 'Design'],
  });

  // 4. Normal User 3: Emily Watson
  const user3 = await User.create({
    name: 'Emily Watson',
    email: 'emily.watson@example.com',
    password: defaultPassword,
    role: UserRole.USER,
    interests: ['Chess', 'Music', 'Gaming', 'AI'],
  });

  // 5. Normal User 4: Marcus Chen
  const user4 = await User.create({
    name: 'Marcus Chen',
    email: 'marcus.chen@example.com',
    password: defaultPassword,
    role: UserRole.USER,
    interests: ['Technology', 'AI', 'Cloud Computing', 'DevOps'],
  });

  console.log('📝 Creating Notes for each user...');

  // Notes for Admin: Tajul Islam
  await Note.create([
    {
      title: 'Platform Security Architecture & RBAC Guidelines',
      content: 'Core rules for Role-Based Access Control:\n1. Regular users must only query, update, and delete their own notes.\n2. JWT tokens must contain role claims and be verified on every protected endpoint.\n3. Passwords must use bcryptjs with minimum 12 salt rounds.\n4. Admin endpoints require strict authorize("admin") validation.',
      userId: admin._id,
    },
    {
      title: 'Database Optimization with MongoDB Indexes',
      content: 'Critical indexing strategy takeaways:\n- Compound index { userId: 1, createdAt: -1 } optimizes user note list queries and avoids in-memory sorts.\n- Single index { createdAt: -1 } on Note collection supports admin full-collection chronological scanning.\n- Unique index on email field ensures zero duplicates and O(1) login lookup.\n- Always define indexes with schema.index() for code review clarity.',
      userId: admin._id,
    },
    {
      title: 'MongoDB Aggregation Pipelines Checklist',
      content: 'Key points for pipeline design:\n- Scenario 1 (Group by Interests): Use $unwind on interests array, then $group with $push for member previews, sorted by totalUsers descending.\n- Scenario 2 (User Posts): Use single aggregate with $match by _id and $lookup from posts collection on foreignField userId.\n- Exclude sensitive fields like password using $project.',
      userId: admin._id,
    },
    {
      title: 'Production Deployment & Monitoring Checklist',
      content: 'Pre-flight production checks:\n- Ensure CORS origins are strictly configured in .env\n- Verify Helmet headers are enabled for clickjacking and XSS mitigation\n- Database connection pooling set to optimal pool size\n- API Health check route /health operational.',
      userId: admin._id,
    },
  ]);

  // Notes for User 1: Sarah Jenkins
  await Note.create([
    {
      title: 'Chess Openings and Endgame Strategies',
      content: 'Focus areas for tournament preparation:\n- Italian Game (Giuoco Piano) main lines and pawn structure.\n- Rook and pawn endgames: Lucena and Philidor positions.\n- Daily tactical puzzles on chess.com and Lichess.',
      userId: user1._id,
    },
    {
      title: 'Books to Read This Year: Tech and Sci-Fi',
      content: 'Reading list:\n1. Designing Data-Intensive Applications by Martin Kleppmann\n2. The Phoenix Project & The DevOps Handbook\n3. Neuromancer by William Gibson\n4. Clean Architecture by Robert C. Martin.',
      userId: user1._id,
    },
    {
      title: 'Notes on Web Application Security',
      content: 'Essential defense mechanisms:\n- Input sanitization and parameterized queries\n- Content Security Policy (CSP)\n- JWT storage in HttpOnly cookies or secure client memory\n- Rate limiting on authentication routes to prevent brute-force attacks.',
      userId: user1._id,
    },
    {
      title: 'Weekly Learning Goals and Progress',
      content: 'Goals for this week:\n- Complete MongoDB aggregation deep-dive\n- Refactor microservice integration tests\n- Review 3 pull requests in open source repo.',
      userId: user1._id,
    },
  ]);

  // Notes for User 2: David Miller
  await Note.create([
    {
      title: 'Music Production Essentials & Synths',
      content: 'DAW setup notes:\n- Analog synthesizer presets and envelope shaping (ADSR)\n- Sidechain compression on bass and kick drum\n- Reverb and delay sends for stereo width and atmospheric depth.',
      userId: user2._id,
    },
    {
      title: 'Photography Composition: The Golden Ratio',
      content: 'Visual composition principles:\n- Rule of thirds vs Fibonacci spiral\n- Natural framing using doorways and tree branches\n- Using leading lines to guide viewer focus toward the subject.',
      userId: user2._id,
    },
    {
      title: 'UI/UX Design Inspiration for Minimalist Web Apps',
      content: 'Design tokens:\n- Emerald accents with dark slate backgrounds\n- 8pt grid system for consistent margins and padding\n- High contrast ratios for accessible typography (WCAG AA).',
      userId: user2._id,
    },
    {
      title: 'Book Club Discussion Points: Fiction & Philosophy',
      content: 'Key discussion topics for the monthly meetup:\n- The theme of identity in speculative fiction\n- Ethical dilemmas in modern technology\n- Quotes to highlight from chapter 4.',
      userId: user2._id,
    },
  ]);

  // Notes for User 3: Emily Watson
  await Note.create([
    {
      title: 'Game Development Mechanics & Physics',
      content: 'Game engine mechanics:\n- Smooth 2D character controller with coyote time and jump buffering\n- Tilemap collision optimization\n- State machine for character animations (Idle, Run, Jump, Fall).',
      userId: user3._id,
    },
    {
      title: 'Neural Networks and Game AI Notes',
      content: 'AI implementations:\n- Minimax algorithm with alpha-beta pruning for board games\n- Finite State Machines vs Behavior Trees for enemy NPC navigation\n- Reinforcement learning fundamentals.',
      userId: user3._id,
    },
    {
      title: 'Favorite Instrumental Soundtracks for Coding',
      content: 'Deep work playlist picks:\n- Hans Zimmer - Interstellar OST\n- Disasterpeace - FEZ Soundtrack\n- C418 - Minecraft Volume Beta\n- Lofi hip hop chill beats for late night programming.',
      userId: user3._id,
    },
  ]);

  // Notes for User 4: Marcus Chen
  await Note.create([
    {
      title: 'Docker & Kubernetes Containerization Cheat Sheet',
      content: 'Containerization best practices:\n- Multi-stage Docker builds to reduce image size from 1GB to 80MB\n- Non-root user execution inside container\n- Kubernetes Deployments, Services, and Ingress routing rules\n- Liveness and readiness probes.',
      userId: user4._id,
    },
    {
      title: 'CI/CD Pipeline Automation with GitHub Actions',
      content: 'Pipeline stages:\n1. Lint & Typecheck (tsc --noEmit)\n2. Automated Vitest suite run\n3. Docker image build and push to registry\n4. Automated staging environment deployment.',
      userId: user4._id,
    },
    {
      title: 'Prompt Engineering and LLM Benchmarks',
      content: 'Techniques for high precision results:\n- Chain-of-thought prompting with step-by-step reasoning\n- Few-shot learning examples in system instructions\n- Structured JSON schema outputs using function calling.',
      userId: user4._id,
    },
    {
      title: 'Serverless Architecture vs Microservices Comparison',
      content: 'Tradeoffs analysis:\n- Cold starts vs idle compute costs\n- Event-driven decoupling with message queues\n- Monitoring and distributed tracing with OpenTelemetry.',
      userId: user4._id,
    },
  ]);

  console.log('📢 Creating Public Posts for each user...');

  // Posts for Admin: Tajul Islam
  await Post.create([
    {
      title: 'Welcome to Keynote: Secure Note-Taking & Social Platform',
      body: 'Welcome everyone! Keynote is built from the ground up focusing on privacy, strict role-based access control, and seamless social discovery. Feel free to explore community topics and share your thoughts in public posts!',
      userId: admin._id,
    },
    {
      title: 'Understanding MongoDB Indexing: Compound & Multikey Indexes',
      body: 'Indexes are the backbone of high-performance database queries. In this platform, compound indexes ensure that user note lookups are executed in sub-millisecond time without in-memory sorting.',
      userId: admin._id,
    },
    {
      title: 'Why Zero-Trust Security Matters in Modern Web Applications',
      body: 'Never trust, always verify. Every API request in Keynote verifies JWT credentials and role permissions before accessing data. Secure password hashing with bcryptjs ensures credentials are never stored in plaintext.',
      userId: admin._id,
    },
    {
      title: 'Building Efficient Data Pipelines with MongoDB Aggregation',
      body: 'MongoDB aggregation pipelines allow complex transformations right inside the database engine. From grouping community interests to cross-collection $lookup joins, pipelines save roundtrips and CPU cycles.',
      userId: admin._id,
    },
  ]);

  // Posts for User 1: Sarah Jenkins
  await Post.create([
    {
      title: 'Top 5 Books Every Software Engineer Should Read',
      body: 'Reading engineering books expands mental models beyond just syntax. My top recommendations include Designing Data-Intensive Applications, Clean Code, and The Pragmatic Programmer.',
      userId: user1._id,
    },
    {
      title: 'How Playing Chess Improves Problem Solving in Programming',
      body: 'Chess teaches you to calculate moves ahead, evaluate tradeoffs, and foresee edge cases. These exact skills translate directly into software architecture and debugging complex systems.',
      userId: user1._id,
    },
    {
      title: 'My Experience Learning Distributed Systems',
      body: 'Understanding consensus algorithms like Raft and Paxos can be daunting at first, but visual simulators and building small prototypes makes the concepts click. Anyone else studying distributed systems?',
      userId: user1._id,
    },
  ]);

  // Posts for User 2: David Miller
  await Post.create([
    {
      title: 'Why Good UI Design is Essential for Security Software',
      body: 'Security tools often suffer from clunky user interfaces. Good UI design reduces human error, makes permission models intuitive, and helps users understand what data is private vs public.',
      userId: user2._id,
    },
    {
      title: 'The Intersection of Acoustic Music and Digital Audio Workstations',
      body: 'Blending live acoustic instruments with digital synthesizers creates rich, organic soundscapes. Modern audio plugins allow unprecedented control over acoustics and dynamics.',
      userId: user2._id,
    },
    {
      title: 'Capturing Golden Hour: Street Photography Tips',
      body: 'The 30 minutes right before sunset offer the most dramatic lighting for street portraits. Watch for long shadows, warm color temperatures, and interesting reflections.',
      userId: user2._id,
    },
  ]);

  // Posts for User 3: Emily Watson
  await Post.create([
    {
      title: 'How Machine Learning is Changing Chess Engines',
      body: 'From traditional alpha-beta search like Stockfish to neural network evaluations like Leela Chess Zero, machine learning has brought positional intuition to chess computers.',
      userId: user3._id,
    },
    {
      title: 'The Evolution of Video Game Graphics Over the Last Decade',
      body: 'Real-time ray tracing, volumetric lighting, and procedural generation have transformed gaming visuals. It is fascinating how much graphics pipeline performance has improved.',
      userId: user3._id,
    },
    {
      title: 'Best Ambient Music Playlists for Deep Focus Coding',
      body: 'When tackling challenging bugs, lyric-free synthwave and minimalist ambient music help achieve flow state without distraction. What is your go-to coding soundtrack?',
      userId: user3._id,
    },
    {
      title: 'Why Indie Game Development is More Accessible Than Ever',
      body: 'With modern engines and asset stores, solo developers can build atmospheric games that rival large studios. The barrier to entry has truly never been lower.',
      userId: user3._id,
    },
  ]);

  // Posts for User 4: Marcus Chen
  await Post.create([
    {
      title: 'Scaling Node.js Microservices with Docker and Kubernetes',
      body: 'Containerizing Node.js applications with multi-stage Dockerfiles ensures minimal attack surfaces and lightning-fast deployment cycles. Horizontal Pod Autoscaling handles traffic spikes smoothly.',
      userId: user4._id,
    },
    {
      title: 'The Future of Artificial Intelligence in Software Development',
      body: 'AI assistants are transforming pair programming, automated test generation, and documentation. The key is understanding how to guide models with clear system specifications.',
      userId: user4._id,
    },
    {
      title: 'DevOps Automation: Why Infrastructure as Code is Essential',
      body: 'Manual server configuration leads to configuration drift. With Terraform and Ansible, infrastructure is version-controlled, repeatable, and easily audited.',
      userId: user4._id,
    },
  ]);

  console.log('✅ Seeding completed successfully!');
  console.log('====================================================');
  console.log('Admin Account:');
  console.log('  Name:     Tajul Islam (Admin)');
  console.log('  Email:    dev.tajulislam505@gmail.com');
  console.log('  Password: 123456789');
  console.log('----------------------------------------------------');
  console.log('Normal User Accounts (Password: 123456789):');
  console.log('  User 1:   Sarah Jenkins      -> sarah.jenkins@example.com');
  console.log('  User 2:   David Miller       -> david.miller@example.com');
  console.log('  User 3:   Emily Watson       -> emily.watson@example.com');
  console.log('  User 4:   Marcus Chen        -> marcus.chen@example.com');
  console.log('====================================================');

  await disconnectDB();
}

seedDatabase().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
