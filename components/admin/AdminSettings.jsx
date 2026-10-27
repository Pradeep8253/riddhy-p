'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { ConfirmDialog } from '@/components/admin/ui';
import { can } from '@/lib/permissions';

import { useSettingsForm } from './settings/useSettingsForm';
import SettingsSubNav, { SETTINGS_TABS } from './settings/SettingsSubNav';
import StickySaveBar from './settings/StickySaveBar';

import CompanyBillingTab from './settings/CompanyBillingTab';
import ShowroomTab from './settings/ShowroomTab';
import StoreSupportTab from './settings/StoreSupportTab';
import BrandStoryTab from './settings/BrandStoryTab';
import ConsultationTab from './settings/ConsultationTab';
import TeamMembersTab from './settings/TeamMembersTab';
import RolesPermissionsTab from './settings/RolesPermissionsTab';
import SecurityTab from './settings/SecurityTab';
import AuditLogTab from './settings/AuditLogTab';

import styles from './AdminSettings.module.css';

export default function AdminSettings({ session }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Settings form state & actions
  const {
    formData,
    fieldErrors,
    isLoading,
    isSaving,
    isDirty,
    toast,
    setToast,
    source,
    warehouses,
    companyValidation,
    updateField,
    updateStoryMetric,
    handleSave,
    handleReset
  } = useSettingsForm();

  // Determine allowed tabs based on permissions
  const allowedTabs = useMemo(() => {
    const effectiveSession = session || { role: 'admin' };
    return SETTINGS_TABS.filter((tab) => {
      if (!tab.permission) return true;
      return can(effectiveSession, tab.permission);
    });
  }, [session]);

  const defaultTab = allowedTabs[0]?.id || 'company';
  const tabParam = searchParams?.get('tab');

  // Derive active tab from URL or fallback
  const activeTab = useMemo(() => {
    if (tabParam && allowedTabs.some((t) => t.id === tabParam)) {
      return tabParam;
    }
    return defaultTab;
  }, [tabParam, allowedTabs, defaultTab]);

  // Sync invalid tab back to first allowed tab
  useEffect(() => {
    if (allowedTabs.length > 0 && (!tabParam || !allowedTabs.some((t) => t.id === tabParam))) {
      const params = new URLSearchParams(searchParams?.toString() || '');
      params.set('tab', defaultTab);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [tabParam, allowedTabs, defaultTab, pathname, router, searchParams]);

  // Unsaved changes confirmation dialog state
  const [pendingTab, setPendingTab] = useState(null);
  const [showConfirmSwitch, setShowConfirmSwitch] = useState(false);

  // Tab change handler
  const handleTabSelect = (nextTabId) => {
    if (nextTabId === activeTab) return;

    if (isDirty) {
      setPendingTab(nextTabId);
      setShowConfirmSwitch(true);
      return;
    }

    navigateToTab(nextTabId);
  };

  const navigateToTab = (tabId) => {
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('tab', tabId);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleConfirmDiscard = () => {
    handleReset();
    setShowConfirmSwitch(false);
    if (pendingTab) {
      navigateToTab(pendingTab);
      setPendingTab(null);
    }
  };

  const handleCancelDiscard = () => {
    setShowConfirmSwitch(false);
    setPendingTab(null);
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#687269', fontStyle: 'italic' }}>
          Loading company and store configuration…
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Top Header */}
      <div className={styles.head}>
        <div>
          <span className="kicker">Store Operations · Business Truth</span>
          <h1>Company & Store Settings</h1>
          <p>
            Manage legal credentials, GSTIN, invoice sequence numbering, fulfillment defaults,
            customer care desks, showroom addresses, access roles, and verified brand proof metrics.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {isDirty && (
            <span className={styles.dirtyBadge}>
              <span className={styles.statusDot} style={{ background: '#b78103' }} />
              Unsaved Changes
            </span>
          )}
          <div
            className={`${styles.statusBadge} ${
              source === 'database' ? styles.badgeDb : styles.badgeEnv
            }`}
          >
            <span className={styles.statusDot} />
            <span>
              {source === 'database'
                ? 'Live Configuration (Stored in Database)'
                : 'System Default Configuration'}
            </span>
          </div>
        </div>
      </div>

      {/* Toast Alert */}
      {toast && (
        <div
          className={`${styles.alert} ${
            toast.type === 'success'
              ? styles.alertSuccess
              : toast.type === 'warning'
              ? styles.alertWarning
              : styles.alertError
          }`}
        >
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            aria-label="Dismiss notification"
          >
            <Icon name="close" size={14} />
          </button>
        </div>
      )}

      {/* Two-column layout: Left Sub-navigation + Right Tab Content */}
      <div className={styles.settingsLayout}>
        <SettingsSubNav
          activeTab={activeTab}
          onTabSelect={handleTabSelect}
          session={session}
        />

        <div className={styles.tabContentArea}>
          {activeTab === 'company' && (
            <CompanyBillingTab
              formData={formData}
              updateField={updateField}
              fieldErrors={fieldErrors}
              warehouses={warehouses}
              companyValidation={companyValidation}
            />
          )}

          {activeTab === 'showroom' && (
            <ShowroomTab
              formData={formData}
              updateField={updateField}
              fieldErrors={fieldErrors}
            />
          )}

          {activeTab === 'support' && (
            <StoreSupportTab
              formData={formData}
              updateField={updateField}
              fieldErrors={fieldErrors}
            />
          )}

          {activeTab === 'story' && (
            <BrandStoryTab
              formData={formData}
              updateField={updateField}
              updateStoryMetric={updateStoryMetric}
              fieldErrors={fieldErrors}
            />
          )}

          {activeTab === 'consultation' && (
            <ConsultationTab
              formData={formData}
              updateField={updateField}
              fieldErrors={fieldErrors}
            />
          )}

          {activeTab === 'team' && (
            <TeamMembersTab session={session} />
          )}

          {activeTab === 'roles' && (
            <RolesPermissionsTab session={session} />
          )}

          {activeTab === 'security' && (
            <SecurityTab session={session} />
          )}

          {activeTab === 'audit' && (
            <AuditLogTab session={session} />
          )}
        </div>
      </div>

      {/* Sticky Save Bar */}
      <StickySaveBar
        isDirty={isDirty}
        isSaving={isSaving}
        onSave={handleSave}
        onReset={handleReset}
      />

      {/* Unsaved Changes Confirmation Dialog */}
      {showConfirmSwitch && (
        <ConfirmDialog
          isOpen={showConfirmSwitch}
          title="Unsaved Changes Warning"
          message="You have unsaved changes in your current settings tab. If you switch tabs without saving, these modifications will be discarded. Do you wish to proceed?"
          confirmLabel="Discard & Switch Tab"
          cancelLabel="Stay on Tab"
          variant="danger"
          onConfirm={handleConfirmDiscard}
          onCancel={handleCancelDiscard}
        />
      )}
    </div>
  );
}
