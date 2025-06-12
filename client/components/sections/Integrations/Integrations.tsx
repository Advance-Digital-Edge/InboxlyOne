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
import { useMemo } from "react";
import { toast } from "react-hot-toast";
import { removeIntegration } from "@/app/actions";

// Integration data with only the requested platforms
const BASE_INTEGRATIONS = [
  {
    id: "gmail",
    name: "Gmail",
    icon: <Mail className="h-6 w-6" />,
    connected: false,
    accounts: [],
    color: "#D44638",
    maxAccounts: 2,
  },
  {
    id: "slack",
    name: "Slack",
    icon: <Slack className="h-6 w-6" />,
    connected: false,
    accounts: [],
    color: "#4A154B",
    maxAccounts: 2,
  },
  {
    id: "messenger",
    name: "Messenger",
    icon: <Facebook className="h-6 w-6" />,
    connected: false,
    accounts: [],
    color: "#0084FF",
    maxAccounts: 2,
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: <Instagram className="h-6 w-6" />,
    connected: false,
    accounts: [],
    color: "#E1306C",
    maxAccounts: 2,
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

export default function Integrations() {
  const { userIntegrations, fetchUserIntegrations, user } = useAuth();
  const userId = user?.id;

  const integrations = useMemo(() => {
    return BASE_INTEGRATIONS.map((base) => {
      const matches =
        userIntegrations?.filter((u) => u.provider === base.id) || [];

      return {
        ...base,
        connected: matches.length > 0,
        accounts: matches.map((match, index) => ({
          id: match.id,
          name: match.metadata.email,
          picture: match.metadata.picture,
          workspaces: match.metadata.workspaces, // <-- add this line
        })),
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
      url = `https://slack.com/oauth/v2/authorize?client_id=${SLACK_CLIENT_ID}
&scope=channels:history,groups:history,im:history,mpim:history,channels:read,groups:read,im:read,mpim:read,users:read,team:read
&user_scope=channels:history,groups:history,im:history,mpim:history,im:read,mpim:read,chat:write,im:write,users:read,team:read
&redirect_uri=${TEMP_URL}/api/slack/oauth/callback
&state=${userId}
&force_scope=1
&force_reinstall=1`;
    } else if (integrationId === "gmail") {
      url = "/api/oauth/login"; 
    }

    if (url) {
      openPopup(url);

      const receiveMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;

        if (event.data === "gmail-connected") {
          fetchUserIntegrations?.()
            .catch(() => toast.error("Failed to refresh integrations."));
          toast.success("Account connected successfully!");
          window.removeEventListener("message", receiveMessage);
        }
      };

      window.addEventListener("message", receiveMessage);
    }
  };

  const handleRemoveAccount = async (accountId: string) => {
    try {
      await toast.promise(removeIntegration(accountId), {
        loading: "Removing account...",
        success: <p>Account removed successfully</p>,
        error: (err) => <p>{err.message || "Could not save."}</p>,
      });
      fetchUserIntegrations?.();
    } catch (error) {
      console.error("Error removing integration:", error);
    }
  };

  // This would be a state function in a real app
  const removeAccount = (accountId: string) => {
    handleRemoveAccount(accountId);
  };

  // This would be a state function in a real app
  const addAccount = (integrationId: string) => {
    handleConnectClick(integrationId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
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
              <div className="flex items-center justify-between">
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

            <CardContent className="px-5 pb-3">
              {/* Connected accounts as bubbles */}
              {integration.accounts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {integration.accounts.map((account, index) => {
                      const contrastColor = getContrastColor(integration.color, index);
                      return (
                        <TooltipProvider key={account.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="group relative">
                                <div
                                  className="flex items-center rounded-full py-1 px-3 text-sm transition-all"
                                  style={{
                                    backgroundColor: contrastColor.bg,
                                    color: contrastColor.text,
                                  }}
                                >
                                  <span className="max-w-[120px] truncate">
                                    {account.name}
                                  </span>
                                  {/* Show channels only for Slack */}
                                  {integration.id === "slack" &&
                                    account.workspaces &&
                                    account.workspaces.length > 0 && (
                                      <div className="text-xs text-gray-500 mt-1">
                                        Workspace: {account.workspaces.map((w: any) => w.workspace_name).join(", ")}
                                      </div>
                                  )}
                                  <button
                                    onClick={() => removeAccount(account.id)}
                                    className="ml-1.5 rounded-full bg-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X color="red" className="h-3 w-3 text-gray-500" />
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
                    {integration.accounts.length < integration.maxAccounts && (
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
      </div>
    </div>
  );
}
