'use client';

import { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { Badge, Modal, ConfirmDialog } from '@/components/admin/ui';
import { formatDateDDMMYYYY } from '@/lib/date-utils';
import styles from '../AdminSettings.module.css';

export default function TeamMembersTab({ session }) {
  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState(null);

  // Invite modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({ name: '', email: '', role: 'support', password: '' });
  const [createdTempPass, setCreatedTempPass] = useState(null);
  const [inviteError, setInviteError] = useState('');

  // Edit / Role Change modal
  const [editingMember, setEditingMember] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', role: '', active: true });
  const [editError, setEditError] = useState('');

  // Password reset modal
  const [passwordResetMember, setPasswordResetMember] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Load team members and roles
  const loadData = async () => {
    setLoading(true);
    try {
      const [teamRes, rolesRes] = await Promise.all([
        fetch('/api/admin/team').catch(() => null),
        fetch('/api/admin/roles').catch(() => null)
      ]);

      if (teamRes && teamRes.ok) {
        const teamJson = await teamRes.json();
        if (teamJson.success && Array.isArray(teamJson.data)) {
          setMembers(teamJson.data);
        }
      }

      if (rolesRes && rolesRes.ok) {
        const rolesJson = await rolesRes.json();
        if (rolesJson.success && Array.isArray(rolesJson.data)) {
          setRoles(rolesJson.data);
        }
      }
    } catch {
      // silent fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Is current logged in user a super admin?
  const isSuperAdmin = session?.role === 'super-admin';

  // Handle Invite Submit
  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError('');
    setCreatedTempPass(null);

    try {
      const res = await fetch('/api/admin/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm)
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to invite team member.');
      }

      const newMember = json.data;
      setMembers((prev) => [newMember, ...prev]);

      if (newMember.temporaryPassword) {
        setCreatedTempPass({ email: newMember.email, password: newMember.temporaryPassword });
      } else {
        setInviteModalOpen(false);
        setInviteForm({ name: '', email: '', role: 'support', password: '' });
        setStatusMessage({ type: 'success', text: `Invited ${newMember.name} successfully.` });
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (err) {
      setInviteError(err.message);
    }
  };

  // Handle Edit Member
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingMember) return;
    setEditError('');

    try {
      const res = await fetch(`/api/admin/team/${editingMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to update team member.');
      }

      const updated = json.data;
      setMembers((prev) => prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)));
      setEditingMember(null);
      setStatusMessage({ type: 'success', text: `Updated ${updated.name} successfully.` });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      setEditError(err.message);
    }
  };

  // Handle Toggle Active/Inactive
  const handleToggleActive = async (member) => {
    const isSelf = member.id === session?.sub || member.id === session?._id;
    if (isSelf) {
      setStatusMessage({ type: 'error', text: 'You cannot deactivate your own account.' });
      setTimeout(() => setStatusMessage(null), 4000);
      return;
    }

    try {
      const nextActive = !member.active;
      const res = await fetch(`/api/admin/team/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: nextActive })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to update member status.');
      }

      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, active: nextActive } : m))
      );
      setStatusMessage({
        type: 'success',
        text: `${member.name} is now ${nextActive ? 'Active' : 'Inactive'}.`
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Handle Force Logout
  const handleForceLogout = async (member) => {
    try {
      const res = await fetch(`/api/admin/team/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceLogout: true })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to revoke sessions.');
      }

      setStatusMessage({
        type: 'success',
        text: `Active sessions for ${member.name} were successfully revoked.`
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Handle Password Reset
  const handlePasswordResetSubmit = async (e) => {
    e.preventDefault();
    if (!passwordResetMember) return;
    setPasswordError('');

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long.');
      return;
    }

    try {
      const res = await fetch(`/api/admin/team/${passwordResetMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to reset password.');
      }

      setPasswordResetMember(null);
      setNewPassword('');
      setStatusMessage({
        type: 'success',
        text: `Password for ${passwordResetMember.name} has been reset.`
      });
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      setPasswordError(err.message);
    }
  };

  // Handle Delete Member
  const handleDeleteMember = async () => {
    if (!deleteTarget) return;

    try {
      const res = await fetch(`/api/admin/team/${deleteTarget.id}`, {
        method: 'DELETE'
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to delete team member.');
      }

      setMembers((prev) => prev.filter((m) => m.id !== deleteTarget.id));
      setStatusMessage({
        type: 'success',
        text: `Removed ${deleteTarget.name} from team.`
      });
      setDeleteTarget(null);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
      setDeleteTarget(null);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  return (
    <section className={styles.card}>
      <div className={styles.cardHead} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2>Admin Console Team Members</h2>
          <p>
            Manage active operators, support executives, dispatch coordinators, and administrators.
          </p>
        </div>
        <button
          type="button"
          className={styles.saveBtn}
          onClick={() => {
            setCreatedTempPass(null);
            setInviteModalOpen(true);
          }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
        >
          <Icon name="plus" size={14} />
          <span>Invite Team Member</span>
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

      {/* Team Members Table */}
      <div style={{ marginTop: 20, overflowX: 'auto' }}>
        <table className={styles.teamTable}>
          <thead>
            <tr>
              <th>Member Name</th>
              <th>Email Address</th>
              <th>Assigned Role</th>
              <th>Status</th>
              <th>Last Active</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px 0', color: '#888' }}>
                  Loading team members…
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '30px 0', color: '#888' }}>
                  No team members found.
                </td>
              </tr>
            ) : (
              members.map((m) => {
                const isSelf = m.id === session?.sub || m.id === session?._id;
                const isMemberSuperAdmin = m.role === 'super-admin';
                const canModifyThisMember = isSuperAdmin || (!isMemberSuperAdmin && !isSelf);

                return (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className={styles.memberAvatar}>
                          {(m.name || 'Admin').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <b style={{ color: 'var(--rf-forest-deep)' }}>{m.name}</b>
                          {isSelf && (
                            <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--rf-gold-600)', fontWeight: 800 }}>
                              (You)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ color: '#556258' }}>{m.email}</td>
                    <td>
                      <Badge variant={m.role === 'super-admin' ? 'success' : m.role === 'admin' ? 'neutral' : 'info'}>
                        {m.role}
                      </Badge>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleToggleActive(m)}
                        disabled={isSelf || (!isSuperAdmin && isMemberSuperAdmin)}
                        className={styles.statusPill}
                        style={{
                          background: m.active ? '#eaf5ec' : '#fdeeea',
                          color: m.active ? '#1b5e20' : '#b71c1c',
                          border: 'none',
                          cursor: isSelf || (!isSuperAdmin && isMemberSuperAdmin) ? 'default' : 'pointer'
                        }}
                        title={isSelf ? 'Cannot deactivate self' : 'Click to toggle status'}
                      >
                        {m.active ? '● Active' : '○ Inactive'}
                      </button>
                    </td>
                    <td style={{ color: '#777', fontSize: 12 }}>
                      {m.lastLoginAt ? formatDateDDMMYYYY(m.lastLoginAt) : 'Pending Invite'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        {canModifyThisMember && (
                          <button
                            type="button"
                            className={styles.permMiniBtn}
                            onClick={() => {
                              setEditingMember(m);
                              setEditForm({ name: m.name, role: m.role, active: m.active });
                              setEditError('');
                            }}
                            title="Edit Role / Name"
                          >
                            Edit
                          </button>
                        )}

                        {canModifyThisMember && (
                          <button
                            type="button"
                            className={styles.permMiniBtn}
                            onClick={() => {
                              setPasswordResetMember(m);
                              setNewPassword('');
                              setPasswordError('');
                            }}
                            title="Reset Password"
                          >
                            Password
                          </button>
                        )}

                        {canModifyThisMember && (
                          <button
                            type="button"
                            className={styles.permMiniBtn}
                            onClick={() => handleForceLogout(m)}
                            title="Revoke active sessions"
                          >
                            Logout
                          </button>
                        )}

                        {!isSelf && canModifyThisMember && (
                          <button
                            type="button"
                            className={styles.permMiniBtn}
                            onClick={() => setDeleteTarget(m)}
                            style={{ color: '#c62828', borderColor: '#ffcdd2' }}
                            title="Remove member"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Invite Member Modal */}
      {inviteModalOpen && (
        <Modal
          isOpen={inviteModalOpen}
          onClose={() => setInviteModalOpen(false)}
          title="Invite Admin Team Member"
        >
          {createdTempPass ? (
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ padding: 14, background: '#eaf5ec', border: '1px solid #c8e6c9', borderRadius: 10, color: '#1b5e20' }}>
                <b style={{ display: 'block', marginBottom: 4 }}>Team Member Created Successfully!</b>
                <p style={{ margin: 0, fontSize: 12 }}>
                  Share these credentials securely with the invited operator:
                </p>
              </div>

              <div style={{ background: '#f8faf8', padding: 14, borderRadius: 10, border: '1px solid var(--rf-line)', display: 'grid', gap: 6, fontSize: 13 }}>
                <div><strong>Email:</strong> {createdTempPass.email}</div>
                <div><strong>Temporary Password:</strong> <code style={{ background: '#fff', padding: '2px 8px', borderRadius: 4, border: '1px solid #ccc', fontWeight: 'bold' }}>{createdTempPass.password}</code></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  className={styles.saveBtn}
                  onClick={() => {
                    setCreatedTempPass(null);
                    setInviteModalOpen(false);
                    setInviteForm({ name: '', email: '', role: 'support', password: '' });
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleInvite} style={{ display: 'grid', gap: 16 }}>
              {inviteError && (
                <div style={{ padding: '8px 12px', background: '#fdeeea', color: '#b71c1c', borderRadius: 8, fontSize: 12 }}>
                  {inviteError}
                </div>
              )}

              <div className={styles.field}>
                <label>Full Name</label>
                <input
                  className={styles.input}
                  value={inviteForm.name}
                  onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                  placeholder="e.g. Vikram Mehta"
                  required
                />
              </div>

              <div className={styles.field}>
                <label>Email Address</label>
                <input
                  type="email"
                  className={styles.input}
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="e.g. vikram@rfriddhy.com"
                  required
                />
              </div>

              <div className={styles.field}>
                <label>Assigned Operational Role</label>
                <select
                  className={styles.select}
                  value={inviteForm.role}
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                >
                  {roles.length > 0 ? (
                    roles.map((r) => {
                      if (r.key === 'super-admin' && !isSuperAdmin) return null;
                      return (
                        <option key={r.key} value={r.key}>
                          {r.label} ({r.key})
                        </option>
                      );
                    })
                  ) : (
                    <>
                      <option value="support">Customer Support (Inquiries, Warranties)</option>
                      <option value="warehouse">Warehouse Operator (Inventory, Orders)</option>
                      <option value="marketing">Marketing Specialist (Banners, Merchandising)</option>
                      <option value="finance">Finance Accountant (Invoices, Tax Reports)</option>
                      <option value="admin">Operations Admin (Full System Operations)</option>
                      {isSuperAdmin && <option value="super-admin">Super Admin (System Owner)</option>}
                    </>
                  )}
                </select>
              </div>

              <div className={styles.field}>
                <label>Initial Password (Optional)</label>
                <input
                  type="text"
                  className={styles.input}
                  value={inviteForm.password}
                  onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })}
                  placeholder="Leave empty to auto-generate temporary password"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setInviteModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn}>
                  Send Invitation
                </button>
              </div>
            </form>
          )}
        </Modal>
      )}

      {/* Edit Member Modal */}
      {editingMember && (
        <Modal
          isOpen={Boolean(editingMember)}
          onClose={() => setEditingMember(null)}
          title={`Edit Member: ${editingMember.name}`}
        >
          <form onSubmit={handleEditSubmit} style={{ display: 'grid', gap: 16 }}>
            {editError && (
              <div style={{ padding: '8px 12px', background: '#fdeeea', color: '#b71c1c', borderRadius: 8, fontSize: 12 }}>
                {editError}
              </div>
            )}

            <div className={styles.field}>
              <label>Full Name</label>
              <input
                className={styles.input}
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                required
              />
            </div>

            <div className={styles.field}>
              <label>Assigned Role</label>
              <select
                className={styles.select}
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              >
                {roles.map((r) => {
                  if (r.key === 'super-admin' && !isSuperAdmin) return null;
                  return (
                    <option key={r.key} value={r.key}>
                      {r.label} ({r.key})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className={styles.field}>
              <label>Account Status</label>
              <select
                className={styles.select}
                value={editForm.active ? 'true' : 'false'}
                onChange={(e) => setEditForm({ ...editForm, active: e.target.value === 'true' })}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => setEditingMember(null)}
              >
                Cancel
              </button>
              <button type="submit" className={styles.saveBtn}>
                Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Reset Password Modal */}
      {passwordResetMember && (
        <Modal
          isOpen={Boolean(passwordResetMember)}
          onClose={() => setPasswordResetMember(null)}
          title={`Reset Password for ${passwordResetMember.name}`}
        >
          <form onSubmit={handlePasswordResetSubmit} style={{ display: 'grid', gap: 16 }}>
            {passwordError && (
              <div style={{ padding: '8px 12px', background: '#fdeeea', color: '#b71c1c', borderRadius: 8, fontSize: 12 }}>
                {passwordError}
              </div>
            )}

            <p style={{ margin: 0, fontSize: 13, color: '#556258' }}>
              Setting a new password will immediately revoke any active login sessions for <strong>{passwordResetMember.email}</strong>.
            </p>

            <div className={styles.field}>
              <label>New Password</label>
              <input
                type="password"
                className={styles.input}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters…"
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12 }}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => setPasswordResetMember(null)}
              >
                Cancel
              </button>
              <button type="submit" className={styles.saveBtn}>
                Update Password
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirm Dialog: Delete Team Member */}
      {deleteTarget && (
        <ConfirmDialog
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteMember}
          title={`Remove ${deleteTarget.name}?`}
          message={`Are you sure you want to permanently revoke admin access for ${deleteTarget.name} (${deleteTarget.email})?`}
          confirmLabel="Remove Member"
          variant="danger"
        />
      )}
    </section>
  );
}
