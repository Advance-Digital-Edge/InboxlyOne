import { Button } from "@/components/ui/button";
import { ChevronDown, Filter } from "lucide-react";

export default function PlatformFilter() {
  return (
    <>
      <Button variant="outline" size="sm" className="gap-1">
        <Filter className="h-4 w-4" />
        <span className="hidden md:inline">Filter</span>
        <ChevronDown className="h-3 w-3" />
      </Button>
    </>
  );
}
