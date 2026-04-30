'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import styles from './detail.module.css';

export default function ProjectDetailPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('board');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', assigneeId: '' });
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('MEMBER');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => { fetchProject(); }, [id]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (!res.ok) { router.push('/dashboard/projects'); return; }
      setProject(await res.json());
    } catch { router.push('/dashboard/projects'); } finally { setLoading(false); }
  };

  const showMsg = (message, type = 'success') => { setToast({ message, type }); setTimeout(() => setToast(null), 3000); };
  const isAdmin = project?.currentUserRole === 'ADMIN';
  const getInitials = (n) => n ? n.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2) : '?';
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  const isOverdue = (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE';

  const openCreateTask = () => { setEditingTask(null); setTaskForm({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', assigneeId: '' }); setError(''); setComments([]); setShowTaskModal(true); };
  const openEditTask = (t) => {
    setEditingTask(t);
    setTaskForm({ title: t.title, description: t.description || '', status: t.status, priority: t.priority, dueDate: t.dueDate ? t.dueDate.split('T')[0] : '', assigneeId: t.assigneeId || '' });
    setError('');
    fetchComments(t.id);
    setShowTaskModal(true);
  };

  const fetchComments = async (taskId) => {
    try {
      const res = await fetch(`/api/projects/${id}/tasks/${taskId}/comments`);
      if (res.ok) setComments(await res.json());
    } catch {}
  };

  const handleSaveComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`/api/projects/${id}/tasks/${editingTask.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });
      if (res.ok) {
        setNewComment('');
        fetchComments(editingTask.id);
      }
    } catch {}
  };

  const handleSaveTask = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const url = editingTask ? `/api/projects/${id}/tasks/${editingTask.id}` : `/api/projects/${id}/tasks`;
      const res = await fetch(url, { method: editingTask ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...taskForm, assigneeId: taskForm.assigneeId || null }) });
      if (!res.ok) { setError((await res.json()).error); return; }
      setShowTaskModal(false); showMsg(editingTask ? 'Task updated' : 'Task created'); fetchProject();
    } catch { setError('Failed to save task'); } finally { setSaving(false); }
  };

  const handleDeleteTask = async (taskId) => { if (!confirm('Delete this task?')) return; try { const r = await fetch(`/api/projects/${id}/tasks/${taskId}`, { method: 'DELETE' }); if (r.ok) { showMsg('Task deleted'); fetchProject(); } else showMsg((await r.json()).error, 'error'); } catch { showMsg('Failed', 'error'); } };
  const handleStatusChange = async (taskId, s) => { try { const r = await fetch(`/api/projects/${id}/tasks/${taskId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: s }) }); if (r.ok) fetchProject(); else showMsg((await r.json()).error, 'error'); } catch { showMsg('Failed', 'error'); } };

  const handleAddMember = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const r = await fetch(`/api/projects/${id}/members`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: memberEmail, memberRole }) });
      if (!r.ok) { setError((await r.json()).error); return; }
      setShowMemberModal(false); setMemberEmail(''); showMsg('Member added'); fetchProject();
    } catch { setError('Failed to add member'); } finally { setSaving(false); }
  };

  const handleRemoveMember = async (mId, name) => { if (!confirm(`Remove ${name}?`)) return; try { const r = await fetch(`/api/projects/${id}/members/${mId}`, { method: 'DELETE' }); if (r.ok) { showMsg('Removed'); fetchProject(); } else showMsg((await r.json()).error, 'error'); } catch { showMsg('Failed', 'error'); } };
  const handleRoleChange = async (mId, role) => { try { const r = await fetch(`/api/projects/${id}/members/${mId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) }); if (r.ok) { showMsg('Role updated'); fetchProject(); } } catch {} };
  const handleDeleteProject = async () => { if (!confirm('Delete this project permanently?')) return; try { const r = await fetch(`/api/projects/${id}`, { method: 'DELETE' }); if (r.ok) router.push('/dashboard/projects'); } catch {} };

  if (loading) return <div className={styles.loadingContainer}><div className="spinner" style={{ width: 32, height: 32 }}></div><p>Loading project...</p></div>;
  if (!project) return null;

  const tasks = project.tasks || [];
  const cols = { TODO: tasks.filter(t => t.status === 'TODO'), IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS'), DONE: tasks.filter(t => t.status === 'DONE') };

  const TaskCard = ({ task }) => (
    <div className={`${styles.taskCard} ${isOverdue(task) ? styles.overdue : ''}`}>
      <div className={styles.taskCardTop}><span className={`badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
        <div className={styles.taskActions}><button className={styles.actBtn} onClick={() => openEditTask(task)} title="Edit">✏️</button><button className={styles.actBtn} onClick={() => handleDeleteTask(task.id)} title="Delete">🗑️</button></div>
      </div>
      <h4 className={styles.taskTitle}>{task.title}</h4>
      {task.description && <p className={styles.taskDesc}>{task.description}</p>}
      <div className={styles.taskMeta}>
        {task.dueDate && <span className={isOverdue(task) ? styles.overdueText : styles.dueText}>📅 {fmtDate(task.dueDate)}</span>}
        {task.assignee && <div className="avatar avatar-sm" title={task.assignee.name}>{getInitials(task.assignee.name)}</div>}
      </div>
      <div className={styles.quickStatus}>
        {task.status !== 'TODO' && <button className={styles.qBtn} onClick={() => handleStatusChange(task.id, 'TODO')}>To Do</button>}
        {task.status !== 'IN_PROGRESS' && <button className={styles.qBtn} onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}>In Progress</button>}
        {task.status !== 'DONE' && <button className={`${styles.qBtn} ${styles.qBtnDone}`} onClick={() => handleStatusChange(task.id, 'DONE')}>✓ Done</button>}
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      {toast && <div className="toast-container"><div className={`toast toast-${toast.type}`}>{toast.message}</div></div>}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className="btn btn-ghost btn-sm" onClick={() => router.push('/dashboard/projects')}>← Back</button>
          <div><h1 className={styles.projectTitle}>{project.name}</h1>{project.description && <p className={styles.projectDesc}>{project.description}</p>}</div>
        </div>
        <div className={styles.headerActions}>
          <button className="btn btn-primary" onClick={openCreateTask}>+ Add Task</button>
          {isAdmin && <button className="btn btn-danger btn-sm" onClick={handleDeleteProject}>Delete Project</button>}
        </div>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === 'board' ? styles.activeTab : ''}`} onClick={() => setActiveTab('board')}>📋 Board</button>
        <button className={`${styles.tab} ${activeTab === 'team' ? styles.activeTab : ''}`} onClick={() => setActiveTab('team')}>👥 Team ({project.members?.length})</button>
      </div>

      {activeTab === 'board' && (
        <div className={styles.board}>
          {[['TODO', 'To Do', 'columnTodo'], ['IN_PROGRESS', 'In Progress', 'columnProgress'], ['DONE', 'Done', 'columnDone']].map(([key, label, cls]) => (
            <div key={key} className={styles.column}>
              <div className={`${styles.colHead} ${styles[cls]}`}><span>{label}</span><span className={styles.colCount}>{cols[key].length}</span></div>
              <div className={styles.colBody}>{cols[key].map(t => <TaskCard key={t.id} task={t} />)}{cols[key].length === 0 && <div className={styles.colEmpty}>No tasks</div>}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'team' && (
        <div className={styles.teamSection}>
          {isAdmin && <button className="btn btn-primary" onClick={() => { setError(''); setShowMemberModal(true); }}>+ Add Member</button>}
          <div className={styles.memberList}>
            {project.members?.map(m => (
              <div key={m.id} className={styles.memberCard}>
                <div className={styles.memberInfo}><div className="avatar avatar-lg">{getInitials(m.user.name)}</div><div><span className={styles.mName}>{m.user.name}</span><span className={styles.mEmail}>{m.user.email}</span></div></div>
                <div className={styles.memberActions}>
                  {isAdmin ? <select className="input" value={m.role} onChange={e => handleRoleChange(m.id, e.target.value)} style={{ width: 'auto', padding: '0.25rem 1.5rem 0.25rem 0.5rem', fontSize: '0.75rem' }}><option value="ADMIN">Admin</option><option value="MEMBER">Member</option></select> : <span className={`badge ${m.role === 'ADMIN' ? 'badge-admin' : 'badge-member'}`}>{m.role}</span>}
                  {isAdmin && <button className="btn btn-danger btn-sm" onClick={() => handleRemoveMember(m.id, m.user.name)}>Remove</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>{editingTask ? 'Edit Task' : 'Create Task'}</h2><button className="btn btn-ghost btn-sm" onClick={() => setShowTaskModal(false)}>✕</button></div>
            <form onSubmit={handleSaveTask}>
              <div className="modal-body">
                {error && <div style={{ color: 'var(--error)', fontSize: '0.813rem' }}>{error}</div>}
                <div className="form-group"><label className="form-label">Title *</label><input className="input" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} required autoFocus /></div>
                <div className="form-group"><label className="form-label">Description</label><textarea className="input textarea" value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} rows={3} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group"><label className="form-label">Status</label><select className="input select" value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}><option value="TODO">To Do</option><option value="IN_PROGRESS">In Progress</option><option value="DONE">Done</option></select></div>
                  <div className="form-group"><label className="form-label">Priority</label><select className="input select" value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option></select></div>
                </div>
                <div className="form-group"><label className="form-label">Due Date</label><input type="date" className="input" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Assignee</label><select className="input select" value={taskForm.assigneeId} onChange={e => setTaskForm({ ...taskForm, assigneeId: e.target.value })}><option value="">Unassigned</option>{project.members?.map(m => <option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}</select></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editingTask ? 'Update' : 'Create'}</button></div>
            </form>

            {editingTask && (
              <div className={styles.commentsSection}>
                <h3 className={styles.commentsTitle}>Comments</h3>
                <div className={styles.commentsList}>
                  {comments.map(c => (
                    <div key={c.id} className={styles.commentItem}>
                      <div className={styles.commentHeader}>
                        <span className={styles.commentUser}>{c.user.name}</span>
                        <span className={styles.commentDate}>{new Date(c.createdAt).toLocaleString()}</span>
                      </div>
                      <p className={styles.commentContent}>{c.content}</p>
                    </div>
                  ))}
                  {comments.length === 0 && <p className={styles.noComments}>No comments yet.</p>}
                </div>
                <form onSubmit={handleSaveComment} className={styles.commentForm}>
                  <input
                    className="input"
                    placeholder="Write a comment..."
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                  />
                  <button type="submit" className="btn btn-secondary btn-sm">Post</button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {showMemberModal && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Add Team Member</h2><button className="btn btn-ghost btn-sm" onClick={() => setShowMemberModal(false)}>✕</button></div>
            <form onSubmit={handleAddMember}>
              <div className="modal-body">
                {error && <div style={{ color: 'var(--error)', fontSize: '0.813rem' }}>{error}</div>}
                <div className="form-group"><label className="form-label">Email *</label><input type="email" className="input" placeholder="team@example.com" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} required autoFocus /><span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>User must have a TaskForge account</span></div>
                <div className="form-group"><label className="form-label">Role</label><select className="input select" value={memberRole} onChange={e => setMemberRole(e.target.value)}><option value="MEMBER">Member</option><option value="ADMIN">Admin</option></select></div>
              </div>
              <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Adding...' : 'Add Member'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
