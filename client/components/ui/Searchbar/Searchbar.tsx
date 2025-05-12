import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Searchbar() {
  return (
    <div className="relative hidden md:block md:w-96">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
      <Input
        type="search"
        placeholder="Search across all messages..."
        className="w-full border-none bg-gray-50 pl-9 focus-visible:ring-1 focus-visible:ring-gray-200 focus-visible:ring-offset-0"
      />
    </div>
  );
}
