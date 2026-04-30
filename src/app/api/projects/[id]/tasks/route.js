import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getProjectMembership } from '@/lib/utils';

// GET /api/projects/[id]/tasks - List tasks with filters
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { isMember } = await getProjectMembership(prisma, session.user.id, id);
    if (!isMember) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { searchParams } = request.nextUrl;
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const assigneeId = searchParams.get('assigneeId');

    const where = { projectId: id };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ status: 'asc' }, { priority: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// POST /api/projects/[id]/tasks - Create a new task
export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { isMember, role } = await getProjectMembership(prisma, session.user.id, id);
    if (!isMember) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const { title, description, status, priority, dueDate, assigneeId } = await request.json();

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 });
    }

    // Members can only self-assign; Admins can assign to anyone
    let finalAssigneeId = null;
    if (assigneeId) {
      if (role === 'MEMBER' && assigneeId !== session.user.id) {
        return NextResponse.json(
          { error: 'Members can only assign tasks to themselves' },
          { status: 403 }
        );
      }
      // Verify assignee is a project member
      const assigneeMembership = await prisma.projectMember.findUnique({
        where: { userId_projectId: { userId: assigneeId, projectId: id } },
      });
      if (!assigneeMembership) {
        return NextResponse.json({ error: 'Assignee is not a project member' }, { status: 400 });
      }
      finalAssigneeId = assigneeId;
    }

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId: id,
        assigneeId: finalAssigneeId,
        creatorId: session.user.id,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
