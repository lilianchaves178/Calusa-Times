import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import { KeyRound } from 'lucide-react';

const ForgotPasswordPage = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      setSent(true);
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Please try again in a moment.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-700 rounded-full mb-4">
            <KeyRound size={32} className="text-yellow-300" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Reset Password</h1>
          <p className="text-gray-600">The Calusa Times</p>
        </div>

        {sent ? (
          <div className="text-center space-y-4" data-testid="forgot-password-sent">
            <p className="text-gray-700">
              If an account exists for <strong>{email}</strong>, a reset link has been sent.
              Check your inbox and follow the link within the next hour.
            </p>
            <Link to="/admin" className="text-blue-700 font-semibold hover:underline">
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@calusaschool.org"
                required
                data-testid="forgot-password-email-input"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-700 text-white hover:bg-blue-800"
              disabled={loading}
              data-testid="forgot-password-submit"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <div className="text-center text-sm">
              <Link to="/admin" className="text-blue-700 hover:underline">
                Back to login
              </Link>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;
