import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Facebook,
  Mail,
  MessageSquare,
  Shield,
  Slack,
  Instagram,
  Twitter,
  Calendar,
} from "lucide-react";

// Integration data
const integrations = [
  {
    id: "slack",
    name: "Slack",
    icon: <Slack className="h-6 w-6" />,
    connected: true,
    color: "#4A154B",
  },
  {
    id: "gmail",
    name: "Gmail",
    icon: <Mail className="h-6 w-6" />,
    connected: true,
    color: "#D44638",
  },
  {
    id: "messenger",
    name: "Messenger",
    icon: <Facebook className="h-6 w-6" />,
    connected: false,
    color: "#0084FF",
  },
  {
    id: "instagram",
    name: "Instagram",
    icon: <Instagram className="h-6 w-6" />,
    connected: false,
    color: "#E1306C",
  },
];

export default function IntegrationsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="mt-2 text-muted-foreground">
          Connect your accounts to sync messages across platforms.
        </p>
      </div>

      {/* Integrations Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {integrations.map((integration) => (
          <Card
            key={integration.id}
            className="overflow-hidden transition-all hover:shadow-md"
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
            <CardContent></CardContent>
            <CardFooter>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={integration.connected ? "outline" : "default"}
                      className="w-full"
                    >
                      {integration.connected ? "Disconnect" : "Connect"}
                    </Button>
                  </TooltipTrigger>
                </Tooltip>
              </TooltipProvider>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Security Banner */}
      <div className="mt-12 rounded-lg bg-gray-50 p-4 shadow-sm">
        <div className="flex items-center justify-center gap-2 text-center">
          <Shield className="h-5 w-5 text-gray-500" />
          <p className="text-sm text-gray-600">
            Your credentials are encrypted and never shared. We use
            industry-standard security practices to keep your data safe.
          </p>
        </div>
      </div>
    </div>
  );
}
