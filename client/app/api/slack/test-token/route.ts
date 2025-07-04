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

    // Get Slack token - check both tables
    const { data: tokenRow, error } = await supabase
      .from("slack_tokens")
      .select("access_token, slack_user_id, created_at")
      .eq("auth_user_id", authUserId)
      .single();

    const { data: integrationRow, error: integrationError } = await supabase
      .from("user_integrations")
      .select("access_token, external_account_id, metadata, created_at")
      .eq("user_id", authUserId)
      .eq("provider", "slack")
      .single();

    if ((error || !tokenRow) && (integrationError || !integrationRow)) {
      return NextResponse.json(
        { 
          ok: false, 
          error: "No Slack tokens found in either table",
          details: {
            slack_tokens_error: error,
            user_integrations_error: integrationError,
            message: "Please re-authenticate with Slack"
          }
        },
        { status: 404 }
      );
    }

    // Use token from whichever table has it
    const token = tokenRow?.access_token || integrationRow?.access_token;
    const slackUserId = tokenRow?.slack_user_id || integrationRow?.metadata?.slack_user_id || integrationRow?.external_account_id;
    const createdAt = tokenRow?.created_at || integrationRow?.created_at;

    if (!token) {
      return NextResponse.json(
        { ok: false, error: "Token found but empty" },
        { status: 404 }
      );
    }

    // Test the token with Slack's auth.test endpoint
    const testRes = await fetch("https://slack.com/api/auth.test", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const testData = await testRes.json();

    console.log("Token test result:", testData);
    console.log("Token created at:", createdAt);
    console.log("Token prefix:", token.substring(0, 20) + "...");

    return NextResponse.json({
      ok: true,
      tokenValid: testData.ok,
      slackResponse: testData,
      tokenCreatedAt: createdAt,
      tokenPrefix: token.substring(0, 20) + "...",
      source: tokenRow ? "slack_tokens" : "user_integrations"
    });
  } catch (error: any) {
    console.error("Error testing token:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
