import { NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MESSENGER_CONVOS_SYNC_FUNCTION_URL =
  "https://iilkqhfeoxsqncluaytu.supabase.co/functions/v1/sync-fb-conversations";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body = await req.json();

  const { integrationId, page } = body;

  // Validate user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Response("Not authenticated", { status: 401 });

  // Save the selected page only
  const { error } = await supabase.from("facebook_pages").upsert({
    integration_id: integrationId,
    user_id: user.id,
    page_id: page.id,
    page_name: page.name,
    access_token: page.access_token,
    category: page.category,
    tasks: page.tasks,
    category_list: page.category_list,
  });

  if (error)
    return new Response("Failed to save page", {
      status: 500,
      statusText: error.message,
    });

  // 3. Sync convos right after saving page
  try {
    const syncRes = await fetch(MESSENGER_CONVOS_SYNC_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    });

    if (!syncRes.ok) {
      console.error("❌ Failed to trigger sync:", await syncRes.text());
    }
  } catch (err) {
    console.error("❌ Error triggering sync function:", err);
  }

  return new Response("Page saved & sync triggered", { status: 200 });
}
