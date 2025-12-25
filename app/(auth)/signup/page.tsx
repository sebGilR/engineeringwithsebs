'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountName, setAccountName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          password_confirmation: confirmPassword,
          account_name: accountName
        }),
      });

      if (res.ok) {
        // According to plan: signup drops directly into authenticated session
        router.push('/dashboard');
      } else {
        const data = await res.json();
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-1 border border-border-1 rounded-lg p-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-semibold text-text-1 mb-2">
          Create Account
        </h1>
        <p className="text-sm text-text-3">
          Sign up to start writing and publishing.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-2 mb-2">
            Your Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 bg-surface-0 border border-border-1 rounded-md text-text-1 placeholder-text-3 focus:outline-none focus:ring-2 focus:ring-accent-1 focus:border-transparent transition-all"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="accountName" className="block text-sm font-medium text-text-2 mb-2">
            Blog Name
          </label>
          <input
            id="accountName"
            type="text"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            required
            className="w-full px-4 py-3 bg-surface-0 border border-border-1 rounded-md text-text-1 placeholder-text-3 focus:outline-none focus:ring-2 focus:ring-accent-1 focus:border-transparent transition-all"
            placeholder="My Blog"
          />
          <p className="mt-2 text-xs text-text-3">
            This will be your account/organization name
          </p>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-2 mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-surface-0 border border-border-1 rounded-md text-text-1 placeholder-text-3 focus:outline-none focus:ring-2 focus:ring-accent-1 focus:border-transparent transition-all"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-text-2 mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-4 py-3 bg-surface-0 border border-border-1 rounded-md text-text-1 placeholder-text-3 focus:outline-none focus:ring-2 focus:ring-accent-1 focus:border-transparent transition-all"
            placeholder="At least 8 characters"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-2 mb-2">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className="w-full px-4 py-3 bg-surface-0 border border-border-1 rounded-md text-text-1 placeholder-text-3 focus:outline-none focus:ring-2 focus:ring-accent-1 focus:border-transparent transition-all"
            placeholder="Confirm your password"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 bg-accent-1 text-white font-medium rounded-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-accent-1 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      <div className="mt-6 text-center space-y-3">
        <p className="text-sm text-text-3">
          Already have an account?{' '}
          <Link href="/login" className="text-accent-1 hover:underline font-medium">
            Sign in
          </Link>
        </p>
        <Link href="/" className="block text-sm text-text-3 hover:text-text-1">
          ← Back to home
        </Link>
      </div>
    </div>
  );
}
