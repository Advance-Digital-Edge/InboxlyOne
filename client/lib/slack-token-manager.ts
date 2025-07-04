import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface SlackTokenData {
  access_token: string;
  slack_user_id: string;
  refresh_token?: string | null;
}

/**
 * Gets a valid Slack token, refreshing if necessary
 * 
 * Slack tokens that start with 'xoxe.xoxp' are refreshed automatically by Slack
 * and can be used for longer periods without explicit refresh.
 * 
 * For tokens that don't have this prefix or return auth errors,
 * we'll use the refresh_token to get a new access_token.
 */
export async function getValidSlackToken(authUserId: string): Promise<SlackTokenData | null> {
  try {
    // Get token from slack_tokens table
    const { data: tokenRow, error } = await supabase
      .from('slack_tokens')
      .select('access_token, slack_user_id, refresh_token')
      .eq('auth_user_id', authUserId)
      .single();

    if (error || !tokenRow) {
      console.log('No Slack token found for user', authUserId);
      return null;
    }

    // First check if token is valid by making a simple API call
    const testResponse = await fetch('https://slack.com/api/auth.test', {
      headers: { Authorization: `Bearer ${tokenRow.access_token}` }
    });
    
    const testData = await testResponse.json();

    // If token is still valid, return it
    if (testData.ok) {
      return {
        access_token: tokenRow.access_token,
        slack_user_id: tokenRow.slack_user_id,
        refresh_token: tokenRow.refresh_token
      };
    } 
    
    // Token is invalid, attempt to refresh if we have a refresh token
    if (tokenRow.refresh_token) {
      console.log('Attempting to refresh Slack token');
      const newTokenData = await refreshSlackToken(tokenRow.refresh_token, authUserId, tokenRow.slack_user_id);
      if (newTokenData) {
        return newTokenData;
      }
    }

    console.log('Token invalid and no refresh token or refresh failed');
    return null;
  } catch (error) {
    console.error('Error getting valid Slack token:', error);
    return null;
  }
}

/**
 * Refreshes a Slack token using the refresh_token
 */
async function refreshSlackToken(refreshToken: string, authUserId: string, slackUserId: string): Promise<SlackTokenData | null> {
  try {
    // Slack token refresh endpoint
    const response = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      console.error('Slack token refresh failed:', data.error || 'Unknown error');
      return null;
    }

    // Extract the new tokens
    const newAccessToken = data.access_token;
    // Some OAuth providers return a new refresh token, others keep using the same one
    const newRefreshToken = data.refresh_token || refreshToken;

    // Update the tokens in slack_tokens table
    const { error: slackTokenError } = await supabase
      .from('slack_tokens')
      .update({
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        updated_at: new Date().toISOString()
      })
      .eq('auth_user_id', authUserId);

    if (slackTokenError) {
      console.error('Failed to update slack_tokens table:', slackTokenError);
    }

    // Also update the user_integrations table to keep them in sync
    const { error: integrationError } = await supabase
      .from('user_integrations')
      .update({
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', authUserId)
      .eq('provider', 'slack');

    if (integrationError) {
      console.error('Failed to update user_integrations table:', integrationError);
    }

    // Return the refreshed token data
    return {
      access_token: newAccessToken,
      slack_user_id: slackUserId, // Use the existing slack user ID from our database
      refresh_token: newRefreshToken
    };

  } catch (error) {
    console.error('Error in refreshSlackToken:', error);
    return null;
  }
}

/**
 * Updates the Slack OAuth URL to include the refresh_token scope
 */
export function getSlackOAuthUrl(userId: string, redirectUri: string): string {
  return `https://slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_CLIENT_ID}`
    + `&scope=channels:history,groups:history,im:history,mpim:history,channels:read,groups:read,im:read,mpim:read,users:read`
    + `&user_scope=channels:history,groups:history,im:history,mpim:history,im:read,mpim:read,chat:write,im:write,users:read`
    + `&redirect_uri=${redirectUri}/api/slack/oauth/callback`
    + `&state=${userId}`
    + `&force_scope=1`
    // Added for refresh token support
    + `&token_rotation=true`;
}
