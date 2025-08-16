"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardTitle,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Facebook, Mail, Slack, Instagram, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/context/AuthProvider";
import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { removeIntegration } from "@/app/actions";
import { IntegrationMetadata } from "@/types/integration";
import SocialAccountSelector from "@/components/modals/social-account-selector";
import { IntegrationDisconnectModal } from "@/components/modals/integration-disconnect-modal";
import { AccountInfo } from "@/components/modals/integration-disconnect-modal";
import { set } from "react-hook-form";

interface UserIntegration {
  id: string;
  provider: string;
  metadata: IntegrationMetadata;
}

// Integration data with only the requested platforms
const BASE_INTEGRATIONS = [
  {
    id: "gmail",
    name: "Gmail",
    icon: <Mail className="h-6 w-6" />,
    connected: false,
    accounts: [],
    color: "#D44638",
    maxAccounts: 1,
  },
  {
    id: "slack",
    name: "Slack",
    icon: <Slack className="h-6 w-6" />,
    connected: false,
    accounts: [],
    color: "#4A154B",
    maxAccounts: 1,
  },
  {
    id: "messenger",
    name: "Messenger",
    icon: <Facebook className="h-6 w-6" />,
    connected: false,
    accounts: [],
    color: "#0084FF",
    maxAccounts: 1,
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: <Instagram className="h-6 w-6" />,
    connected: false,
    accounts: [],
    color: "#E1306C",
    maxAccounts: 1,
  },
];

// Function to generate a contrasting color based on the platform color
const getContrastColor = (platformColor: string, index: number) => {
  const colors = [
    { bg: "#E3F2FD", text: "#1565C0" }, // Blue
    { bg: "#E8F5E9", text: "#2E7D32" }, // Green
    { bg: "#FFF3E0", text: "#E65100" }, // Orange
    { bg: "#F3E5F5", text: "#7B1FA2" }, // Purple
    { bg: "#E1F5FE", text: "#0277BD" }, // Light Blue
  ];

  return colors[index % colors.length];
};

const SLACK_CLIENT_ID = process.env.NEXT_PUBLIC_SLACK_CLIENT_ID;
const TEMP_URL = process.env.NEXT_PUBLIC_TEMPORARY_SLACK_URL;

const MESSENGER_APP_ID = process.env.NEXT_PUBLIC_MESSENGER_APP_ID;
const MESSENGER_REDIRECT_URI = process.env.NEXT_PUBLIC_MESSENGER_REDIRECT_URI;

const INSTAGRAM_APP_ID = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID;
const INSTAGRAM_REDIRECT_URI = process.env.NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI;

