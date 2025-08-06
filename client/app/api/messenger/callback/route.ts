import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

const FB_CLIENT_ID = process.env.NEXT_PUBLIC_MESSENGER_APP_ID!;
const FB_CLIENT_SECRET = process.env.NEXT_PUBLIC_META_APP_SECRET!;
const FB_REDIRECT_URI = process.env.NEXT_PUBLIC_MESSENGER_REDIRECT_URI!;

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return new Response("No code provided", { status: 400 });
  }

  // Step 1: Exchange code for access token
  const tokenRes = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${FB_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      FB_REDIRECT_URI
    )}&client_secret=${FB_CLIENT_SECRET}&code=${code}`
  );

  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    return new Response("Failed to exchange code", { status: 400 });
  }

  const accessToken = tokenData.access_token;

  // Step 2: Get user info
  const profileRes = await fetch(
    `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
  );
  const profile = await profileRes.json();

  if (!profile.id) {
    return new Response("Failed to fetch profile", { status: 400 });
  }

  // Step 3: Get current Supabase user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Supabase user Not logged in", { status: 401 });
  }

  // Step 4: Check if integration already exists
  const { data: existingIntegration } = await supabase
    .from("user_integrations")
    .select("*")
    .eq("user_id", user.id)
    .eq("provider", "facebook")
    .contains("metadata", { fb_id: profile.id })
    .single();

  if (existingIntegration) {
    // Update tokens if needed
    await supabase
      .from("user_integrations")
      .update({
        access_token: accessToken,
      })
      .eq("id", existingIntegration.id);

    return new Response("Facebook already integrated", { status: 200 });
  }

  // Save to DB
  const { data: integrationData, error: integrationError } = await supabase
    .from("user_integrations")
    .upsert({
      user_id: user.id,
      provider: "facebook",
      external_account_id: profile.id,
      access_token: accessToken,
      expires_at: new Date(Date.now() + tokenData.expires_in * 1000),
      metadata: {
        name: profile.name,
        email: profile.email,
        picture: profile.picture.data.url,
      },
    })
    .select()
    .single();

  if (integrationError) {
    console.log(integrationError);
    return new Response("Failed to save integration", { status: 500 });
  }

  // Step 5: (Optional) Get pages the user manages
  const pagesRes = await fetch(
    `https://graph.facebook.com/me/accounts?access_token=${accessToken}`
  );
  const pages = await pagesRes.json();

  if (!pagesRes.ok) {
    const error = await pagesRes.json();
    console.error("Error fetching pages:", error);
    return new Response("Failed to fetch Facebook pages", { status: 500 });
  }

  const html = `
  <html>
    <body>
      <h1>Popup loaded</h1>
      <script>
    if (window.opener) {
  console.log("Sending message to opener...");
  window.opener.postMessage({
    type: "messenger-pages",
    integrationId: "${integrationData.id}",
    userProfile: ${JSON.stringify(profile)},
    pages: ${JSON.stringify(pages.data || [])}
  }, "*");  // <---- allow any origin
  window.close();
} else {
  document.body.innerText = "Connected. Please close this window.";
}
      </script>
    </body>
  </html>
`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}
