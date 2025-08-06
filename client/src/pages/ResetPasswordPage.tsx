import { useEffect, useState } from 'react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { toast } from 'sonner';

export default function ResetPasswordPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const checkPasswordReset = async () => {
      if (!user) {
        navigate('/sign-in');
        return;
      }

      try {
        const needsReset = user.unsafeMetadata?.needsPasswordReset === true;
        if (!needsReset) {
          navigate('/onboarding');
        }
      } catch (err) {
        toast.error('An error occurred while checking your account status');
      } finally {
        setLoading(false);
      }
    };

    checkPasswordReset();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFormSubmitting(true);

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      setFormSubmitting(false);
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      setFormSubmitting(false);
      return;
    }

    try {
      await user?.updatePassword({ newPassword });
      if (user) {
        await user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            needsPasswordReset: false,
            passwordHasBeenReset: true
          }
        });
      }      

      toast.success('Password updated successfully. Please sign in again.');
      await signOut();
      navigate('/sign-in');
    } catch (err) {
      toast.error('Failed to update password. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reset Your Password</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Please enter a new password for your account.
          </p>
        </div>

        {error && (
          <div className="p-4 text-red-700 bg-red-100 rounded-md dark:bg-red-900/30 dark:text-red-300">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 block w-full"
                placeholder="Enter your new password"
                minLength={8}
              />
            </div>

            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 block w-full"
                placeholder="Confirm your new password"
                minLength={8}
              />
            </div>
          </div>

          <div>
            <Button type="submit" className="w-full" disabled={formSubmitting}>
              {formSubmitting ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
