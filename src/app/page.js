import Link from 'next/link';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <div className={styles.page}>
      {/* Navbar */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          <Link href="/" className={styles.navLogo}>
            <div className={styles.logoIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span>TaskForge</span>
          </Link>
          <div className={styles.navLinks}>
            <Link href="/auth/login" className="btn btn-ghost">Sign in</Link>
            <Link href="/auth/register" className="btn btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.heroOrb1}></div>
          <div className={styles.heroOrb2}></div>
          <div className={styles.heroGrid}></div>
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.badgeDot}></span>
            Team Task Manager
          </div>
          <h1 className={styles.heroTitle}>
            Manage tasks.<br />
            <span className="gradient-text">Ship faster.</span>
          </h1>
          <p className={styles.heroDesc}>
            Create projects, assign tasks, and track progress with role-based access control.
            Built for teams that move fast.
          </p>
          <div className={styles.heroCTA}>
            <Link href="/auth/register" className="btn btn-primary btn-lg">
              Start for Free
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
            <Link href="/auth/login" className="btn btn-secondary btn-lg">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <h2 className={styles.sectionTitle}>Everything you need</h2>
        <p className={styles.sectionSubtitle}>Powerful features to manage your team&apos;s work efficiently</p>
        <div className={styles.featureGrid}>
          {[
            { icon: '🔐', title: 'Authentication', desc: 'Secure signup and login with encrypted passwords and JWT sessions.' },
            { icon: '📁', title: 'Project Management', desc: 'Create projects, organize work, and collaborate with your team.' },
            { icon: '✅', title: 'Task Tracking', desc: 'Kanban boards with status tracking, priorities, and due dates.' },
            { icon: '👥', title: 'Team Collaboration', desc: 'Invite members, assign roles, and manage access control.' },
            { icon: '🛡️', title: 'Role-Based Access', desc: 'Admin and Member roles with fine-grained permission controls.' },
            { icon: '📊', title: 'Dashboard', desc: 'Real-time overview of tasks, progress, and overdue items.' },
          ].map((f, i) => (
            <div key={i} className={styles.featureCard} style={{ animationDelay: `${i * 100}ms` }}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>Built with Next.js, Prisma & MongoDB • TaskForge © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}
