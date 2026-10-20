'use client';

import { useState, useEffect, useMemo } from 'react';
import Icon from '@/components/ui/Icon';
import { Badge, Modal, ConfirmDialog } from '@/components/admin/ui';
import { PERMISSION_MODULES, ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from '@/lib/permissions';
import styles from '../AdminSettings.module.css';

export default function RolesPermissionsTab({ session }) {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoleKey, setSelectedRoleKey] = useState('admin');
  const [editedPerms, setEditedPerms] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Create role modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ key: '', label: '', description: '', cloneFrom: 'admin' });
  const [createError, setCreateError] = useState('');

  // Delete role confirmation
  const [deleteRoleTarget, setDeleteRoleTarget] = useState(null);

  // Fetch all roles from API
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/roles');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setRoles(json.data);
          // Initialize edited permissions mapping
          const permsMap = {};
          json.data.forEach((r) => {
            permsMap[r.key] = [...r.permissions];
          });
          setEditedPerms(permsMap);
          return;
        }
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }

    // Default fallback if offline or initial load
    const fallbackRoles = [
      { key: 'super-admin', label: 'Super Admin', description: 'Unrestricted system access to all company & operational capabilities', permissions: [...ALL_PERMISSIONS], isSystem: true, userCount: 1 },
      { key: 'admin', label: 'Operations Admin', description: 'Full administration across catalogue, orders, settings, and team', permissions: [...DEFAULT_ROLE_PERMISSIONS.admin], isSystem: true, userCount: 1 },
      { key: 'finance', label: 'Finance & Accounts', description: 'Access to GST invoices, credit notes, sales data, and GSTR-1 exports', permissions: [...DEFAULT_ROLE_PERMISSIONS.finance], isSystem: true, userCount: 0 },
      { key: 'warehouse', label: 'Warehouse & Logistics', description: 'Order fulfillment, dispatch status updates, and stock inventory', permissions: [...DEFAULT_ROLE_PERMISSIONS.warehouse], isSystem: true, userCount: 0 },
      { key: 'marketing', label: 'Merchandising & Growth', description: 'Catalogue management, banners, collections, and promotions', permissions: [...DEFAULT_ROLE_PERMISSIONS.marketing], isSystem: true, userCount: 0 },
      { key: 'support', label: 'Customer Support', description: 'Handling customer inquiries, leads, and warranty claims', permissions: [...DEFAULT_ROLE_PERMISSIONS.support], isSystem: true, userCount: 0 }
    ];
    setRoles(fallbackRoles);
    const initialPerms = {};
    fallbackRoles.forEach((r) => {
      initialPerms[r.key] = [...r.permissions];
    });
    setEditedPerms(initialPerms);
    setLoading(false);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const currentRole = useMemo(() => {
    return roles.find((r) => r.key === selectedRoleKey) || roles[0];
  }, [roles, selectedRoleKey]);

  const currentPerms = useMemo(() => {
    if (!currentRole) return [];
    if (currentRole.key === 'super-admin') return [...ALL_PERMISSIONS];
    return editedPerms[currentRole.key] || currentRole.permissions || [];
  }, [currentRole, editedPerms]);

  // Check if current role has unsaved changes
  const isDirty = useMemo(() => {
    if (!currentRole || currentRole.key === 'super-admin') return false;
    const original = currentRole.permissions || [];
    const edited = editedPerms[currentRole.key] || [];
    if (original.length !== edited.length) return true;
    const sortedOrig = [...original].sort().join(',');
    const sortedEdit = [...edited].sort().join(',');
    return sortedOrig !== sortedEdit;
  }, [currentRole, editedPerms]);

  // Toggle single permission
  const togglePermission = (permKey) => {
    if (!currentRole || currentRole.key === 'super-admin') return;

    setEditedPerms((prev) => {
      const existing = prev[currentRole.key] || [];
      const hasPerm = existing.includes(permKey);
      const next = hasPerm ? existing.filter((k) => k !== permKey) : [...existing, permKey];
      return { ...prev, [currentRole.key]: next };
    });
  };

  // Toggle entire module
  const toggleModulePermissions = (modulePermissions, selectAll) => {
    if (!currentRole || currentRole.key === 'super-admin') return;

    const moduleKeys = modulePermissions.map((p) => p.key);
    setEditedPerms((prev) => {
      const existing = prev[currentRole.key] || [];
      let next;
      if (selectAll) {
        const set = new Set([...existing, ...moduleKeys]);
        next = Array.from(set);
      } else {
        next = existing.filter((k) => !moduleKeys.includes(k));
      }
      return { ...prev, [currentRole.key]: next };
    });
  };

  // Reset to default permissions
  const handleResetDefaults = () => {
    if (!currentRole || currentRole.key === 'super-admin') return;
    const defaults = DEFAULT_ROLE_PERMISSIONS[currentRole.key] || [];
    setEditedPerms((prev) => ({
      ...prev,
      [currentRole.key]: [...defaults]
    }));
    setStatusMessage({ type: 'success', text: `Reverted to default permissions for ${currentRole.label}. Remember to save changes.` });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Save permissions to server
  const handleSaveRole = async () => {
    if (!currentRole || currentRole.key === 'super-admin') return;
    setIsSaving(true);
    setStatusMessage(null);

    try {
      const payload = {
        permissions: editedPerms[currentRole.key] || []
      };

      const res = await fetch(`/api/admin/roles/${currentRole.key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to save role permissions.');
      }

      // Update role in local list
      setRoles((prev) =>
        prev.map((r) => (r.key === currentRole.key ? { ...r, permissions: [...payload.permissions] } : r))
      );

      setStatusMessage({ type: 'success', text: `Successfully updated permissions for ${currentRole.label}.` });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setIsSaving(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  // Create custom role
  const handleCreateRole = async (e) => {
    e.preventDefault();
    setCreateError('');

    const formattedKey = createForm.key.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
    if (!formattedKey || !createForm.label.trim()) {
      setCreateError('Role Key and Display Label are required.');
      return;
    }

    try {
      const basePerms = editedPerms[createForm.cloneFrom] || DEFAULT_ROLE_PERMISSIONS[createForm.cloneFrom] || [];

      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: formattedKey,
          label: createForm.label.trim(),
          description: createForm.description.trim(),
          permissions: basePerms
        })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to create custom role.');
      }

      const newRole = json.data;
      setRoles((prev) => [...prev, newRole]);
      setEditedPerms((prev) => ({
        ...prev,
        [newRole.key]: [...newRole.permissions]
      }));
      setSelectedRoleKey(newRole.key);
      setCreateModalOpen(false);
      setCreateForm({ key: '', label: '', description: '', cloneFrom: 'admin' });
      setStatusMessage({ type: 'success', text: `Created new custom role: ${newRole.label}.` });
    } catch (err) {
      setCreateError(err.message);
    }
  };

  // Delete custom role
  const handleDeleteRole = async () => {
    if (!deleteRoleTarget) return;

    try {
      const res = await fetch(`/api/admin/roles/${deleteRoleTarget.key}`, {
        method: 'DELETE'
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to delete role.');
      }

      setRoles((prev) => prev.filter((r) => r.key !== deleteRoleTarget.key));
      setSelectedRoleKey('admin');
      setDeleteRoleTarget(null);
      setStatusMessage({ type: 'success', text: `Deleted custom role: ${deleteRoleTarget.label}.` });
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
      setDeleteRoleTarget(null);
    }
  };

  if (loading) {
    return (
      <section className={styles.card}>
        <div style={{ padding: '40px 0', textAlign: 'center', color: '#687269', fontStyle: 'italic' }}>
          Loading role definitions and access matrices…
        </div>
      </section>
    );
  }

  return (
    <section className={styles.card}>
      <div className={styles.cardHead} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2>Dynamic Roles & Access Permissions Matrix</h2>
          <p>
            Configure granular permission privileges assigned to administrative roles. Super-admin and operations admin can modify capabilities or define custom roles.
          </p>
        </div>
        <button
          type="button"
          className={styles.saveBtn}
          onClick={() => setCreateModalOpen(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <Icon name="plus" size={14} />
          <span>Create Custom Role</span>
        </button>
      </div>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div
          className={`${styles.alert} ${statusMessage.type === 'success' ? styles.alertSuccess : styles.alertError}`}
          style={{ marginTop: 14 }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name={statusMessage.type === 'success' ? 'check' : 'alertCircle'} size={16} />
            <span>{statusMessage.text}</span>
          </div>
          <button type="button" onClick={() => setStatusMessage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <Icon name="close" size={14} />
          </button>
        </div>
      )}

      {/* Role Selection Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12, marginTop: 18 }}>
        {roles.map((r) => {
          const isSelected = selectedRoleKey === r.key;
          const hasUnsaved = editedPerms[r.key] && r.permissions && (
            editedPerms[r.key].length !== r.permissions.length ||
            [...editedPerms[r.key]].sort().join(',') !== [...r.permissions].sort().join(',')
          );

          return (
            <button
              key={r.key}
              type="button"
              className={`${styles.roleCard} ${isSelected ? styles.roleCardActive : ''}`}
              onClick={() => setSelectedRoleKey(r.key)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <b style={{ color: 'var(--rf-forest-deep)', fontSize: 13 }}>{r.label}</b>
                <Badge variant={r.isSystem ? 'neutral' : 'info'}>
                  {r.isSystem ? 'System' : 'Custom'}
                </Badge>
              </div>
              <div style={{ fontSize: 10, color: '#888', marginTop: 2, fontFamily: 'monospace' }}>
                {r.key}
              </div>
              <p style={{ margin: '6px 0 0', fontSize: 11, color: '#687269', lineHeight: 1.4 }}>
                {r.description || 'Custom administrative privileges'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTop: '1px solid #f0f0ee', fontSize: 11 }}>
                <span style={{ color: '#777' }}>{r.userCount || 0} member(s)</span>
                {hasUnsaved && (
                  <span style={{ color: '#c48620', fontWeight: 800, fontSize: 10 }}>● Unsaved</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Role Header & Toolbar */}
      {currentRole && (
        <div style={{ marginTop: 28 }}>
          <div className={styles.permMatrixToolbar}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', margin: 0, fontSize: 16, color: 'var(--rf-forest-deep)' }}>
                  Permissions for: <span style={{ color: 'var(--rf-green-800)' }}>{currentRole.label}</span>
                </h3>
                <Badge variant={currentRole.isSystem ? 'neutral' : 'info'}>
                  {currentRole.isSystem ? 'System Role' : 'Custom Role'}
                </Badge>
              </div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                {currentPerms.length} of {ALL_PERMISSIONS.length} operational capabilities enabled
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              {currentRole.key !== 'super-admin' && (
                <>
                  {currentRole.isSystem && (
                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      onClick={handleResetDefaults}
                      style={{ padding: '6px 12px', fontSize: 12 }}
                    >
                      Reset to Defaults
                    </button>
                  )}

                  {!currentRole.isSystem && (
                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      onClick={() => setDeleteRoleTarget(currentRole)}
                      style={{ padding: '6px 12px', fontSize: 12, color: '#c62828', borderColor: '#ffcdd2' }}
                    >
                      Delete Role
                    </button>
                  )}

                  <button
                    type="button"
                    className={styles.saveBtn}
                    onClick={handleSaveRole}
                    disabled={!isDirty || isSaving}
                    style={{
                      padding: '8px 16px',
                      fontSize: 12,
                      opacity: !isDirty || isSaving ? 0.6 : 1,
                      cursor: !isDirty || isSaving ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {isSaving ? 'Saving…' : isDirty ? 'Save Role Changes *' : 'Saved'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Super Admin Immutable Notice */}
          {currentRole.key === 'super-admin' && (
            <div
              style={{
                marginTop: 16,
                padding: '12px 16px',
                borderRadius: 10,
                background: '#fff9e6',
                border: '1px solid #ffe082',
                color: '#795548',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                fontSize: 12
              }}
            >
              <Icon name="lock" size={16} color="#c48620" />
              <span>
                <strong>Super Admin Access is Unrestricted:</strong> Super Admin holds full access to all system modules, configurations, APIs, and audit trails. These permissions are system-locked and cannot be modified.
              </span>
            </div>
          )}

          {/* Module-by-Module Permission Grid */}
          <div style={{ display: 'grid', gap: 18, marginTop: 18 }}>
            {PERMISSION_MODULES.map((mod) => {
              const allModuleKeys = mod.permissions.map((p) => p.key);
              const enabledCount = allModuleKeys.filter((k) => currentPerms.includes(k)).length;
              const isAllEnabled = enabledCount === allModuleKeys.length;
              const isSuperAdmin = currentRole.key === 'super-admin';

              return (
                <div key={mod.module} className={styles.permModuleCard}>
                  <div className={styles.permHeaderRow}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <b style={{ textTransform: 'uppercase', fontSize: 11, letterSpacing: '0.06em', color: 'var(--rf-green-800)' }}>
                        {mod.label}
                      </b>
                      <span style={{ fontSize: 11, color: '#777' }}>
                        ({enabledCount}/{allModuleKeys.length} active)
                      </span>
                    </div>

                    {!isSuperAdmin && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          className={styles.permMiniBtn}
                          onClick={() => toggleModulePermissions(mod.permissions, true)}
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          className={styles.permMiniBtn}
                          onClick={() => toggleModulePermissions(mod.permissions, false)}
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>

                  <div className={styles.permGrid}>
                    {mod.permissions.map((p) => {
                      const hasPerm = isSuperAdmin || currentPerms.includes(p.key);
                      return (
                        <label
                          key={p.key}
                          className={`${styles.permItemCard} ${hasPerm ? styles.permItemCardActive : ''} ${isSuperAdmin ? styles.permItemCardDisabled : ''}`}
                          onClick={(e) => {
                            if (isSuperAdmin) {
                              e.preventDefault();
                              return;
                            }
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={hasPerm}
                            disabled={isSuperAdmin}
                            onChange={() => togglePermission(p.key)}
                            style={{ marginTop: 2, accentColor: 'var(--rf-green-700)', cursor: isSuperAdmin ? 'not-allowed' : 'pointer' }}
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: hasPerm ? '#10261a' : '#666' }}>
                              {p.label}
                            </div>
                            <div style={{ fontSize: 10, color: '#888', fontFamily: 'monospace', margin: '1px 0' }}>
                              {p.key}
                            </div>
                            <div style={{ fontSize: 11, color: '#777', lineHeight: 1.3 }}>
                              {p.desc}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Create Custom Role */}
      {createModalOpen && (
        <Modal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Create Custom Admin Role"
        >
          <form onSubmit={handleCreateRole} style={{ display: 'grid', gap: 16 }}>
            {createError && (
              <div style={{ padding: '8px 12px', background: '#fdeeea', color: '#b71c1c', borderRadius: 8, fontSize: 12 }}>
                {createError}
              </div>
            )}

            <div className={styles.field}>
              <label>Role Key (System Identifier)</label>
              <input
                className={styles.input}
                value={createForm.key}
                onChange={(e) => setCreateForm({ ...createForm, key: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                placeholder="e.g. catalog-manager"
                required
              />
              <span className={styles.helpText}>Lowercase letters, numbers, and hyphens only</span>
            </div>

            <div className={styles.field}>
              <label>Display Label</label>
              <input
                className={styles.input}
                value={createForm.label}
                onChange={(e) => setCreateForm({ ...createForm, label: e.target.value })}
                placeholder="e.g. Catalogue Manager"
                required
              />
            </div>

            <div className={styles.field}>
              <label>Description</label>
              <textarea
                className={styles.textarea}
                rows={2}
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                placeholder="Responsibilities and access scope of this role…"
              />
            </div>

            <div className={styles.field}>
              <label>Clone Starting Permissions From</label>
              <select
                className={styles.select}
                value={createForm.cloneFrom}
                onChange={(e) => setCreateForm({ ...createForm, cloneFrom: e.target.value })}
              >
                {roles.filter((r) => r.key !== 'super-admin').map((r) => (
                  <option key={r.key} value={r.key}>
                    {r.label} ({r.permissions.length} permissions)
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => setCreateModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className={styles.saveBtn}>
                Create Role
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirm Dialog: Delete Custom Role */}
      {deleteRoleTarget && (
        <ConfirmDialog
          isOpen={Boolean(deleteRoleTarget)}
          onClose={() => setDeleteRoleTarget(null)}
          onConfirm={handleDeleteRole}
          title={`Delete Role "${deleteRoleTarget.label}"?`}
          message={`Are you sure you want to permanently delete the custom role "${deleteRoleTarget.label}" (${deleteRoleTarget.key})? This action cannot be undone.`}
          confirmLabel="Delete Role"
          variant="danger"
        />
      )}
    </section>
  );
}
