import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/index';
import { signSession, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Handle cancellation or authorization failure from Google
  if (error || !code) {
    const errorMsg = error ? encodeURIComponent(`Google Sign-In failed: ${error}`) : 'cancelled';
    return NextResponse.redirect(new URL(`/account?error=${errorMsg}`, origin));
  }

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${origin}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    console.error('[Google OAuth] Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in environment.');
    return NextResponse.redirect(
      new URL('/account?error=Google+OAuth+credentials+not+configured', origin)
    );
  }

  try {
    // 1. Exchange authorization code for Google access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error('[Google OAuth] Token exchange error response:', tokenData);
      return NextResponse.redirect(
        new URL(
          `/account?error=${encodeURIComponent(
            tokenData.error_description || tokenData.error || 'Failed to exchange authorization code'
          )}`,
          origin
        )
      );
    }

    // 2. Fetch authenticated user profile from Google UserInfo endpoint
    const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`
      }
    });

    const googleProfile = await userinfoResponse.json();

    if (!userinfoResponse.ok || !googleProfile.email) {
      console.error('[Google OAuth] Failed to fetch user profile:', googleProfile);
      return NextResponse.redirect(
        new URL('/account?error=Failed+to+retrieve+Google+user+profile', origin)
      );
    }

    // 3. Connect to MongoDB and find or create the customer user
    await connectDB();
    const email = googleProfile.email.toLowerCase().trim();
    let user = await User.findOne({ email });

    if (!user) {
      // Create a new customer profile for first-time Google sign-in
      const name =
        googleProfile.name ||
        [googleProfile.given_name, googleProfile.family_name].filter(Boolean).join(' ') ||
        email.split('@')[0];

      user = await User.create({
        name,
        email,
        role: 'customer',
        active: true,
        preferences: {
          avatar: googleProfile.picture || '',
          authProvider: 'google',
          googleSub: googleProfile.sub
        }
      });
    } else {
      // Existing user: ensure active status and attach avatar if missing
      if (!user.active) {
        user.active = true;
      }
      if (!user.preferences?.avatar && googleProfile.picture) {
        user.preferences = {
          ...(user.preferences || {}),
          avatar: googleProfile.picture
        };
      }
      await user.save();
    }

    // 4. Issue session JWT cookie for the authenticated user
    const token = await signSession(user);
    const destination = new URL('/account', origin);
    const response = NextResponse.redirect(destination);

    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
    return response;
  } catch (err) {
    console.error('[Google OAuth] Unexpected callback error:', err);
    return NextResponse.redirect(
      new URL(`/account?error=${encodeURIComponent(err.message || 'Authentication error')}`, origin)
    );
  }
}
