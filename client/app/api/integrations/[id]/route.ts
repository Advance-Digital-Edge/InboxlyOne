import { google } from "googleapis";
import { createClient } from "@/utils/supabase/server";

export async function DELETE(request: Request, context: any) {
  const { id } = await context.params;
  const { provider } = await request.json();
  const supabase = await createClient();

  if (provider === "gmail") {
    const { data: integration, error } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !integration) {
      console.error("❌ Failed to fetch integration:", error);
      return new Response("Integration not found", { status: 404 });
    }
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
      const { error: deleteError } = await supabase
        .from("user_integrations")
        .delete()
        .eq("id", id);


      if (deleteError) {
        console.error("❌ Failed to delete integration:", deleteError);
        return new Response("Failed to delete integration", { status: 500 });
      }

      console.log("🗑️ Integration deleted successfully");
      return new Response("Integration removed", { status: 200 });
    } catch (err) {
      console.error("❌ Failed to stop Gmail watch or revoke token:", err);
      // Optionally handle errors here (maybe return 500 or continue)
    }
  }

  // 👉 Add Slack   removal
  if (provider === "slack") {
    const { data: integration, error } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !integration) {
      console.error("❌ Failed to fetch integration:", error);
      return new Response("Integration not found", { status: 404 });
    }
    try {
      // 1. Revoke the Slack access token
      const revokeRes = await fetch("https://slack.com/api/auth.revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${integration.access_token}`,
        },
        body: "test=false",
      });

      const revokeData = await revokeRes.json();
      if (revokeData.ok) {
        console.log(
          "✅ Slack token revoked for:",
          integration.metadata?.team_name || integration.metadata?.email
        );
      } else {
        console.error("❌ Failed to revoke Slack token:", revokeData.error);
      }

      // 2. Remove from slack_tokens table
      const { error: slackTokenError } = await supabase
        .from("slack_tokens")
        .delete()
        .eq("access_token", integration.access_token);

      if (slackTokenError) {
        console.error(
          "❌ Failed to delete from slack_tokens:",
          slackTokenError
        );
      } else {
        console.log("✅ Slack tokens deleted for integration:", integration.id);
      }
    } catch (err) {
      console.error(
        "❌ Failed to revoke Slack token or delete from slack_tokens:",
        err
      );
      // Optionally handle errors here
    }
  }

  // 👉 Add Instagram integration removal
  if (provider === "instagram") {
    try {
      // Instagram long-lived tokens can't be revoked via API, they expire naturally
      // We just need to remove from our database
      console.log("Removing Instagram integration for ID:", id);
      const { error: igError } = await supabase
        .from("instagram_accounts")
        .delete()
        .eq("id", id);

      if (igError) {
        console.log(igError, "BROO");
        throw new Error("❌ Failed to delete Instagram account:", igError);
      }
    } catch (err) {
      console.error("❌ Failed to remove Instagram integration:", err);
    }
  }

  return new Response("Integration deleted", { status: 200 });
}
