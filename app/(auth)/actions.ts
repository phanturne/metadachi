'use server';

import { ROUTES } from '@/lib/constants';
import { encodedRedirect } from '@/utils/navigation';
import { createClient } from '@/utils/supabase/server';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const signUpAction = async (formData: FormData) => {
  const email = formData.get('email')?.toString();
  const password = formData.get('password')?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get('origin');

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
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return encodedRedirect('error', ROUTES.LOGIN, error.message);
  }

  return redirect(ROUTES.HOME);
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get('email')?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get('origin');
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
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    'success',
    ROUTES.FORGOT_PASSWORD,
    'Check your email for a link to reset your password.'
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;

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

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    return encodedRedirect('error', ROUTES.RESET_PASSWORD, 'Password update failed');
  }

  return encodedRedirect('success', ROUTES.RESET_PASSWORD, 'Password updated');
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect(ROUTES.LOGIN);
};
