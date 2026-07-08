import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import { Lock } from 'lucide-react';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast({
        title: "Password too short",
        description: "Use at least 8 characters.",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Make sure both fields are the same.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || 'Reset failed');
      }

      toast({
        title: "Password updated",
        description: "You can now log in with your new password.",
      });
      navigate('/admin');
    } catch (error) {
      toast({
        title: "Couldn't reset password",
        description: error.message || "The link may be invalid or expired.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8 text-center space-y-4">
          <h1 className="text-2xl font-black text-gray-900">Invalid Reset Link</h1>
          <p className="text-gray-600">This link is missing its reset token. Request a new one below.</p>
          <Link to="/admin/forgot-password" className="text-blue-700 font-semibold hover:underline">
            Request a new reset link
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-700 rounded-full mb-4">
            <Lock size={32} className="text-yellow-300" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Set New Password</h1>
          <p className="text-gray-600">The Calusa Times</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              data-testid="reset-password-new-input"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              required
              data-testid="reset-password-confirm-input"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-700 text-white hover:bg-blue-800"
            disabled={loading}
            data-testid="reset-password-submit"
          >
            {loading ? 'Saving...' : 'Save New Password'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
