'use client';

import Icon from '@/components/ui/Icon';
import { can } from '@/lib/permissions';
import styles from '../AdminSettings.module.css';

export const SETTINGS_TABS = [
  { id: 'company', label: 'Company & Billing', icon: 'fileText', permission: 'settings.view' },
  { id: 'care', label: 'Store & Support', icon: 'phone', permission: 'settings.view' },
  { id: 'showroom', label: 'Showroom', icon: 'mapPin', permission: 'settings.view' },
  { id: 'consultation', label: 'Consultation Slots', icon: 'calendar', permission: 'settings.view' },
  { id: 'story', label: 'Brand Story', icon: 'bookOpen', permission: 'settings.view' },
  { id: 'team', label: 'Team Members', icon: 'users', permission: 'team.manage' },
  { id: 'roles', label: 'Roles & Permissions', icon: 'shield', permission: 'roles.manage' },
  { id: 'security', label: 'Security', icon: 'lock', permission: 'settings.security' },
  { id: 'audit', label: 'Audit Log', icon: 'history', permission: 'audit.view' }
];

export default function SettingsSubNav({ activeTab, onTabSelect, session }) {
  // Filter tabs visible to current session
  const effectiveSession = session || { role: 'admin' };
  const visibleTabs = SETTINGS_TABS.filter((tab) => {
    if (!tab.permission) return true;
    return can(effectiveSession, tab.permission);
  });

  return (
    <nav className={styles.subNav} aria-label="Settings navigation">
      <div className={styles.subNavHeader}>
        <span className={styles.subNavKicker}>SETTINGS</span>
      </div>
      <div className={styles.subNavList}>
        {visibleTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`${styles.subNavBtn} ${isActive ? styles.subNavBtnActive : ''}`}
              onClick={() => onTabSelect(tab.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon name={tab.icon} size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
