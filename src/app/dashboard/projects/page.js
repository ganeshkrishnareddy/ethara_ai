'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './projects.module.css';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error);
        return;
      }

      setShowCreateModal(false);
      setNewProject({ name: '', description: '' });
      fetchProjects();
    } catch {
      setError('Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="spinner" style={{ width: 32, height: 32 }}></div>
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Projects</h1>
          <p className={styles.subtitle}>{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h3>No projects yet</h3>
          <p>Create your first project to start organizing tasks with your team.</p>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)} style={{ marginTop: '1rem' }}>
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {projects.map((project, i) => (
            <Link
              key={project.id}
              href={`/dashboard/projects/${project.id}`}
              className={styles.projectCard}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className={styles.cardHeader}>
                <div className={styles.projectIcon}>
                  {project.name.charAt(0).toUpperCase()}
                </div>
                <span className={`badge ${project.role === 'ADMIN' ? 'badge-admin' : 'badge-member'}`}>
                  {project.role}
                </span>
              </div>

              <h3 className={styles.projectName}>{project.name}</h3>
              {project.tags && project.tags.length > 0 && (
                <div className={styles.tagList}>
                  {project.tags.map(tag => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              )}
              {project.description && (
                <p className={styles.projectDesc}>{project.description}</p>
              )}

              <div className={styles.cardStats}>
                <div className={styles.statItem}>
                  <span className={styles.statNumber}>{project.taskStats?.total || 0}</span>
                  <span className={styles.statText}>Tasks</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statNumber} style={{ color: 'var(--status-done)' }}>
                    {project.taskStats?.done || 0}
                  </span>
                  <span className={styles.statText}>Done</span>
                </div>
                <div className={styles.statItem}>
                  <span
                    className={styles.statNumber}
                    style={{ color: project.taskStats?.overdue > 0 ? 'var(--error)' : 'var(--text-tertiary)' }}
                  >
                    {project.taskStats?.overdue || 0}
                  </span>
                  <span className={styles.statText}>Overdue</span>
                </div>
              </div>

              {project.taskStats?.total > 0 && (
                <div className={styles.miniProgress}>
                  <div
                    className={styles.miniProgressFill}
                    style={{
                      width: `${(project.taskStats.done / project.taskStats.total) * 100}%`,
                    }}
                  ></div>
                </div>
              )}

              <div className={styles.cardFooter}>
                <div className={styles.memberAvatars}>
                  {project.members?.slice(0, 4).map((m) => (
                    <div key={m.id} className={styles.miniAvatar} title={m.user.name}>
                      {getInitials(m.user.name)}
                    </div>
                  ))}
                  {project.memberCount > 4 && (
                    <div className={styles.miniAvatar} style={{ background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                      +{project.memberCount - 4}
                    </div>
                  )}
                </div>
                <span className={styles.memberCount}>{project.memberCount} member{project.memberCount !== 1 ? 's' : ''}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Project</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowCreateModal(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                {error && <div style={{ color: 'var(--error)', fontSize: '0.8125rem' }}>{error}</div>}
                <div className="form-group">
                  <label htmlFor="project-name" className="form-label">Project Name *</label>
                  <input
                    id="project-name"
                    type="text"
                    className="input"
                    placeholder="e.g. Marketing Website"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    required
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="project-desc" className="form-label">Description</label>
                  <textarea
                    id="project-desc"
                    className="input textarea"
                    placeholder="Brief description of the project..."
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
