'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((res) => res.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="spinner" style={{ width: 32, height: 32 }}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const stats = data?.stats || {};

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'TODO': return 'badge-todo';
      case 'IN_PROGRESS': return 'badge-in-progress';
      case 'DONE': return 'badge-done';
      default: return '';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'TODO': return 'To Do';
      case 'IN_PROGRESS': return 'In Progress';
      case 'DONE': return 'Done';
      default: return status;
    }
  };

  const getPriorityClass = (priority) => {
    switch (priority) {
      case 'LOW': return 'badge-low';
      case 'MEDIUM': return 'badge-medium';
      case 'HIGH': return 'badge-high';
      case 'URGENT': return 'badge-urgent';
      default: return '';
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Overview of your projects and tasks</p>
        </div>
        <Link href="/dashboard/projects" className="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Project
        </Link>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.statProjects}`}>
          <div className={styles.statIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.totalProjects || 0}</span>
            <span className={styles.statLabel}>Projects</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statTasks}`}>
          <div className={styles.statIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.totalTasks || 0}</span>
            <span className={styles.statLabel}>Total Tasks</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statDone}`}>
          <div className={styles.statIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.doneTasks || 0}</span>
            <span className={styles.statLabel}>Completed</span>
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.statOverdue}`}>
          <div className={styles.statIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className={styles.statContent}>
            <span className={styles.statValue}>{stats.overdueTasks || 0}</span>
            <span className={styles.statLabel}>Overdue</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {stats.totalTasks > 0 && (
        <div className={styles.progressSection}>
          <div className={styles.progressHeader}>
            <span className={styles.progressTitle}>Overall Progress</span>
            <span className={styles.progressPercent}>
              {Math.round((stats.doneTasks / stats.totalTasks) * 100)}%
            </span>
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${(stats.doneTasks / stats.totalTasks) * 100}%` }}
            ></div>
          </div>
          <div className={styles.progressLegend}>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: 'var(--status-todo)' }}></span>
              To Do: {stats.todoTasks || 0}
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: 'var(--status-progress)' }}></span>
              In Progress: {stats.inProgressTasks || 0}
            </span>
            <span className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: 'var(--status-done)' }}></span>
              Done: {stats.doneTasks || 0}
            </span>
          </div>
        </div>
      )}

      {/* Content grid */}
      <div className={styles.contentGrid}>
        {/* Overdue Tasks */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--error)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            Overdue Tasks
          </h2>
          {data?.overdueTasks?.length > 0 ? (
            <div className={styles.taskList}>
              {data.overdueTasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/dashboard/projects/${task.projectId}`}
                  className={styles.taskItem}
                >
                  <div className={styles.taskInfo}>
                    <span className={styles.taskTitle}>{task.title}</span>
                    <span className={styles.taskMeta}>
                      {task.project?.name} • Due {formatDate(task.dueDate)}
                    </span>
                  </div>
                  <span className={`badge ${getPriorityClass(task.priority)}`}>
                    {task.priority}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.emptySection}>
              <p>No overdue tasks 🎉</p>
            </div>
          )}
        </div>

        {/* My Pending Tasks */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            My Pending Tasks
          </h2>
          {data?.myPendingTasks?.length > 0 ? (
            <div className={styles.taskList}>
              {data.myPendingTasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/dashboard/projects/${task.projectId}`}
                  className={styles.taskItem}
                >
                  <div className={styles.taskInfo}>
                    <span className={styles.taskTitle}>{task.title}</span>
                    <span className={styles.taskMeta}>
                      {task.project?.name}
                      {task.dueDate && ` • Due ${formatDate(task.dueDate)}`}
                    </span>
                  </div>
                  <span className={`badge ${getStatusClass(task.status)}`}>
                    {getStatusLabel(task.status)}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.emptySection}>
              <p>No pending tasks assigned to you</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className={`${styles.section} ${styles.sectionWide}`}>
          <h2 className={styles.sectionTitle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            Recent Tasks
          </h2>
          {data?.recentTasks?.length > 0 ? (
            <div className={styles.taskList}>
              {data.recentTasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/dashboard/projects/${task.projectId}`}
                  className={styles.taskItem}
                >
                  <div className={styles.taskInfo}>
                    <span className={styles.taskTitle}>{task.title}</span>
                    <span className={styles.taskMeta}>
                      {task.project?.name} • {formatDate(task.createdAt)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className={`badge ${getStatusClass(task.status)}`}>
                      {getStatusLabel(task.status)}
                    </span>
                    <span className={`badge ${getPriorityClass(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.emptySection}>
              <p>No tasks yet. Create a project to get started!</p>
              <Link href="/dashboard/projects" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                Create Project
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
