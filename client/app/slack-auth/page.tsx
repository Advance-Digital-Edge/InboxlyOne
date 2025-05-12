import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";

const SLACK_CLIENT_ID = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID;
const TEMP_URL = process.env.NEXT_PUBLIC_TEMPORARY_SLACK_URL; 

export default async function SlackAuthPage() {
   const supabase = await createClient();
   const {
      data: { session },
    } = await supabase.auth.getSession();
    
    const authToken = session?.access_token;
    const userId = session?.user.id;
    console.log("Slack Client ID:", SLACK_CLIENT_ID);
    console.log("Temporary URL:", TEMP_URL);
    const redirectUrl = `https://slack.com/oauth/v2/authorize?client_id=${SLACK_CLIENT_ID}&scope=channels:history,groups:history,im:history,mpim:history,channels:read,groups:read,im:read,mpim:read,users:read&user_scope=channels:history,groups:history,im:history,mpim:history,im:read,mpim:read,users:read&redirect_uri=${TEMP_URL}/api/slack/oauth/callback&state=${userId}&force_scope=1&force_reinstall=1`;

  return (
    <a href={redirectUrl}>
      <Button>Connect Slack</Button>
    </a>
  );
}
