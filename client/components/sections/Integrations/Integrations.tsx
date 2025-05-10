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

// Integration data with only the requested platforms
const integrations = [
  {
    id: "gmail",
    name: "Gmail",
    icon: <Mail className="h-6 w-6" />,
    connected: true,
    accounts: [
      { id: "gmail1", name: "alex@designstudio.com", type: "Email" },
      { id: "gmail2", name: "projects@designstudio.com", type: "Email" },
    ],
    accountType: "Email",
    color: "#D44638",
    maxAccounts: 3,
  },
  {
    id: "slack",
    name: "Slack",
    icon: <Slack className="h-6 w-6" />,
    connected: true,
    accounts: [
      { id: "slack1", name: "Design Team", type: "Workspace" },
      { id: "slack2", name: "Client Projects", type: "Workspace" },
    ],
    accountType: "Workspace",
    color: "#4A154B",
    maxAccounts: 5,
  },
  {
    id: "messenger",
    name: "Messenger",
    icon: <Facebook className="h-6 w-6" />,
    connected: false,
    accounts: [],
    accountType: "Page",
    color: "#0084FF",
    maxAccounts: 5,
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: <Instagram className="h-6 w-6" />,
    connected: true,
    accounts: [
      {
        id: "insta1",
        name: "@designstudio.creative",
        type: "Business Account",
      },
    ],
    accountType: "Business Account",
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

export default function Integrations() {
  // This would be a state function in a real app
  const removeAccount = (integrationId: string, accountId: string) => {
    console.log(`Remove account ${accountId} from ${integrationId}`);
    // In a real app, this would update state and call an API
  };

  // This would be a state function in a real app
  const addAccount = (integrationId: string) => {
    console.log(`Add new account to ${integrationId}`);
    // In a real app, this would open a modal or redirect to auth flow
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
              "overflow-hidden transition-all hover:shadow-md border-0 shadow-sm",
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
                    <div className="text-foreground" style={{ color: integration.color }}>
                      {integration.icon}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                </div>
                <Badge
                  variant={integration.connected ? "default" : "outline"}
                  className={integration.connected ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                >
                  {integration.connected ? "Connected" : "Not connected"}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="px-5 pb-3">
              {/* Connected accounts as bubbles */}
              {integration.accounts.length > 0 && (
                <div className="space-y-3">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Connected{" "}
                    {integration.accounts.length > 1
                      ? integration.accountType + "s"
                      : integration.accountType}
                  </div>
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
                                  className="flex items-center rounded-full py-1 px-3 text-sm transition-all"
                                  style={{
                                    backgroundColor: contrastColor.bg,
                                    color: contrastColor.text,
                                  }}
                                >
                                  <span className="max-w-[120px] truncate">
                                    {account.name}
                                  </span>
                                  <button
                                    onClick={() =>
                                      removeAccount(integration.id, account.id)
                                    }
                                    className="ml-1.5 rounded-full bg-white p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="h-3 w-3 text-gray-500" />
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
                              <Plus className="h-3 w-3 mr-0.5" />
                              <span>Add</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              Add another{" "}
                              {integration.accountType.toLowerCase()}
                            </p>
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
                  variant="default"
                  className="w-full"
                  style={{
                    backgroundColor: integration.color,
                    color: "white",
                    borderColor: integration.color,
                  }}
                >
                  Connect
                </Button>
              )}

              {/* Show disconnect all button if accounts are connected */}
              {integration.accounts.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Disconnect All
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
