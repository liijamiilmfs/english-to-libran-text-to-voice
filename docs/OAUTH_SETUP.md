# Google OAuth Setup Guide

## 🚀 Quick Setup

### 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://yourdomain.com/api/auth/callback/google` (production)

### 2. Environment Variables

Copy your Google OAuth credentials to your `.env.local` file:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Test the Integration

1. Start your development server: `npm run dev`
2. Visit `http://localhost:3000`
3. Click "Sign in with Google" in the top-right corner
4. Complete the OAuth flow

## 🔧 Features Included

- ✅ **Google OAuth Integration** - Secure authentication with Google
- ✅ **Session Management** - Persistent user sessions
- ✅ **User Profile Display** - Shows user name, email, and avatar
- ✅ **Custom Sign-in Page** - Branded authentication experience
- ✅ **Error Handling** - User-friendly error messages
- ✅ **Responsive Design** - Works on all devices

## 🛡️ Security Features

- JWT-based sessions
- Secure cookie handling
- CSRF protection
- OAuth 2.0 flow compliance

## 📱 User Experience

- **Unauthenticated users**: See "Sign in with Google" button
- **Authenticated users**: See profile picture, name, and "Sign out" button
- **Loading states**: Smooth transitions during authentication
- **Error handling**: Clear error messages for failed authentication

## 🔄 Next Steps

The OAuth integration is ready! You can now:

1. **Protect routes** - Add authentication guards to sensitive pages
2. **User-specific data** - Store user preferences and phrase collections
3. **Admin features** - Add role-based access control
4. **Analytics** - Track user usage patterns

## 🐛 Troubleshooting

**Common issues:**

1. **"Invalid redirect URI"** - Make sure the redirect URI in Google Console matches exactly
2. **"Client ID not found"** - Verify your environment variables are set correctly
3. **"NEXTAUTH_SECRET not set"** - Generate and set the secret key

**Debug mode:**
Add `NEXTAUTH_DEBUG=true` to your `.env.local` for detailed logs.
