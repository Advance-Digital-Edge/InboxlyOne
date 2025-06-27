"use client";
import Integrations from "@/components/sections/Integrations/Integrations";
import { useAuth } from "@/app/context/AuthProvider";
import IntegrationSkeleton from "@/components/sections/Integrations/IntegrationsSkeleton";

export default function IntegrationsPage() {
  const { loadingIntegrations } = useAuth();

  if (loadingIntegrations) {
    return <IntegrationSkeleton />;
  }

  return <Integrations />;
}
