import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const { user } = (await supabase.auth.getUser()).data;

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { error } = await supabase
    .from("slack_tokens")
    .delete()
    .eq("auth_user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Optionally, update user_integrations.slack_connected to false
  await supabase
    .from("user_integrations")
    .update({ slack_connected: false })
    .eq("auth_user_id", user.id);

  return NextResponse.json({ success: true });
}