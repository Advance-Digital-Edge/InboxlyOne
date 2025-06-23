import { google } from "googleapis";
import { createClient } from "@/utils/supabase/server";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return new Response("No code provided", { status: 400 });
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // Exchange authorization code for tokens
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  // Get basic user info (OAuth2)
  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
  const userInfoResponse = await oauth2.userinfo.get();
  const userInfo = userInfoResponse.data;

  // Get current logged-in user in your app (from Supabase)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Not logged in" }), {
      status: 401,
    });
  }

  // Check if this Gmail email is already integrated for this user
  const { data: existingIntegration } = await supabase
    .from("user_integrations")
    .select("*")
    .eq("user_id", user.id)
    .eq("provider", "gmail")
    .contains("metadata", { email: userInfo.email })
    .single();

  // If already integrated, no need to create a new watch, just update tokens maybe
  if (existingIntegration) {
    // Optional: Update tokens and metadata if needed
    await supabase
      .from("user_integrations")
      .update({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      })
      .eq("id", existingIntegration.id);

    // Return early or continue based on your logic
    return new Response("Account already integrated", { status: 200 });
  }
  // If not integrated, create Gmail API client to fetch profile and set watch

  const gmail = google.gmail({ version: "v1", auth: oauth2Client });

  // Get Gmail profile to get historyId for syncing later
  const profile = await gmail.users.getProfile({ userId: "me" });
  const historyId = profile.data.historyId;

  // Set up Gmail push notifications (watch)
  const watchRes = await gmail.users.watch({
    userId: "me",
    requestBody: {
      labelIds: ["INBOX"],
      topicName: "projects/aquahabits/topics/messages",
    },
  });

  const watchExpiration = watchRes.data.expiration;

  // Save integration with tokens + Gmail watch info
  await supabase.from("user_integrations").upsert({
    user_id: user.id,
    provider: "gmail",
    external_account_id: userInfo.id, // Google user ID
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
    metadata: {
      email: userInfo.email,
      name: userInfo.name,
      picture: userInfo.picture,
      historyId,
      watchExpiration,
      lastMessageId: null,
    },
  });

  // Respond with script to close popup
  return new Response(
    `
  <html>
    <body>
      <script>
        if (window.opener) {
          window.opener.postMessage("gmail-connected", window.origin);
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
}
