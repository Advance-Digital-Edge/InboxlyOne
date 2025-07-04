import { createClient } from "@/utils/supabase/server";
import { Button } from "@/components/ui/button";
import { getSlackOAuthUrl } from "@/lib/slack-token-manager";

const TEMP_URL = process.env.NEXT_PUBLIC_TEMPORARY_SLACK_URL; 

export default async function SlackAuthPage() {
   const supabase = await createClient();
   const {
      data: { session },
    } = await supabase.auth.getSession();
    
    const authToken = session?.access_token;
    const userId = session?.user.id;
    
    // Use our utility function to get the OAuth URL with token rotation enabled
    const redirectUrl = getSlackOAuthUrl(userId!, TEMP_URL!);

  return (
    <a href={redirectUrl}>
      <Button>Connect Slack</Button>
    </a>
  );
}
