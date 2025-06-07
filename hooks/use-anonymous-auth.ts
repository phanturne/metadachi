import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

export function useAnonymousAuth() {
  const { user, signInAnonymously } = useAuth();

  const ensureAuthenticated = async () => {
    if (user) {
      return { user, isGuest: false };
    }

    try {
      const newUser = await signInAnonymously();
      toast.info(
        "We've created a temporary guest account to save your content. Add an email to keep it forever!",
        {
          duration: 5000,
        }
      );
      return { user: newUser, isGuest: true };
    } catch (error) {
      console.error('Error creating guest account:', error);
      toast.error('Failed to create guest account. Please try again.');
      throw error;
    }
  };

  return {
    ensureAuthenticated,
    isGuest: !user?.email,
  };
}
