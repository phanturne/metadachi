'use client';

import { ROUTES } from '@/lib/constants';
import { encodedRedirect } from '@/utils/navigation';
import { createClient } from '@/utils/supabase/client';

export const signUpAction = async (formData: FormData) => {
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();
  const supabase = createClient();
  const origin = window.location.origin;

  if (!email || !password) {
    return encodedRedirect('error', ROUTES.REGISTER, 'Email and password are required');
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    console.error(`${error.code} ${error.message}`);
    return encodedRedirect('error', ROUTES.REGISTER, error.message);
  } else {
    return encodedRedirect(
      'success',
      ROUTES.REGISTER,
      'Thanks for signing up! Please check your email for a verification link.'
    );
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect('error', ROUTES.LOGIN, error.message);
  }

  window.location.href = ROUTES.HOME;
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get('email')?.toString();
  const supabase = createClient();
  const origin = window.location.origin;
  const callbackUrl = formData.get('callbackUrl')?.toString();

  if (!email) {
    return encodedRedirect('error', ROUTES.FORGOT_PASSWORD, 'Email is required');
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=${ROUTES.RESET_PASSWORD}`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect('error', ROUTES.FORGOT_PASSWORD, 'Could not reset password');
  }

  if (callbackUrl) {
    window.location.href = callbackUrl;
    return;
  }

  return encodedRedirect(
    'success',
    ROUTES.FORGOT_PASSWORD,
    'Check your email for a link to reset your password.'
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = createClient();

  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  const token_hash = formData.get('token_hash') as string;

  if (!password || !confirmPassword) {
    return encodedRedirect(
      'error',
      ROUTES.RESET_PASSWORD,
      'Password and confirm password are required'
    );
  }

  if (password !== confirmPassword) {
    return encodedRedirect('error', ROUTES.RESET_PASSWORD, 'Passwords do not match');
  }

  if (!token_hash) {
    return encodedRedirect('error', ROUTES.FORGOT_PASSWORD, 'Invalid reset token');
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return encodedRedirect('error', ROUTES.RESET_PASSWORD, 'Password update failed');
  }

  return encodedRedirect(
    'success',
    ROUTES.LOGIN,
    'Password updated successfully. Please log in with your new password.'
  );
};

export const signOutAction = async () => {
  const supabase = createClient();
  await supabase.auth.signOut();
  window.location.href = ROUTES.LOGIN;
};

export const bindAccountAction = async (formData: FormData) => {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  const supabase = createClient();

  if (!email || !password || !confirmPassword) {
    return encodedRedirect(
      'error',
      ROUTES.BIND_ACCOUNT,
      'Email, password, and confirm password are required'
    );
  }

  if (password !== confirmPassword) {
    return encodedRedirect('error', ROUTES.BIND_ACCOUNT, 'Passwords do not match');
  }

  if (password.length < 6) {
    return encodedRedirect(
      'error',
      ROUTES.BIND_ACCOUNT,
      'Password must be at least 6 characters long'
    );
  }

  try {
    // Update both email and password in a single call
    const { error: updateError } = await supabase.auth.updateUser({
      email,
      password,
    });

    if (updateError) {
      return encodedRedirect('error', ROUTES.LOGIN, updateError.message);
    }

    // Account binding successful - sign out and redirect to login with success message
    await supabase.auth.signOut();

    // Use window.location.href instead of encodedRedirect to avoid NEXT_REDIRECT error
    window.location.href = `${ROUTES.LOGIN}?success=${encodeURIComponent('Account successfully bound! Please check your email for verification, then log in with your new credentials.')}`;
    return;
  } catch {
    return encodedRedirect('error', ROUTES.LOGIN, 'An unexpected error occurred');
  }
};
