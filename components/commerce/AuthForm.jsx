'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import styles from './AuthForm.module.css';

export default function AuthForm({ admin = false }) {
  const router = useRouter();
  // Views: 'form' | 'forgot_email' | 'forgot_otp'
  const [authView, setAuthView] = useState('form');
  const [mode, setMode] = useState('login');

  // Login / Register state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot password OTP flow state
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Status & messages
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  // Handle URL errors and redirect hints
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlError = params.get('error');
      if (urlError) {
        setMessage(decodeURIComponent(urlError));
      }
      const redirectParam = params.get('redirect');
      if (redirectParam && !admin) {
        if (redirectParam.includes('track-order')) {
          setInfoMessage('Please sign in to track your order and shipment.');
        } else {
          setInfoMessage('Please sign in to save items to your bag and wishlist.');
        }
      }
    }
  }, [admin]);

  // OTP resend countdown ticker
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCountdown]);

  // Handle Standard Sign-In or Sign-Up
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    setSuccessMessage('');
    setInfoMessage('');

    try {
      const endpoint = admin
        ? '/api/auth/admin/login'
        : mode === 'register'
        ? '/api/auth/register'
        : '/api/auth/login';

      const payload =
        mode === 'register' && !admin
          ? { name, phone, email, password }
          : { email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const json = await response.json();
      if (!response.ok || !json.success) {
        throw new Error(json.error?.message || 'Unable to sign in.');
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('rf-auth-change'));
      }

      const params = new URLSearchParams(window.location.search);
      const redirectUrl = params.get('redirect');
      const safeRedirect = redirectUrl && redirectUrl.startsWith('/') && !redirectUrl.startsWith('//') ? redirectUrl : '/account';

      router.push(admin ? '/admin' : safeRedirect);
      router.refresh();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  // Handle Google OAuth Sign-In
  const handleGoogleSignIn = () => {
    setMessage('');
    setInfoMessage('');

    if (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      const redirectUri = `${window.location.origin}/api/auth/google/callback`;
      const scope = encodeURIComponent('email profile');
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
    } else {
      setInfoMessage(
        'Google OAuth Sign-In is enabled in the UI. Connect GOOGLE_CLIENT_ID in your configuration for live Google authorization.'
      );
    }
  };

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!forgotEmail) {
      setMessage('Please enter your email address to receive an OTP.');
      return;
    }
    setBusy(true);
    setMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, userType: admin ? 'admin' : 'user' })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to send OTP.');
      }
      setSuccessMessage(data.data?.message || 'A 6-digit OTP has been sent to your email.');
      setAuthView('forgot_otp');
      setOtpCountdown(60);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  // Step 2: Verify OTP & Reset Password
  const handleResetPassword = async (e) => {
    e?.preventDefault();
    if (!otp || otp.length < 6) {
      setMessage('Please enter the 6-digit OTP received on your email.');
      return;
    }
    if (!newPassword) {
      setMessage('Please enter a new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setBusy(true);
    setMessage('');
    setSuccessMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail,
          otp: otp.trim(),
          newPassword,
          userType: admin ? 'admin' : 'user'
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to reset password.');
      }
      setSuccessMessage('Password reset successfully! You can now sign in with your new password.');
      setEmail(forgotEmail);
      setPassword('');
      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setAuthView('form');
      setMode('login');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      {/* Success notification */}
      {successMessage && (
        <div className={styles.successAlert} role="status">
          <Icon name="check" size={14} /> {successMessage}
        </div>
      )}

      {/* Error notification */}
      {message && (
        <p className={styles.error} role="alert">
          <Icon name="close" size={14} /> {message}
        </p>
      )}

      {/* Informative notification */}
      {infoMessage && (
        <div className={styles.info} role="status">
          <Icon name="info" size={14} /> {infoMessage}
        </div>
      )}

      {/* VIEW 1: Standard Sign In / Sign Up Form */}
      {authView === 'form' && (
        <form className={styles.form} onSubmit={submit}>
          {/* Continue with Google button — FOR USER ONLY */}
          {!admin && (
            <div className={styles.socialAuthContainer}>
              <button
                type="button"
                className={styles.googleBtn}
                onClick={handleGoogleSignIn}
                disabled={busy}
              >
                <svg className={styles.googleIcon} width="18" height="18" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className={styles.divider}>
                <span>{mode === 'register' ? 'or register with email' : 'or sign in with email'}</span>
              </div>
            </div>
          )}

          {!admin && mode === 'register' && (
            <>
              <label className={styles.label}>
                <span>Your name</span>
                <input
                  required
                  minLength={2}
                  autoComplete="name"
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.input}
                />
              </label>
              <label className={styles.label}>
                <span>Mobile number</span>
                <input
                  required
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                  placeholder="10-digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className={styles.input}
                />
              </label>
            </>
          )}

          <label className={styles.label}>
            <span>Email address</span>
            <input
              required
              type="email"
              autoComplete="username"
              placeholder="e.g. name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
            />
          </label>

          <div className={styles.passwordFieldGroup}>
            <label className={styles.label}>
              <span>Password</span>
              <div className={styles.passwordWrapper}>
                <input
                  required
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={styles.passwordInput}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                </button>
              </div>
            </label>

            {mode === 'login' && (
              <div className={styles.forgotRowBelow}>
                <button
                  type="button"
                  className={styles.forgotLink}
                  onClick={() => {
                    setForgotEmail(email);
                    setMessage('');
                    setSuccessMessage('');
                    setAuthView('forgot_email');
                  }}
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>

          <Button type="submit" size="lg" disabled={busy}>
            {busy ? 'Please wait…' : admin ? 'Open admin dashboard' : mode === 'register' ? 'Create account' : 'Sign in'}{' '}
            <Icon name="arrow" size={16} />
          </Button>

          {!admin && (
            <button
              type="button"
              className={styles.switch}
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setMessage('');
                setSuccessMessage('');
                setInfoMessage('');
              }}
            >
              {mode === 'login' ? 'New to Riddhy? Create an account' : 'Already have an account? Sign in'}
            </button>
          )}

        </form>
      )}

      {/* VIEW 2: Forgot Password - Request OTP */}
      {authView === 'forgot_email' && (
        <form className={styles.form} onSubmit={handleSendOtp}>
          <div className={styles.forgotHeader}>
            <h3>Reset Password</h3>
            <p>
              Enter your {admin ? 'administrator' : 'account'} email address. We will send a 6-digit OTP code to reset your password.
            </p>
          </div>

          <label className={styles.label}>
            <span>Registered Email Address</span>
            <input
              required
              type="email"
              autoComplete="email"
              placeholder="e.g. name@example.com"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className={styles.input}
            />
          </label>

          <Button type="submit" size="lg" disabled={busy || !forgotEmail}>
            {busy ? 'Sending OTP to email…' : 'Send Verification OTP'} <Icon name="arrow" size={16} />
          </Button>

          <button
            type="button"
            className={styles.switch}
            onClick={() => {
              setAuthView('form');
              setMessage('');
              setSuccessMessage('');
            }}
          >
            <Icon name="arrowLeft" size={14} /> Back to sign in
          </button>
        </form>
      )}

      {/* VIEW 3: Forgot Password - Enter OTP & Set New Password */}
      {authView === 'forgot_otp' && (
        <form className={styles.form} onSubmit={handleResetPassword}>
          <div className={styles.forgotHeader}>
            <h3>Verify Code & Set Password</h3>
            <p>
              We sent a 6-digit verification code to <b>{forgotEmail}</b>. Please check your inbox and spam folder.
            </p>
          </div>

          <label className={styles.label}>
            <span>6-Digit Verification Code (OTP)</span>
            <input
              required
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className={styles.otpInput}
            />
          </label>

          <label className={styles.label}>
            <span>New Password</span>
            <div className={styles.passwordWrapper}>
              <input
                required
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={styles.passwordInput}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowNewPassword((prev) => !prev)}
                aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                title={showNewPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showNewPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
              </button>
            </div>
          </label>

          <label className={styles.label}>
            <span>Confirm New Password</span>
            <input
              required
              type={showNewPassword ? 'text' : 'password'}
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.passwordInput}
            />
          </label>

          <Button
            type="submit"
            size="lg"
            disabled={busy || otp.length < 6 || !newPassword || !confirmPassword}
          >
            {busy ? 'Verifying & resetting…' : 'Reset Password & Sign In'} <Icon name="arrow" size={16} />
          </Button>

          <div className={styles.resendRow}>
            {otpCountdown > 0 ? (
              <span className={styles.countdownText}>Resend code in {otpCountdown}s</span>
            ) : (
              <button
                type="button"
                className={styles.resendBtn}
                disabled={busy}
                onClick={handleSendOtp}
              >
                Didn't receive the email? Resend OTP
              </button>
            )}
          </div>

          <button
            type="button"
            className={styles.switch}
            onClick={() => {
              setAuthView('form');
              setMessage('');
              setSuccessMessage('');
            }}
          >
            <Icon name="arrowLeft" size={14} /> Back to sign in
          </button>
        </form>
      )}
    </div>
  );
}
