import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import { Shield, Home } from 'lucide-react';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await response.json();
      
      // Store token and user info
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user.full_name}!`,
      });

      navigate('/admin/dashboard');
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid email or password",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center p-6">
      <Link
        to="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm font-semibold text-white/90 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors"
        data-testid="admin-login-home-button"
      >
        <Home size={16} />
        Home
      </Link>
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-700 rounded-full mb-4">
            <Shield size={32} className="text-yellow-300" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">Admin Login</h1>
          <p className="text-gray-600">The Calusa Times</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@calusaschool.org"
              required
              data-testid="admin-email-input"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              data-testid="admin-password-input"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-blue-700 text-white hover:bg-blue-800"
            disabled={loading}
            data-testid="admin-login-submit"
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>

          <div className="text-center text-sm">
            <Link to="/admin/forgot-password" className="text-blue-700 hover:underline">
              Forgot password?
            </Link>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Don't have an account? Contact an administrator.</p>
        </div>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
