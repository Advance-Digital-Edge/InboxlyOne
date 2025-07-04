import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const authUserId = req.headers.get("x-user-id");
    if (!authUserId) {
      return NextResponse.json(
        { ok: false, error: "Missing user ID" },
        { status: 400 }
      );
    }

    // Get all Slack-related data for this user
    const { data: tokenRow, error: tokenError } = await supabase
      .from("slack_tokens")
      .select("*")
      .eq("auth_user_id", authUserId)
      .single();

    const { data: integrationRow, error: integrationError } = await supabase
      .from("user_integrations")
      .select("*")
      .eq("user_id", authUserId)
      .eq("provider", "slack")
      .single();

    const diagnostics: any = {
      tokenExists: !!tokenRow,
      integrationExists: !!integrationRow,
      tokenError,
      integrationError,
      tokenData: tokenRow ? {
        created_at: tokenRow.created_at,
        slack_user_id: tokenRow.slack_user_id,
        tokenPrefix: tokenRow.access_token?.substring(0, 20) + "...",
        tokenLength: tokenRow.access_token?.length
      } : null,
      integrationData: integrationRow ? {
        created_at: integrationRow.created_at,
        external_account_id: integrationRow.external_account_id,
        metadata: integrationRow.metadata
      } : null
    };

    // Test the token if it exists
    if (tokenRow?.access_token) {
      const testRes = await fetch("https://slack.com/api/auth.test", {
        headers: {
          Authorization: `Bearer ${tokenRow.access_token}`,
          "Content-Type": "application/json",
        },
      });

      const testData = await testRes.json();
      diagnostics.tokenTest = testData;

      // Also test with a simple API call like conversations.list
      const listRes = await fetch("https://slack.com/api/conversations.list?types=im&limit=1", {
        headers: {
          Authorization: `Bearer ${tokenRow.access_token}`,
        },
      });

      const listData = await listRes.json();
      diagnostics.conversationsTest = listData;
    }

    return NextResponse.json({
      ok: true,
      diagnostics
    });
  } catch (error: any) {
    console.error("Error in diagnostics:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
