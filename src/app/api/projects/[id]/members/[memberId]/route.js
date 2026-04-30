import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getProjectMembership } from '@/lib/utils';

// PUT /api/projects/[id]/members/[memberId] - Update member role (ADMIN only)
export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, memberId } = await params;

    const { isMember, role } = await getProjectMembership(prisma, session.user.id, id);
    if (!isMember || role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can change member roles' }, { status: 403 });
    }

    const { role: newRole } = await request.json();

    if (!['ADMIN', 'MEMBER'].includes(newRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const member = await prisma.projectMember.update({
      where: { id: memberId },
      data: { role: newRole },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error updating member role:', error);
    return NextResponse.json({ error: 'Failed to update member role' }, { status: 500 });
  }
}

// DELETE /api/projects/[id]/members/[memberId] - Remove member (ADMIN only)
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, memberId } = await params;

    const { isMember, role } = await getProjectMembership(prisma, session.user.id, id);
    if (!isMember || role !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can remove members' }, { status: 403 });
    }

    // Don't allow removing yourself if you're the only admin
    const memberToRemove = await prisma.projectMember.findUnique({
      where: { id: memberId },
    });

    if (!memberToRemove) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    if (memberToRemove.userId === session.user.id) {
      const adminCount = await prisma.projectMember.count({
        where: { projectId: id, role: 'ADMIN' },
      });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot remove the last admin from the project' },
          { status: 400 }
        );
      }
    }

    await prisma.projectMember.delete({ where: { id: memberId } });

    return NextResponse.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Error removing member:', error);
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 });
  }
}
