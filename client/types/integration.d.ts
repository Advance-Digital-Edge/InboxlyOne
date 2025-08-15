export type IntegrationMetadata = {
  page_name: any;
  channels?: any;
  email?: string;
  name?: string;
  picture?: string;
  workspaces?: any;
  // Instagram specific fields
  username?: string;
  account_type?: string;
  media_count?: number;
  ig_user_id?: string;
  // Facebook specific fields
  fb_id?: string;
  pages?: any[];
  // Slack specific fields
  slack_user_id?: string;
  team_name?: string;
  // Gmail specific fields
  historyId?: string;
};