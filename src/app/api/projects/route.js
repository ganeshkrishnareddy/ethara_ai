import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET /api/projects - List all projects the user is a member of
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const memberships = await prisma.projectMember.findMany({
      where: { userId: session.user.id },
      include: {
        project: {
          include: {
            owner: { select: { id: true, name: true, email: true } },
            members: {
              include: { user: { select: { id: true, name: true, email: true } } },
            },
            tasks: {
              select: { id: true, status: true, dueDate: true },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    const projects = memberships.map((m) => {
      const tasks = m.project.tasks;
      const now = new Date();
      return {
        ...m.project,
        role: m.role,
        memberCount: m.project.members.length,
        taskStats: {
          total: tasks.length,
          todo: tasks.filter((t) => t.status === 'TODO').length,
          inProgress: tasks.filter((t) => t.status === 'IN_PROGRESS').length,
          done: tasks.filter((t) => t.status === 'DONE').length,
          overdue: tasks.filter(
            (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE'
          ).length,
        },
        tasks: undefined, // Remove raw tasks from response
      };
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

// POST /api/projects - Create a new project
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, tags } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Project name is required' }, { status: 400 });
    }

    // Create project and add creator as ADMIN
    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        tags: Array.isArray(tags) ? tags.filter(t => typeof t === 'string').map(t => t.trim()) : [],
        ownerId: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: 'ADMIN',
          },
        },
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
