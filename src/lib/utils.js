import { auth } from './auth';

/**
 * Get the current authenticated session.
 * Returns null if not authenticated.
 */
export async function getSession() {
  return await auth();
}

/**
 * Get the current user's ID from the session.
 * Returns null if not authenticated.
 */
export async function getCurrentUserId() {
  const session = await auth();
  return session?.user?.id || null;
}

/**
 * Check if a user is a member of a project and return their role.
 * Returns { isMember: boolean, role: string | null, membership: object | null }
 */
export async function getProjectMembership(prisma, userId, projectId) {
  const membership = await prisma.projectMember.findUnique({
    where: {
      userId_projectId: { userId, projectId },
    },
  });

  return {
    isMember: !!membership,
    role: membership?.role || null,
    membership,
  };
}

/**
 * Check if a user is an admin of a project.
 */
export async function isProjectAdmin(prisma, userId, projectId) {
  const { role } = await getProjectMembership(prisma, userId, projectId);
  return role === 'ADMIN';
}

/**
 * Format a date for display.
 */
export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Check if a task is overdue.
 */
export function isOverdue(dueDate, status) {
  if (!dueDate || status === 'DONE') return false;
  return new Date(dueDate) < new Date();
}

/**
 * Get initials from a name.
 */
export function getInitials(name) {
  if (!name) return '??';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Status color map.
 */
export const STATUS_COLORS = {
  TODO: { bg: '#3b82f620', text: '#60a5fa', border: '#3b82f640' },
  IN_PROGRESS: { bg: '#f59e0b20', text: '#fbbf24', border: '#f59e0b40' },
  DONE: { bg: '#10b98120', text: '#34d399', border: '#10b98140' },
};

/**
 * Priority color map.
 */
export const PRIORITY_COLORS = {
  LOW: { bg: '#64748b20', text: '#94a3b8', border: '#64748b40' },
  MEDIUM: { bg: '#3b82f620', text: '#60a5fa', border: '#3b82f640' },
  HIGH: { bg: '#f97316 20', text: '#fb923c', border: '#f9731640' },
  URGENT: { bg: '#ef444420', text: '#f87171', border: '#ef444440' },
};

/**
 * Status labels.
 */
export const STATUS_LABELS = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

/**
 * Priority labels.
 */
export const PRIORITY_LABELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};
