import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

const IG_CLIENT_ID = process.env.NEXT_PUBLIC_MESSENGER_APP_ID!;
const IG_CLIENT_SECRET = process.env.NEXT_PUBLIC_META_APP_SECRET!;
const IG_REDIRECT_URI = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI!;

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return new Response("No code provided", { status: 400 });
  }

  try {
    // Step 1: Exchange code for access token using Facebook Login OAuth endpoint
    const tokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${IG_CLIENT_ID}&redirect_uri=${encodeURIComponent(
        IG_REDIRECT_URI
      )}&client_secret=${IG_CLIENT_SECRET}&code=${code}`
    );

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return new Response("Failed to exchange code", { status: 400 });
    }

    const accessToken = tokenData.access_token;
    const expiresIn = tokenData.expires_in; // Usually 60 days

    // Step 2: Get user profile info from Instagram Graph API
    const profileRes = await fetch(
      `https://graph.facebook.com/v19.0/me?fields=id,name,email&access_token=${accessToken}`
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
