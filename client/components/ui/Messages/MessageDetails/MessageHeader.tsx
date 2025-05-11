import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tag, MoreHorizontal } from "lucide-react";
import { getPlatformColor, getPlatformIcon } from "@/lib/platformUtils";
import { cn } from "@/lib/utils";

interface MessageHeaderProps {
  selectedMessage: Message;
  tagColors: Record<string, string>;
}
export default function MessageHeader ({ selectedMessage, tagColors } : MessageHeaderProps)   {
  return (
    <div className="border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={selectedMessage.avatar || "/placeholder.svg"}
              alt={selectedMessage.sender}
            />
            <AvatarFallback>{selectedMessage.sender.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{selectedMessage.sender}</h3>
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", getPlatformColor(selectedMessage.platform))}
              >
                {getPlatformIcon(selectedMessage.platform)}
                <span className="ml-0.5">{selectedMessage.platform}</span>
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-1">
            <Tag className="h-4 w-4" />
            <span className="hidden md:inline">Manage Tags</span>
          </Button>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {selectedMessage.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className={cn("text-xs", tagColors[tag])}>
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
};


