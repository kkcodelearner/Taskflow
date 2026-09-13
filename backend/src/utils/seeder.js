import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Task } from '../models/Task.js';
import { ActivityLog } from '../models/ActivityLog.js';
import { Notification } from '../models/Notification.js';
import { Comment } from '../models/Comment.js';

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskflow_db';
    await mongoose.connect(mongoUri);
    console.log('[Seeder] Connected to MongoDB at', mongoUri);

    // Clean existing collections
    await User.deleteMany();
    await Task.deleteMany();
    await ActivityLog.deleteMany();
    await Notification.deleteMany();
    await Comment.deleteMany();

    console.log('[Seeder] Cleared existing data');

    // Default password for demo
    const defaultPassword = 'Password123!';

    // Create Users
    const usersToCreate = [
      {
        name: 'Sarah Connor',
        email: 'admin@taskflow.io',
        password: defaultPassword,
        role: 'admin',
        department: 'Executive',
        title: 'Director of Engineering',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      },
      {
        name: 'Alex Rivera',
        email: 'alex@taskflow.io',
        password: defaultPassword,
        role: 'employee',
        department: 'Engineering',
        title: 'Senior Full-Stack Engineer',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      },
      {
        name: 'Elena Rostova',
        email: 'elena@taskflow.io',
        password: defaultPassword,
        role: 'employee',
        department: 'Design',
        title: 'Lead UI/UX Designer',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
      },
      {
        name: 'Marcus Vance',
        email: 'marcus@taskflow.io',
        password: defaultPassword,
        role: 'employee',
        department: 'DevOps',
        title: 'Site Reliability Engineer',
        avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=200',
      },
      {
        name: 'Rachel Zane',
        email: 'rachel@taskflow.io',
        password: defaultPassword,
        role: 'employee',
        department: 'Product',
        title: 'Product Operations Lead',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      },
    ];

    const users = await User.create(usersToCreate);
    console.log(`[Seeder] Seeded ${users.length} user accounts`);

    const admin = users[0];
    const alex = users[1];
    const elena = users[2];
    const marcus = users[3];
    const rachel = users[4];

    const today = new Date();
    const addDays = (d, n) => new Date(d.getTime() + n * 24 * 60 * 60 * 1000);

    // Tasks
    const task1 = await Task.create({
      title: 'Implement Role-Based Access Control (RBAC) Microservice',
      description: 'Design and deploy token verification, permission policies, and endpoint authorization middleware across all microservices.',
      priority: 'high',
      department: 'Engineering',
      status: 'in_progress',
      assignedTo: alex._id,
      createdBy: admin._id,
      dueDate: addDays(today, 4),
      estimatedHours: 24,
      actualHours: 14,
      acceptanceDate: addDays(today, -2),
      acceptanceNotes: 'Reviewed technical specs with Sarah. Commenced test fixtures and middleware implementation.',
      subtasks: [
        { title: 'Define JWT payload claims and token refresh rotation', completed: true },
        { title: 'Create permission matrix schema for admin, manager, employee roles', completed: true },
        { title: 'Implement RBAC Express middleware with unit tests', completed: true },
        { title: 'Integration testing with Postman collection and mock tokens', completed: false },
        { title: 'Document API security headers and audit events', completed: false },
      ],
      tags: ['Security', 'Backend', 'Auth', 'Sprint-14'],
    });

    const task2 = await Task.create({
      title: 'Design System Overhaul & Dark Mode Contrast Verification',
      description: 'Revamp component library color tokens, typography scales, and ensure WCAG AAA accessibility compliance in both light and dark themes.',
      priority: 'urgent',
      department: 'Design',
      status: 'in_review',
      assignedTo: elena._id,
      createdBy: admin._id,
      dueDate: addDays(today, 2),
      estimatedHours: 18,
      actualHours: 17.5,
      acceptanceDate: addDays(today, -4),
      acceptanceNotes: 'Design tokens finalized in Figma, ready for engineering handoff.',
      subtasks: [
        { title: 'Harmonize semantic color tokens (surface, primary, accent, warning)', completed: true },
        { title: 'Generate accessible contrast ratios (WCAG 2.1 AAA)', completed: true },
        { title: 'Create interactive button, modal, and input component states', completed: true },
        { title: 'Export CSS variables specification and storybook guidelines', completed: true },
      ],
      tags: ['UI/UX', 'DesignSystem', 'Accessibility'],
    });

    const task3 = await Task.create({
      title: 'Kubernetes Multi-Region Cluster Automated Failover',
      description: 'Set up cross-region DNS failover with AWS Route53 and automated health checks across US-East and EU-West Kubernetes clusters.',
      priority: 'urgent',
      department: 'DevOps',
      status: 'pending_acceptance',
      assignedTo: marcus._id,
      createdBy: admin._id,
      dueDate: addDays(today, 3),
      estimatedHours: 30,
      actualHours: 0,
      subtasks: [
        { title: 'Audit current Terraform state for US-East and EU-West clusters', completed: false },
        { title: 'Configure Route 53 health-check latency records', completed: false },
        { title: 'Simulate region outage in staging environment', completed: false },
        { title: 'Prepare disaster recovery Runbook documentation', completed: false },
      ],
      tags: ['DevOps', 'Kubernetes', 'HighAvailability', 'Infrastructure'],
    });

    const task4 = await Task.create({
      title: 'Enterprise Marketing Landing Page Redesign Assets',
      description: 'Create 3D vector illustration assets and product feature interactive diagrams for the upcoming v2.0 product launch marketing website.',
      priority: 'medium',
      department: 'Design',
      status: 'rejected',
      assignedTo: elena._id,
      createdBy: admin._id,
      dueDate: addDays(today, 6),
      estimatedHours: 16,
      actualHours: 0,
      rejectionReason: 'Capacity saturated with Core UI Design System sprint deliverables and WCAG accessibility deadlines. Recommend assigning to external agency or deferring to next sprint.',
      subtasks: [
        { title: 'Hero banner illustrations (Desktop & Mobile)', completed: false },
        { title: 'Product UI feature callout graphics', completed: false },
        { title: 'Customer testimonial showcase badges', completed: false },
      ],
      tags: ['Marketing', 'Branding', 'Assets'],
    });

    const task5 = await Task.create({
      title: 'Q3 SOC-2 Type II Security Compliance Audit Evidence Gathering',
      description: 'Collate access logs, vendor risk assessments, and encryption at rest proofs for third-party compliance auditor review.',
      priority: 'high',
      department: 'Product',
      status: 'completed',
      assignedTo: rachel._id,
      createdBy: admin._id,
      dueDate: addDays(today, -1),
      estimatedHours: 20,
      actualHours: 19,
      acceptanceDate: addDays(today, -8),
      completionDate: addDays(today, -1),
      acceptanceNotes: 'Audit portal opened, all stakeholders notified.',
      subtasks: [
        { title: 'Extract employee 2FA enforcement reports from IdP', completed: true },
        { title: 'Compile AWS KMS customer managed key rotation policies', completed: true },
        { title: 'Conduct quarterly access review with department leads', completed: true },
        { title: 'Upload final evidence package to Vanta portal', completed: true },
      ],
      tags: ['Compliance', 'Security', 'Audit', 'SOC2'],
    });

    const task6 = await Task.create({
      title: 'API Gateway Rate Limiting with Redis Sliding Window Counter',
      description: 'Prevent volumetric attacks and runaway API traffic by deploying distributed Redis sliding window rate limiters on public REST endpoints.',
      priority: 'medium',
      department: 'Engineering',
      status: 'pending_acceptance',
      assignedTo: alex._id,
      createdBy: admin._id,
      dueDate: addDays(today, 7),
      estimatedHours: 12,
      actualHours: 0,
      subtasks: [
        { title: 'Benchmark Redis cluster latency for sliding window Lua scripts', completed: false },
        { title: 'Implement Tier 1 (100 req/min) and Tier 2 (1000 req/min) policies', completed: false },
        { title: 'Add standard 429 Retry-After response headers', completed: false },
      ],
      tags: ['Backend', 'Redis', 'Performance'],
    });

    const task7 = await Task.create({
      title: 'PostgreSQL & MongoDB Cross-Database Query Optimization',
      description: 'Analyze slow query logs, build compound indexes for task queries, and optimize aggregation pipelines to achieve sub-50ms p99 latency.',
      priority: 'high',
      department: 'DevOps',
      status: 'in_progress',
      assignedTo: marcus._id,
      createdBy: admin._id,
      dueDate: addDays(today, 5),
      estimatedHours: 15,
      actualHours: 6,
      acceptanceDate: addDays(today, -1),
      acceptanceNotes: 'Analyzed MongoDB explain plans. Compound indexes drafted.',
      subtasks: [
        { title: 'Enable profiling on slow queries (>100ms)', completed: true },
        { title: 'Add compound index on { assignedTo: 1, status: 1, dueDate: 1 }', completed: true },
        { title: 'Run load test with 500 concurrent simulated requests', completed: false },
      ],
      tags: ['Database', 'Optimization', 'MongoDB'],
    });

    console.log('[Seeder] Seeded 7 industry tasks across all workflow stages');

    // Create Activity Logs
    await ActivityLog.create([
      {
        task: task1._id,
        user: admin._id,
        action: 'created',
        description: `Task created by ${admin.name} and assigned to ${alex.name}`,
      },
      {
        task: task1._id,
        user: alex._id,
        action: 'accepted',
        description: `${alex.name} accepted task assignment and commenced work.`,
      },
      {
        task: task1._id,
        user: alex._id,
        action: 'subtask_completed',
        description: `${alex.name} completed subtask "Define JWT payload claims and token refresh rotation"`,
      },
      {
        task: task1._id,
        user: alex._id,
        action: 'time_logged',
        description: `${alex.name} logged 6 hours of work. Note: "Built token validation logic and test fixtures"`,
      },
      {
        task: task4._id,
        user: admin._id,
        action: 'created',
        description: `Task created by ${admin.name} and assigned to ${elena.name}`,
      },
      {
        task: task4._id,
        user: elena._id,
        action: 'rejected',
        description: `${elena.name} declined task assignment. Reason: "Capacity saturated with Core UI Design System sprint deliverables."`,
      },
      {
        task: task3._id,
        user: admin._id,
        action: 'created',
        description: `Task created by ${admin.name} and assigned to ${marcus.name}. Status: Pending Acceptance.`,
      },
      {
        task: task5._id,
        user: rachel._id,
        action: 'status_changed',
        description: `Task marked as Completed by ${rachel.name}. All evidence approved.`,
      },
    ]);

    // Create Comments
    await Comment.create([
      {
        task: task1._id,
        author: admin._id,
        content: 'Hi Alex, please ensure the refresh token rotation also handles race condition grace periods for parallel frontend requests.',
      },
      {
        task: task1._id,
        author: alex._id,
        content: 'Thanks Sarah! Added a 30-second leeway window to prevent token clash during rapid concurrent calls.',
      },
      {
        task: task4._id,
        author: elena._id,
        content: 'Sarah, I have flagged this to the team. If we can get contractor assistance for the vector SVGs, I can supervise the creative direction.',
      },
      {
        task: task4._id,
        author: admin._id,
        content: 'Understood Elena, completely agree with prioritizing the design system first. I will reassign this to our freelance partner.',
      },
    ]);

    // Create Notifications
    await Notification.create([
      {
        recipient: marcus._id,
        sender: admin._id,
        task: task3._id,
        title: 'New Urgent Task Assignment',
        message: 'You have been assigned: "Kubernetes Multi-Region Cluster Automated Failover". Please accept or decline.',
        type: 'task_assigned',
        isRead: false,
      },
      {
        recipient: alex._id,
        sender: admin._id,
        task: task6._id,
        title: 'New Task Assignment',
        message: 'You have been assigned: "API Gateway Rate Limiting with Redis Sliding Window Counter". Review requirements.',
        type: 'task_assigned',
        isRead: false,
      },
      {
        recipient: admin._id,
        sender: elena._id,
        task: task4._id,
        title: 'Task Assignment Declined',
        message: 'Elena Rostova declined "Enterprise Marketing Landing Page Redesign Assets": Capacity saturated with Core UI Design System.',
        type: 'task_rejected',
        isRead: false,
      },
      {
        recipient: admin._id,
        sender: alex._id,
        task: task1._id,
        title: 'Task Work Update',
        message: 'Alex Rivera logged 6 hours and completed 3 subtasks on RBAC Microservice.',
        type: 'comment_added',
        isRead: true,
      },
    ]);

    console.log('[Seeder] Database seeding completed successfully! ✨');
    console.log('\n===========================================');
    console.log('DEMO CREDENTIALS:');
    console.log('Admin:    admin@taskflow.io  /  Password123!');
    console.log('Employee: alex@taskflow.io   /  Password123!');
    console.log('Employee: elena@taskflow.io  /  Password123!');
    console.log('Employee: marcus@taskflow.io /  Password123!');
    console.log('Employee: rachel@taskflow.io /  Password123!');
    console.log('===========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]', error);
    process.exit(1);
  }
};

seedData();
