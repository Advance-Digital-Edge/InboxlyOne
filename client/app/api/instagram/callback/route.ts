import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

const IG_CLIENT_ID = process.env.NEXT_PUBLIC_MESSENGER_APP_ID!;
const IG_CLIENT_SECRET = process.env.NEXT_PUBLIC_META_APP_SECRET!;
const IG_REDIRECT_URI = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI!;

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");

    console.log("=== INSTAGRAM OAUTH FLOW START ===");
    console.log("Step 1: Received authorization code:", code ? "✓ Present" : "✗ Missing");
    console.log("Step 1: Code length:", code?.length);

    if (!code) {
      console.log("❌ No authorization code provided");
      return new Response("No code provided", { status: 400 });
    }

    // Step 2: Exchange code for access token
    const tokenUrl = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${IG_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      IG_REDIRECT_URI
    )}&client_secret=${IG_CLIENT_SECRET}&code=${code}`;
    console.log("Step 2: Token exchange URL:", tokenUrl.replace(IG_CLIENT_SECRET, "***SECRET***"));

    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    console.log("Step 2: Token response status:", tokenRes.status);
    console.log("Step 2: Token response:", JSON.stringify(tokenData, null, 2));

    if (!tokenData.access_token) {
      console.log("❌ Failed to get access token");
      if (tokenData.error) {
        console.log("❌ Token error:", tokenData.error);
      }
      return new Response("Failed to exchange code", { status: 400 });
    }

    const accessToken = tokenData.access_token;
    const expiresIn = tokenData.expires_in;

    console.log("✓ Step 2: Access token received, length:", accessToken.length);
    console.log("✓ Step 2: Token expires in:", expiresIn, "seconds");

    // Step 3: Get user profile
    const profileUrl = `https://graph.facebook.com/v19.0/me?fields=id,name,email&access_token=${accessToken}`;
    console.log("Step 3: Fetching profile from:", profileUrl.replace(accessToken, "***TOKEN***"));

    const profileRes = await fetch(profileUrl);
    const profile = await profileRes.json();

    console.log("Step 3: Profile response status:", profileRes.status);
    console.log("Step 3: Profile data:", JSON.stringify(profile, null, 2));

    if (!profile.id) {
      console.log("❌ Failed to fetch user profile");
      return new Response("Failed to fetch profile", { status: 400 });
    }

    console.log("✓ Step 3: User profile fetched for:", profile.name, "ID:", profile.id);

    // Step 4: Try Business Manager approach first
    console.log("Step 4: Trying Business Manager pages access...");
    const businessUrl = `https://graph.facebook.com/v19.0/me/businesses?fields=pages{id,name,access_token,instagram_business_account}&access_token=${accessToken}`;
    console.log("Step 4: Business URL:", businessUrl.replace(accessToken, "***TOKEN***"));

    const businessRes = await fetch(businessUrl);
    const businessData = await businessRes.json();

    console.log("Step 4: Business response status:", businessRes.status);
    console.log("Step 4: Business response:", JSON.stringify(businessData, null, 2));

    let pagesData = { data: [] };

    // If business manager works, extract pages
    if (businessData.data && businessData.data.length > 0) {
      console.log("✓ Step 4: Found business data, trying to get pages directly...");

      // Use the specific business ID to get pages
      const businessId = businessData.data[0].id; // 437312366795180
      console.log("Step 4.1: Using business ID:", businessId);

      const businessPagesUrl = `https://graph.facebook.com/v19.0/${businessId}/pages?fields=id,name,access_token,instagram_business_account&access_token=${accessToken}`;
      console.log("Step 4.1: Business pages URL:", businessPagesUrl.replace(accessToken, "***TOKEN***"));

      const businessPagesRes = await fetch(businessPagesUrl);
      const businessPagesData = await businessPagesRes.json();

      console.log("Step 4.1: Business pages response status:", businessPagesRes.status);
      console.log("Step 4.1: Business pages response:", JSON.stringify(businessPagesData, null, 2));

      if (businessPagesData.data && businessPagesData.data.length > 0) {
        pagesData = businessPagesData;
        console.log("✓ Step 4.1: Extracted", businessPagesData.data.length, "pages from Business Manager");
      } else {
        console.log("❌ Step 4.1: No pages found in business, trying direct access...");
      }
    } else {
      console.log("❌ Step 4: Business Manager failed, trying direct pages access...");
    }

    // If we still don't have pages, try direct approach
    if (pagesData.data.length === 0) {
      // Fallback to direct pages access
      const directPagesUrl = `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`;
      console.log("Step 4.2: Direct Pages URL:", directPagesUrl.replace(accessToken, "***TOKEN***"));

      const directPagesRes = await fetch(directPagesUrl);
      pagesData = await directPagesRes.json();

      console.log("Step 4.2: Direct pages response status:", directPagesRes.status);
      console.log("Step 4.2: Direct pages response:", JSON.stringify(pagesData, null, 2));
    }

    // Add permissions debug
    console.log("Step 4.1: Debugging access token permissions...");
    const debugUrl = `https://graph.facebook.com/v19.0/me/permissions?access_token=${accessToken}`;
    const debugRes = await fetch(debugUrl);
    const debugData = await debugRes.json();
    console.log("Step 4.1: Token permissions:", JSON.stringify(debugData, null, 2));

    if (!pagesData.data || !Array.isArray(pagesData.data) || pagesData.data.length === 0) {
      console.log("❌ No Facebook Pages found for user");
      console.log("❌ This means the user is not an admin of any Page, or the app lacks permissions");
      if (businessData.error) {
        console.log("❌ Business Manager error:", JSON.stringify(businessData.error));
        return new Response(`Business Manager error: ${JSON.stringify(businessData.error)}`, { status: 400 });
      }
      return new Response("No Facebook Pages found. User must be admin of a Facebook Page.", { status: 400 });
    }

    console.log("✓ Step 4: Found", pagesData.data.length, "Facebook Pages");

    // Step 5: Find Page with Instagram business account
    console.log("Step 5: Checking each Page for connected Instagram business account...");

    let instagramPage = null;
    let instagramBusinessAccountId = null;
    let pageAccessToken = null;

    for (let i = 0; i < pagesData.data.length; i++) {
      const page = pagesData.data[i];
      console.log(`Step 5.${i + 1}: Checking Page "${page.name}" (ID: ${page.id})`);

      const igUrl = `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`;
      console.log(`Step 5.${i + 1}: IG account check URL:`, igUrl.replace(page.access_token, "***PAGE_TOKEN***"));

      const igRes = await fetch(igUrl);
      const igData = await igRes.json();

      console.log(`Step 5.${i + 1}: IG account response status:`, igRes.status);
      console.log(`Step 5.${i + 1}: IG account response:`, JSON.stringify(igData, null, 2));

      if (igData.instagram_business_account && igData.instagram_business_account.id) {
        instagramBusinessAccountId = igData.instagram_business_account.id;
        instagramPage = page;
        pageAccessToken = page.access_token;
        console.log(`✓ Step 5.${i + 1}: Found Instagram business account!`);
        console.log(`✓ Instagram business account ID:`, instagramBusinessAccountId);
        console.log(`✓ Connected to Page:`, page.name);
        break;
      } else {
        console.log(`❌ Step 5.${i + 1}: No Instagram business account found on this Page`);
      }
    }

    if (!instagramBusinessAccountId || !pageAccessToken) {
      console.log("❌ No Instagram business account found on any Page");
      console.log("❌ Make sure your Instagram account is:");
      console.log("   1. Set as Business account in Instagram app");
      console.log("   2. Connected to your Facebook Page");
      console.log("   3. The Page is managed by the authenticated user");
      return new Response("No Instagram business account found. Connect Instagram to your Facebook Page.", { status: 400 });
    }

    console.log("✓ Step 5: Instagram integration data collected:");
    console.log("  - Instagram business account ID:", instagramBusinessAccountId);
    console.log("  - Page name:", instagramPage.name);
    console.log("  - Page access token length:", pageAccessToken.length);

    // Step 6: Get Supabase user
    const userResp = await supabase.auth.getUser();
    const user = userResp.data.user;

    console.log("Step 6: Supabase user check:", user ? "✓ Authenticated" : "❌ Not authenticated");
    console.log("Step 6: User ID:", user?.id);

    if (!user) {
      console.log("❌ User not logged in to Supabase");
      return new Response("User not authenticated", { status: 401 });
    }

    // Step 7: Check existing integration
    console.log("Step 7: Checking for existing Instagram integration...");
    const existingIntegrationResp = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", user.id)
      .eq("provider", "instagram")
      .eq("external_account_id", instagramBusinessAccountId)
      .single();

    const existingIntegration = existingIntegrationResp.data;
    console.log("Step 7: Existing integration:", existingIntegration ? "✓ Found" : "❌ None");

    if (existingIntegration) {
      console.log("Step 7: Updating existing integration...");
      await supabase
        .from("user_integrations")
        .update({
          access_token: pageAccessToken,
          expires_at: new Date(Date.now() + expiresIn * 1000),
        })
        .eq("id", existingIntegration.id);

      console.log("✓ Step 7: Integration updated successfully");
      return new Response("Instagram integration updated", { status: 200 });
    }

    // Step 8: Save new integration
    console.log("Step 8: Saving new Instagram integration to database...");
    const upsertResp = await supabase.from("user_integrations").upsert({
      user_id: user.id,
      provider: "instagram",
      external_account_id: instagramBusinessAccountId,
      access_token: pageAccessToken,
      expires_at: new Date(Date.now() + expiresIn * 1000),
      metadata: {
        username: profile.name,
        account_type: "business",
        ig_user_id: instagramBusinessAccountId,
        page_id: instagramPage.id,
        page_name: instagramPage.name,
      },
    });

    const error = upsertResp.error;
    console.log("Step 8: Database upsert error:", error || "None");

    if (error) {
      console.error("❌ Failed to save Instagram integration:", error);
      return new Response("Failed to save integration", { status: 500 });
    }

    console.log("✓ Step 8: Instagram integration saved successfully");
    console.log("=== INSTAGRAM OAUTH FLOW COMPLETE ===");

    // For Instagram messaging, you'll use:
    // - Instagram business account ID: ${instagramBusinessAccountId}
    // - Page access token: ${pageAccessToken}
    // - Messaging endpoint: https://graph.facebook.com/v19.0/${instagramBusinessAccountId}/conversations

    return new Response(
      `
            <html>
                <body>
                    <script>
                        if (window.opener) {
                            window.opener.postMessage("instagram-connected", window.origin);
                            window.close();
                        } else {
                            document.body.innerText = "Instagram connected successfully! You can close this window.";
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
    console.error("❌ Instagram OAuth error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
