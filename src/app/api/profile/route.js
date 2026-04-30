import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/profile - Get current user profile and stats
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            ownedProjects: true,
            memberships: true,
            assignedTasks: true,
            createdTasks: true,
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get more specific task stats
    const taskStats = await prisma.task.groupBy({
      by: ['status'],
      where: { assigneeId: session.user.id },
      _count: true
    });

    return NextResponse.json({
      user,
      taskStats: taskStats.reduce((acc, curr) => {
        acc[curr.status.toLowerCase()] = curr._count;
        return acc;
      }, { todo: 0, in_progress: 0, done: 0 })
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}
