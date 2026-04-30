import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export const metadata = {
  title: 'Dashboard - TaskForge',
  description: 'Manage your projects and tasks',
};

export default async function DashboardLayout({ children }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar user={session.user} />
      <main
        style={{
          flex: 1,
          marginLeft: 'var(--sidebar-width)',
          padding: 'var(--spacing-xl)',
          transition: 'margin-left var(--transition-base)',
          maxWidth: '100%',
          overflow: 'hidden',
        }}
      >
        {children}
      </main>
    </div>
  );
}
