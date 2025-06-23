import { google } from "googleapis";
import { createClient } from "@/utils/supabase/server";

export async function DELETE(request: Request, context: any) {
  const supabase = await createClient();
  const { id } = await context.params;

  const { data: integration, error } = await supabase
    .from("user_integrations")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !integration) {
    return new Response("Integration not found", { status: 404 });
  }

  console.log("Deleting integration:", integration.provider, integration.id);

  if (integration.provider === "gmail") {
    try {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      oauth2Client.setCredentials({
        access_token: integration.access_token,
        refresh_token: integration.refresh_token,
      });

      const gmail = google.gmail({ version: "v1", auth: oauth2Client });

      // 🔁 Fetch current profile to confirm identity
      const profile = await gmail.users.getProfile({ userId: "me" });
      console.log("🚀 Stop Watch – Gmail account:", profile.data.emailAddress);

      // 🧪 Refresh token to ensure it's valid
      try {
        const res = await oauth2Client.refreshAccessToken();
        oauth2Client.setCredentials(res.credentials);
        console.log("✅ Token refreshed successfully");
      } catch (err) {
        console.error("❌ Token refresh failed:", err);
      }

      // ⚙️ Now attempt to stop the watch
      try {
        const stopRes = await gmail.users.stop({ userId: "me" });
        console.log("🛑 users.stop response:", stopRes.data);
      } catch (err) {
        console.error("❌ Error calling users.stop():", err);
      }

      // Revoke the token from Google
      const revokeRes = await fetch("https://oauth2.googleapis.com/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `token=${encodeURIComponent(integration.refresh_token)}`,
      });

      if (revokeRes.ok) {
        console.log("✅ OAuth token revoked for:", integration.metadata?.email);
      } else {
        console.error(
          "❌ Failed to revoke OAuth token",
          await revokeRes.text()
        );
      }
    } catch (err) {
      console.error("❌ Failed to stop Gmail watch or revoke token:", err);
      // Optionally handle errors here (maybe return 500 or continue)
    }
  }

  // Delete integration from DB
  await supabase.from("user_integrations").delete().eq("id", id);

  return new Response("Integration deleted", { status: 200 });
}
