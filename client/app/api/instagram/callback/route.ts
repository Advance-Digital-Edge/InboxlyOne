import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

const IG_CLIENT_ID = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID!;
const IG_CLIENT_SECRET = process.env.NEXT_PUBLIC_INSTAGRAM_APP_SECRET!;
const IG_REDIRECT_URI = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI!;

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return new Response("No code provided", { status: 400 });
  }

  try {
    // Step 1: Exchange code for short-lived access token
    const tokenRes = await fetch(
      `https://api.instagram.com/oauth/access_token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: IG_CLIENT_ID,
          client_secret: IG_CLIENT_SECRET,
          grant_type: "authorization_code",
          redirect_uri: IG_REDIRECT_URI,
          code: code,
        }),
      }
    );

    const tokenData = await tokenRes.json();
    console.log("Token Data:", tokenData);

    if (!tokenData.access_token) {
      return new Response("Failed to exchange code", { status: 400 });
    }

    const shortLivedToken = tokenData.access_token;
    const userId = tokenData.user_id;

    // Step 2: Exchange short-lived token for long-lived token
    const longLivedTokenRes = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${IG_CLIENT_SECRET}&access_token=${shortLivedToken}`
    );

    const longLivedTokenData = await longLivedTokenRes.json();
    console.log("Long-lived Token Data:", longLivedTokenData);

    if (!longLivedTokenData.access_token) {
      return new Response("Failed to get long-lived token", { status: 400 });
    }

    const accessToken = longLivedTokenData.access_token;
    const expiresIn = longLivedTokenData.expires_in; // Usually 60 days

    // Step 3: Get user profile info
    const profileRes = await fetch(
      `https://graph.instagram.com/me?fields=id,username,account_type,media_count&access_token=${accessToken}`
    );
    const profile = await profileRes.json();

    if (!profile.id) {
      return new Response("Failed to fetch profile", { status: 400 });
    }

    console.log("Profile Data:", profile);

    // Step 4: Get current Supabase user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response("Supabase user not logged in", { status: 401 });
    }

    // Step 5: Check if integration already exists
    const { data: existingIntegration } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", "instagram")
      .eq("external_account_id", profile.id)
      .single();

    if (existingIntegration) {
      // Update tokens if needed
      await supabase
        .from("user_integrations")
        .update({
          access_token: accessToken,
          expires_at: new Date(Date.now() + expiresIn * 1000),
        })
        .eq("id", existingIntegration.id);

      return new Response("Instagram already integrated", { status: 200 });
    }

    // Step 6: Save to DB
    const { error } = await supabase.from("user_integrations").upsert({
      user_id: user.id,
      provider: "instagram",
      external_account_id: profile.id,
      access_token: accessToken,
      expires_at: new Date(Date.now() + expiresIn * 1000),
      metadata: {
        username: profile.username,
        account_type: profile.account_type,
        media_count: profile.media_count,
        ig_user_id: profile.id,
      },
    });

    if (error) {
      console.error("Error saving Instagram integration:", error);
      return new Response("Failed to save integration", { status: 500 });
    }

    // Return a success HTML response (for popup)
    return new Response(
      `
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage("instagram-connected", window.origin);
              window.close();
            } else {
              document.body.innerText = "Connected. Please close this window.";
            }
          </script>
        </body>
      </html>
    `,
      {
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  } catch (error) {
    console.error("Instagram OAuth error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