export default function Integrations() {
  const { userIntegrations, fetchUserIntegrations, user } = useAuth();
  const userId = user?.id;
  const [showMessengerPageModal, setShowMessengerPageModal] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [disconnectSuccess, setDisconnectSuccess] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AccountInfo | null>(
    null
  );
  const [linkedInstagram, setLinkedInstagram] = useState<any | null>(null);
  const [messengerPages, setMessengerPages] = useState<{
    integrationId: string;
    pages: any[];
    userProfile: any;
  } | null>(null);


  const integrations = useMemo(() => {
    return BASE_INTEGRATIONS.map((base) => {
      // Get the array of integrations for this provider
      const matches: UserIntegration[] = userIntegrations?.[base.id] || [];

      return {
        ...base,
        connected: matches.length > 0,
        accounts: matches.map((match: any) => {
          const metadata = match;
          let name: string;
          let picture: string | null = null;
          let username: string | null = null;
          switch (base.id) {
            case "gmail":
              name = metadata.metadata.email || "Unknown";
              picture = metadata.metadata.picture || null;
              break;
            case "slack":
              name = metadata.email || "Unknown";
              picture = metadata.picture || null;
              break;
            case "messenger":
              name = metadata.page.name || "Unknown";
              username = metadata.user.name || null;
              picture = metadata.user.picture || null;
              break;
            case "instagram":
              name = metadata.username ? `@${metadata.username}` : "Unknown";
              picture = metadata.profile_picture;
              setLinkedInstagram({ name, picture });
              break;
            default:
              name = metadata.email || metadata.name || "Unknown";
              picture = metadata.picture || null;
          }

          return {
            id: match.id,
            username,
            type: base.id as AccountInfo["type"],
            name,
            picture,
            workspaces: metadata.workspaces || [],
          };
        }),
      };
    });
  }, [userIntegrations]);

  const openPopup = (
    url: string,
    name = "oauthPopup",
    width = 600,
    height = 700
  ) => {
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    return window.open(
      url,
      name,
      `width=${width},height=${height},left=${left},top=${top}`
    );
  };

  const handleConnectClick = (integrationId: string) => {
    let url = "";

    if (integrationId === "slack") {
      url = `https://slack.com/oauth/v2/authorize?client_id=${SLACK_CLIENT_ID}&scope=...&redirect_uri=${TEMP_URL}/api/slack/oauth/callback&state=${userId}&force_scope=1&force_reinstall=1`;
    } else if (integrationId === "gmail") {
      url = "/api/oauth/login";
    } else if (integrationId === "messenger") {
      url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${MESSENGER_APP_ID}&redirect_uri=${MESSENGER_REDIRECT_URI}&scope=pages_messaging,pages_show_list,pages_read_engagement,public_profile`;
    } else if (integrationId === "instagram") {
      // Add business_management scope
      url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${MESSENGER_APP_ID}&redirect_uri=${INSTAGRAM_REDIRECT_URI}&scope=pages_show_list,pages_read_engagement,pages_manage_metadata,instagram_basic,instagram_manage_messages,business_management&response_type=code`;
    }

    if (!url) {
      console.error("No URL for integration", integrationId);
      return;
    }

    // ✅ Добави event listener само веднъж
    const receiveMessage = (event: MessageEvent) => {
      const { data } = event;
      if (data === "gmail-connected") {
        fetchUserIntegrations?.().catch(() =>
          toast.error("Failed to refresh integrations.")
        );
        toast.success("Gmail connected successfully!");
        window.removeEventListener("message", receiveMessage);
      }

      if (data === "slack-connected") {
        fetchUserIntegrations?.().catch(() =>
          toast.error("Failed to refresh integrations.")
        );
        toast.success("Slack connected successfully!");
        window.removeEventListener("message", receiveMessage);
      }

      if (data === "instagram-connected") {
        fetchUserIntegrations?.().catch(() =>
          toast.error("Failed to refresh integrations.")
        );
        toast.success("Instagram connected successfully!");
        window.removeEventListener("message", receiveMessage);
      }

      const { type, integrationId, pages, userProfile } = data || {};
      if (type === "messenger-pages") {
        setMessengerPages({ pages, integrationId, userProfile });
        setShowMessengerPageModal(true);
        window.removeEventListener("message", receiveMessage);
      }
    };

    window.addEventListener("message", receiveMessage);

    const popup = openPopup(url);
    if (!popup) {
      console.error("Popup failed to open");
      window.removeEventListener("message", receiveMessage);
    }
  };

  const handleDisconnectClick = (
    account: AccountInfo,
    linkedInstagramAccount?: AccountInfo
  ) => {
    setSelectedAccount(account);
    setShowDisconnectModal(true);
  };

  const handleRemoveAccount = async (accountId: string, provider: string) => {
    setIsDisconnecting(true);
    try {
      await removeIntegration(accountId, provider);

      if (provider === "instagram") {
        setLinkedInstagram(null);
      }
      fetchUserIntegrations?.();

      setIsDisconnecting(false);
      setDisconnectSuccess(true);

      // Auto-close modal after showing success
      setTimeout(() => {
        setDisconnectSuccess(false);
        setShowDisconnectModal(false);
      }, 500);
    } catch (err: any) {
      setIsDisconnecting(false);
      toast.error(err.message || "Could not remove account.");
    }
  };

  // This would be a state function in a real app
  const addAccount = (integrationId: string) => {
    handleConnectClick(integrationId);
  };

  async function handleSelectPage(accountId: string) {
    if (!messengerPages) {
      console.error("No messenger pages available");
      return;
    }

    const selectedPage = messengerPages.pages.find(
      (page) => page.id === accountId
    );

    if (!selectedPage) {
      console.error("Selected page not found");
      return;
    }

    try {
      const response = await fetch("/api/messenger/save-page", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          integrationId: messengerPages.integrationId,
          page: selectedPage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect page. Please try again !");
      }

      toast.success("Page connected successfully!");
      fetchUserIntegrations?.();
      setShowMessengerPageModal(false);
    } catch (error) {
      console.error("Error connecting page:", error);
      toast.error("Failed to connect page. Please try again.");
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      {showMessengerPageModal && messengerPages && (
        <SocialAccountSelector
          accounts={messengerPages.pages} // pass pages as accounts
          isLoading={false} // or true if still loading
          error={null} // or actual error string if any
          onClose={() => setShowMessengerPageModal(false)}
          onSelectAccount={handleSelectPage} // use the correct callback name
          platform="messenger"
        />
      )}

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="mt-2 text-muted-foreground">
          Connect your accounts to sync messages across platforms
        </p>
      </div>

      {/* Integrations Grid */}
      <div className="grid gap-6 md:grid-cols-2  lg:grid-cols-2 xl:grid-cols-4">
        {integrations.map((integration) => (
          <Card
            key={integration.id}
            className={cn(
              "overflow-hidden transition-all hover:shadow-md border-gray-200 border shadow-sm",
              integration.connected && "shadow-md"
            )}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center  justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${integration.color}20` }}
                  >
                    <div
                      className="text-foreground"
                      style={{ color: integration.color }}
                    >
                      {integration.icon}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                </div>
                <Badge
                  variant={integration.connected ? "default" : "outline"}
                  className={
                    integration.connected
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : ""
                  }
                >
                  {integration.connected ? "Connected" : "Not connected"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="px-5  pb-3">
              {/* Connected accounts as bubbles */}
              {integration.accounts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {integration.accounts.map((account, index) => {
                      const contrastColor = getContrastColor(
                        integration.color,
                        index
                      );
                      return (
                        <TooltipProvider key={account.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="group relative">
                                <div
                                  className="flex items-center rounded-full py-1 px-3 md:text-xs lg:text-sm transition-all gap-2"
                                  style={{
                                    backgroundColor: contrastColor.bg,
                                    color: contrastColor.text,
                                  }}
                                >
                                  {/* Circle account picture */}
                                  {account.picture && (
                                    <img
                                      src={account.picture}
                                      alt={account.name}
                                      className="h-5 w-5 rounded-full  object-cover"
                                    />
                                  )}
                                  {integration.id === "messenger" && (
                                    <span className="max-w-[120px] truncate">
                                      {account.username} -{" "}
                                    </span>
                                  )}
                                  <span className="max-w-[120px] truncate">
                                    {account.name}
                                  </span>
                                  {/* Show channels only for Slack */}
                                  {integration.id === "slack" &&
                                    account.workspaces &&
                                    account.workspaces.length > 0 && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        Workspace:{" "}
                                        {account.workspaces
                                          .map((w: any) => w.workspace_name)
                                          .join(", ")}
                                      </div>
                                    )}
                                  <button
                                    onClick={() =>
                                      handleDisconnectClick(account)
                                    }
                                    className="ml-1.5 rounded-full bg-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X
                                      color="red"
                                      className="h-3 w-3 text-gray-500"
                                    />
                                  </button>
                                </div>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{account.name}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}

                    {/* Add account bubble if below max */}
                    {integration.accounts.length > 1 && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              onClick={() => addAccount(integration.id)}
                              className="flex items-center rounded-full bg-gray-100 py-1 px-2 text-sm text-gray-600 hover:bg-gray-200 transition-colors"
                            >
                              <Plus color="green" className="h-3 w-3 mr-0.5" />
                              <span>Add</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Add another account</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="px-5 pt-0 pb-5 flex justify-center">
              {/* Show connect button if no accounts are connected */}
              {integration.accounts.length === 0 && (
                <Button
                  className="w-full bg-blue-400 hover:bg-blue-900 text-white"
                  onClick={() => handleConnectClick(integration.id)}
                >
                  Connect
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}

        {selectedAccount && (
          <IntegrationDisconnectModal
            isOpen={showDisconnectModal}
            account={selectedAccount}
            linkedInstagram={linkedInstagram}
            isLoading={isDisconnecting}
            isSuccess={disconnectSuccess}
            onClose={() => setShowDisconnectModal(false)}
            onDisconnect={() =>
              handleRemoveAccount(selectedAccount.id, selectedAccount.type)
            }
          />
        )}
      </div>
    </div>
  );
}
