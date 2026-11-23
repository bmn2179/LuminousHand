/**
 * Phase 0 Dirty Dozen Security Rule Verification Spec
 * Targets: /users/{userId}, /workflows/{workflowId}, /ragFiles/{ragId}, /aslVideos/{videoId}, /supportTickets/{ticketId}
 */

export interface DirtyDozenCase {
  id: number;
  name: string;
  path: string;
  operation: 'get' | 'list' | 'create' | 'update';
  auth: { uid: string; email?: string; email_verified?: boolean } | null;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_CASES: DirtyDozenCase[] = [
  {
    id: 1,
    name: 'Unauthenticated read of /users/user123',
    path: '/users/user123',
    operation: 'get',
    auth: null,
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified email write on /users/user123',
    path: '/users/user123',
    operation: 'create',
    auth: { uid: 'user123', email: 'test@example.com', email_verified: false },
    payload: { uid: 'user123', role: 'parent' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Cross-user profile read by user123 on /users/otherUser',
    path: '/users/otherUser',
    operation: 'get',
    auth: { uid: 'user123', email: 'test@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Shadow field injection (isAdmin: true) on /users/user123',
    path: '/users/user123',
    operation: 'create',
    auth: { uid: 'user123', email: 'test@example.com', email_verified: true },
    payload: { uid: 'user123', displayName: 'Parent', learnerName: 'Leo', role: 'parent', selectedPlan: 'free', soundEnabled: true, completedLessons: [], isAdmin: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Self-assigned admin role escalation on /users/user123',
    path: '/users/user123',
    operation: 'create',
    auth: { uid: 'user123', email: 'test@example.com', email_verified: true },
    payload: { uid: 'user123', displayName: 'Parent', learnerName: 'Leo', role: 'admin', selectedPlan: 'free', soundEnabled: true, completedLessons: [] },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Oversized learnerName (>35 chars)',
    path: '/users/user123',
    operation: 'update',
    auth: { uid: 'user123', email: 'test@example.com', email_verified: true },
    payload: { learnerName: 'A'.repeat(60) },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Unbounded completedLessons array (>60 items)',
    path: '/users/user123',
    operation: 'update',
    auth: { uid: 'user123', email: 'test@example.com', email_verified: true },
    payload: { completedLessons: Array.from({ length: 65 }, (_, i) => `letter-${i}`) },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Client-spoofed createdAt timestamp',
    path: '/users/user123',
    operation: 'create',
    auth: { uid: 'user123', email: 'test@example.com', email_verified: true },
    payload: { uid: 'user123', createdAt: '2020-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Identity spoofing ownerId on workflow creation',
    path: '/users/user123/workflows/wf1',
    operation: 'create',
    auth: { uid: 'user123', email: 'test@example.com', email_verified: true },
    payload: { id: 'wf1', ownerId: 'victim999' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Poisoned invalid document ID (>128 chars)',
    path: `/users/user123/workflows/${'x'.repeat(200)}`,
    operation: 'create',
    auth: { uid: 'user123', email: 'test@example.com', email_verified: true },
    payload: { id: 'x'.repeat(200), ownerId: 'user123' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Reopening completed workflow (terminal state violation)',
    path: '/users/user123/workflows/wf1',
    operation: 'update',
    auth: { uid: 'user123', email: 'test@example.com', email_verified: true },
    payload: { status: 'active' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Reading another user supportTicket PII',
    path: '/supportTickets/ticket999',
    operation: 'get',
    auth: { uid: 'user123', email: 'test@example.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
];
