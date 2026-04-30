import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getProjectMembership } from '@/lib/utils';

// GET /api/projects/[id]/members - List project members
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

    const members = await prisma.projectMember.findMany({
      where: { projectId: id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { joinedAt: 'asc' },
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ error: 'Failed to fetch members' }, { status: 500 });
  }
}

// POST /api/projects/[id]/members - Add member by email (ADMIN only)
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
    if (role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can add members' }, { status: 403 });
    }

    const { email, memberRole = 'MEMBER' } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No user found with this email. They need to register first.' },
        { status: 404 }
      );
    }

    // Check if already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: user.id, projectId: id } },
    });

    if (existingMember) {
      return NextResponse.json({ error: 'User is already a member of this project' }, { status: 409 });
    }

    // Add member
    const member = await prisma.projectMember.create({
      data: {
        userId: user.id,
        projectId: id,
        role: memberRole === 'ADMIN' ? 'ADMIN' : 'MEMBER',
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('Error adding member:', error);
    return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
  }
}
