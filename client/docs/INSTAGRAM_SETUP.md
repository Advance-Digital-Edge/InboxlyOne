# Instagram Integration Setup Guide

## Overview
This guide will help you set up Instagram integration for your InboxlyOne application. Instagram messaging has different API requirements compared to Facebook Messenger, and requires specific app configuration and permissions.

## Prerequisites
- Meta for Developers account
- App configured with Facebook/Meta products
- Business verification (for Instagram Messaging API)

## Step 1: Meta Developer Console Setup

### 1.1 Access Your App
1. Go to [Meta for Developers](https://developers.facebook.com/apps)
2. Select your existing app or create a new one
3. Ensure your app is set to "Live" mode (not Development)

### 1.2 Add Instagram Products

#### Instagram Basic Display API
1. In your app dashboard, click "Add Product"
2. Find "Instagram Basic Display" and click "Set Up"
3. This allows users to authenticate and access their basic profile info

#### Instagram Messaging API (Required for full messaging)
1. Add "Instagram Messaging API" product
2. **Note**: This requires business verification and may not be available in all regions
3. This is needed for sending/receiving messages in Instagram Direct

### 1.3 Configure Instagram Basic Display
1. Go to Instagram Basic Display > Basic Display
2. Add a Valid OAuth Redirect URI:
   ```
   http://localhost:3000/api/instagram/callback
   https://yourdomain.com/api/instagram/callback
   ```
3. (Optional) Add Deauthorize and Data Deletion Request URLs

### 1.4 Configure Instagram Messaging API (if available)
1. Go to Instagram Messaging API > Configuration
2. Set up webhook URL for real-time message notifications:
   ```
   https://yourdomain.com/api/instagram/notifications
   ```
3. Subscribe to webhook events:
   - `messages` (incoming messages)
   - `messaging_postbacks` (button clicks)
   - `messaging_handovers` (conversation handovers)

## Step 2: Environment Variables

Add these environment variables to your `.env.local` file:

```env
# Instagram API Configuration
NEXT_PUBLIC_INSTAGRAM_APP_ID=your_instagram_app_id
NEXT_PUBLIC_INSTAGRAM_APP_SECRET=your_instagram_app_secret
NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI=http://localhost:3000/api/instagram/callback

# Instagram Webhook Verification (for notifications)
INSTAGRAM_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
```

### How to find these values:
1. **App ID**: In your Meta app dashboard, under "App Settings" > "Basic"
2. **App Secret**: In the same location (click "Show" to reveal)
3. **Redirect URI**: Must match exactly what you configured in step 1.3
4. **Webhook Verify Token**: You create this yourself - use a random string

## Step 3: Instagram App Review (For Production)

### 3.1 Required Permissions
For Instagram messaging, you'll need to request these permissions:
- `instagram_basic` (Basic Display API)
- `instagram_manage_messages` (Messaging API)

### 3.2 Business Verification
1. Complete Meta Business Verification process
2. This is required for Instagram Messaging API access
3. Provide business documents and information

### 3.3 App Review Process
1. Submit your app for review with Instagram permissions
2. Provide detailed use case description
3. Include privacy policy and terms of service
4. Show how you handle user data

## Step 4: Database Setup

Ensure your database has the required tables:

```sql
-- Already exists in your user_integrations table
-- Just ensure Instagram provider is supported

-- Optional: Create Instagram-specific tables for message storage
CREATE TABLE instagram_messages (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    integration_id UUID REFERENCES user_integrations(id),
    message_id VARCHAR NOT NULL,
    sender_id VARCHAR NOT NULL,
    recipient_id VARCHAR NOT NULL,
    message_text TEXT,
    timestamp TIMESTAMP WITH TIME ZONE,
    direction VARCHAR(20) CHECK (direction IN ('incoming', 'outgoing')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Step 5: Testing the Integration

### 5.1 Local Testing
1. Start your development server: `npm run dev`
2. Navigate to integrations page
3. Click "Connect" on Instagram card
4. Complete OAuth flow
5. Check that connection appears in UI

### 5.2 Test Message Fetching
1. Go to Instagram dashboard page
2. Should see placeholder message about messaging API requirements
3. Once you have Instagram Messaging API access, real messages will appear

## Limitations and Considerations

### Current Implementation Limitations
1. **Instagram Basic Display API** only provides:
   - User profile access
   - Media access
   - Basic authentication
   
2. **Instagram Messaging API** (requires business verification) provides:
   - Send/receive messages
   - Message read receipts
   - Rich media support
   - Webhook notifications

### Instagram API Restrictions
- Rate limiting: Be mindful of API call limits
- Business accounts: Some features require business/creator accounts
- Regional availability: Instagram Messaging API isn't available everywhere
- Webhook requirements: Must use HTTPS for production webhooks

## Upgrading to Full Messaging

To enable full messaging capabilities:

1. Complete business verification with Meta
2. Get approved for Instagram Messaging API
3. Update the API endpoints in:
   - `/api/instagram/messages/route.ts`
   - `/api/instagram/sendmessage/route.ts`
   - `/api/instagram/markread/route.ts`
4. Implement webhook handlers in `/api/instagram/notifications/route.ts`

## Troubleshooting

### Common Issues
1. **"Invalid OAuth redirect URI"**
   - Ensure the redirect URI in your Meta app exactly matches your environment variable
   - Check for trailing slashes or http vs https mismatches

2. **"Instagram Messaging API not available"**
   - This requires business verification and may not be available in your region
   - Consider using Instagram Basic Display API for basic profile integration

3. **Token expires quickly**
   - Instagram access tokens have different expiration times
   - Implement token refresh logic for long-lived tokens

### Debug Steps
1. Check browser network tab for API errors
2. Review server logs for authentication issues
3. Verify environment variables are loaded correctly
4. Test OAuth flow in incognito/private browsing mode

## Security Best Practices

1. **Environment Variables**: Never commit secrets to version control
2. **Token Storage**: Store access tokens securely in encrypted database
3. **Webhook Verification**: Always verify webhook signatures
4. **Rate Limiting**: Implement rate limiting for API calls
5. **User Consent**: Clearly explain what data you're accessing

## Next Steps

Once Instagram integration is set up:
1. Test the full OAuth flow
2. Implement message synchronization
3. Add real-time message notifications
4. Consider adding Instagram media integration
5. Monitor API usage and rate limits

For production deployment, ensure you have:
- Valid SSL certificate
- Proper domain configuration
- Business verification completed
- All required app review approvals
