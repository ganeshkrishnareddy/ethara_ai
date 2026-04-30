import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getProjectMembership } from '@/lib/utils';

// GET /api/projects/[id]/tasks/[taskId] - Get task details
export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, taskId } = await params;

    const { isMember } = await getProjectMembership(prisma, session.user.id, id);
    if (!isMember) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId, projectId: id },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

// PUT /api/projects/[id]/tasks/[taskId] - Update task
export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, taskId } = await params;

    const { isMember, role } = await getProjectMembership(prisma, session.user.id, id);
    if (!isMember) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId, projectId: id },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Members can only update their own assigned tasks or tasks they created
    if (role === 'MEMBER') {
      const isAssignee = task.assigneeId === session.user.id;
      const isCreator = task.creatorId === session.user.id;
      if (!isAssignee && !isCreator) {
        return NextResponse.json(
          { error: 'You can only update tasks assigned to or created by you' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const updateData = {};

    if (body.title !== undefined) updateData.title = body.title.trim();
    if (body.description !== undefined) updateData.description = body.description?.trim() || null;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;

    // Handle assignee changes
    if (body.assigneeId !== undefined) {
      if (role === 'MEMBER' && body.assigneeId && body.assigneeId !== session.user.id) {
        return NextResponse.json(
          { error: 'Members can only assign tasks to themselves' },
          { status: 403 }
        );
      }
      if (body.assigneeId) {
        const assigneeMembership = await prisma.projectMember.findUnique({
          where: { userId_projectId: { userId: body.assigneeId, projectId: id } },
        });
        if (!assigneeMembership) {
          return NextResponse.json({ error: 'Assignee is not a project member' }, { status: 400 });
        }
      }
      updateData.assigneeId = body.assigneeId || null;
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE /api/projects/[id]/tasks/[taskId] - Delete task
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, taskId } = await params;

    const { isMember, role } = await getProjectMembership(prisma, session.user.id, id);
    if (!isMember) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId, projectId: id },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Members can only delete tasks they created
    if (role === 'MEMBER' && task.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: 'You can only delete tasks you created' },
        { status: 403 }
      );
    }

    await prisma.task.delete({ where: { id: taskId } });

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
