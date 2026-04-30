import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/dashboard - Aggregated dashboard stats
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all projects the user is a member of
    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true, role: true },
    });

    const projectIds = memberships.map((m) => m.projectId);

    // Get all tasks across user's projects
    const tasks = await prisma.task.findMany({
      where: { projectId: { in: projectIds } },
      include: {
        assignee: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();

    // Compute stats
    const stats = {
      totalProjects: projectIds.length,
      totalTasks: tasks.length,
      todoTasks: tasks.filter((t) => t.status === 'TODO').length,
      inProgressTasks: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      doneTasks: tasks.filter((t) => t.status === 'DONE').length,
      overdueTasks: tasks.filter(
        (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE'
      ).length,
      myTasks: tasks.filter((t) => t.assigneeId === userId).length,
    };

    // Recent tasks (last 10)
    const recentTasks = tasks.slice(0, 10);

    // Overdue tasks
    const overdueTasks = tasks
      .filter((t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE')
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 10);

    // My assigned tasks that need attention
    const myPendingTasks = tasks
      .filter((t) => t.assigneeId === userId && t.status !== 'DONE')
      .slice(0, 10);

    return NextResponse.json({
      stats,
      recentTasks,
      overdueTasks,
      myPendingTasks,
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
