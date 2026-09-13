import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  CheckSquare,
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

export const LoginView = () => {
  const { login, demoAccounts, quickSwitch } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [role, setRole] = useState('employee');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        // Register API call
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, department, role }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed');
        // Auto login with new token
        localStorage.setItem('taskflow_token', data.token);
        localStorage.setItem('taskflow_user', JSON.stringify(data.user));
        window.location.reload();
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (demoEmail) => {
    setError('');
    setLoading(true);
    try {
      await quickSwitch(demoEmail);
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.15) 0%, var(--bg-base) 70%)',
      padding: '2rem 1rem',
    }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '54px',
            height: '54px',
            borderRadius: '16px',
            background: 'var(--primary-gradient)',
            boxShadow: '0 8px 25px var(--primary-glow)',
            color: '#fff',
            marginBottom: '1rem',
          }}>
            <CheckSquare size={30} strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            TaskFlow <span style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Pro</span>
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Enterprise Task Management & Role-Based Workflow System
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-card" style={{ padding: '2rem', borderRadius: 'var(--radius-xl)' }}>
          {/* Sign In / Register Tabs */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-surface-elevated)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            border: '1px solid var(--border-subtle)',
          }}>
            <button
              type="button"
              className={`btn btn-sm ${!isRegister ? 'btn-primary' : 'btn-ghost'}`}
              style={{ flex: 1, padding: '0.5rem' }}
              onClick={() => {
                setIsRegister(false);
                setError('');
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`btn btn-sm ${isRegister ? 'btn-primary' : 'btn-ghost'}`}
              style={{ flex: 1, padding: '0.5rem' }}
              onClick={() => {
                setIsRegister(true);
                setError('');
              }}
            >
              Create Account
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.825rem',
              marginBottom: '1.25rem',
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      className="input-field"
                      style={{ paddingLeft: '38px' }}
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group">
                    <label className="input-label">Role</label>
                    <select
                      className="select-field"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Admin / Manager</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Department</label>
                    <select
                      className="select-field"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="Product">Product</option>
                      <option value="DevOps">DevOps</option>
                      <option value="Marketing">Marketing</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="input-field"
                  style={{ paddingLeft: '38px' }}
                  placeholder="name@taskflow.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  style={{ paddingLeft: '38px', paddingRight: '38px' }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '10px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.75rem', padding: '0.75rem' }}
              disabled={loading}
            >
              <span>{loading ? 'Processing...' : isRegister ? 'Create Account' : 'Sign In'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            margin: '1.75rem 0 1.25rem',
            color: 'var(--text-muted)',
            fontSize: '0.75rem',
          }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
            <span>OR INSTANT 1-CLICK DEMO LOGIN</span>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
          </div>

          {/* Quick Demo Login Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', padding: '0.65rem 1rem' }}
              onClick={() => handleDemoLogin('admin@taskflow.io')}
              disabled={loading}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.1rem' }}>👑</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700 }}>Sarah Connor</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Admin • Director of Engineering</div>
                </div>
              </div>
              <span className="badge role-admin">Admin</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', padding: '0.65rem 1rem' }}
              onClick={() => handleDemoLogin('alex@taskflow.io')}
              disabled={loading}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.1rem' }}>💼</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700 }}>Alex Rivera</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Employee • Senior Full-Stack Engineer</div>
                </div>
              </div>
              <span className="badge role-employee">Employee</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', padding: '0.65rem 1rem' }}
              onClick={() => handleDemoLogin('elena@taskflow.io')}
              disabled={loading}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.1rem' }}>🎨</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700 }}>Elena Rostova</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Employee • Lead UI/UX Designer</div>
                </div>
              </div>
              <span className="badge role-employee">Employee</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', padding: '0.65rem 1rem' }}
              onClick={() => handleDemoLogin('marcus@taskflow.io')}
              disabled={loading}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '1.1rem' }}>⚡</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '0.825rem', fontWeight: 700 }}>Marcus Vance</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Employee • DevOps & SRE</div>
                </div>
              </div>
              <span className="badge role-employee">Employee</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
