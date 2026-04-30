import './globals.css';

export const metadata = {
  title: 'TaskForge - Team Task Manager',
  description:
    'Build projects, assign tasks, and track progress with role-based access control. A modern team collaboration platform.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
