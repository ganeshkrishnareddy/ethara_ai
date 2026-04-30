'use client';

import { useState, useEffect } from 'react';
import styles from './profile.module.css';

export default function ProfilePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/profile')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="spinner" style={{ width: 32, height: 32 }}></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!data || !data.user) return <div>Failed to load profile.</div>;

  const { user, taskStats } = data;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Your Profile</h1>
        <p className={styles.subtitle}>Manage your account and view your performance</p>
      </div>

      <div className={styles.content}>
        <div className={styles.profileCard}>
          <div className={styles.avatarLarge}>
            {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div className={styles.userInfo}>
            <h2 className={styles.userName}>{user.name}</h2>
            <p className={styles.userEmail}>{user.email}</p>
            <p className={styles.joinedAt}>Member since {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statBox}>
            <span className={styles.statVal}>{user._count.memberships}</span>
            <span className={styles.statLab}>Projects</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statVal}>{taskStats.todo}</span>
            <span className={styles.statLab}>To Do</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statVal}>{taskStats.in_progress}</span>
            <span className={styles.statLab}>In Progress</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statVal}>{taskStats.done}</span>
            <span className={styles.statLab}>Completed</span>
          </div>
        </div>

        <div className={styles.settingsSection}>
          <h3 className={styles.sectionTitle}>Account Settings</h3>
          <div className={styles.settingsList}>
            <div className={styles.settingItem}>
              <div>
                <p className={styles.settingLabel}>Email Notifications</p>
                <p className={styles.settingDesc}>Receive updates about your assigned tasks</p>
              </div>
              <div className={styles.toggle}>
                <input type="checkbox" defaultChecked />
              </div>
            </div>
            <div className={styles.settingItem}>
              <div>
                <p className={styles.settingLabel}>Two-Factor Authentication</p>
                <p className={styles.settingDesc}>Add an extra layer of security to your account</p>
              </div>
              <button className="btn btn-secondary btn-sm">Enable</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
