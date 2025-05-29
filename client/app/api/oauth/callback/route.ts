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

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({
    auth: oauth2Client,
    version: "v2",
  });
  // Fetch user info from Google
  const userInfoResponse = await oauth2.userinfo.get();
  const userInfo = userInfoResponse.data;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Not logged in" }), {
      status: 401,
    });
  }

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
    },
  });


  // ✅ Redirect user back to your frontend (must be full URL or relative path)
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
