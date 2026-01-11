import type { APIRoute } from 'astro';
import { SESSION_COOKIE_NAME } from '../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async ({ cookies, redirect }) => {
  // Clear session cookie
  cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
  cookies.delete('authenticated', { path: '/' });

  // Redirect to home page
  return redirect('/');
};

