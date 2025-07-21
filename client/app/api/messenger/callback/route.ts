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

  // Step 5: (Optional) Get pages the user manages
  const pagesRes = await fetch(
    `https://graph.facebook.com/me/accounts?access_token=${accessToken}`
  );
  const pages = await pagesRes.json();

  console.log(`pages`, pages.data);
  console.log("Is pages data array", Array.isArray(pages.data));

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
    return new Response("Failed to save integration", { status: 500 });
  }

  // Now save each page in facebook_pages table
  if (pages.data && Array.isArray(pages.data)) {
    for (const page of pages.data) {
      const { data: pageData, error: pageError } = await supabase
        .from("facebook_pages")
        .upsert({
          integration_id: integrationData.id, // link to user_integration
          user_id: user.id, // link to user
          page_id: page.id,
          page_name: page.name,
          access_token: page.access_token,
          category: page.category,
          tasks: page.tasks, // save as JSON array
          category_list: page.category_list, // save as JSON array if you want
        });
      console.log(pageData, pageError);
    }
  }

  // Return a success HTML response (for popup)
  return new Response(
    `
    <html>
      <body>
        <script>
          if (window.opener) {
            window.opener.postMessage("messenger-connected", window.origin);
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
