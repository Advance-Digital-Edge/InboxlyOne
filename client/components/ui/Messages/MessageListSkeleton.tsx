import { Card } from "@/components/ui/card";
import { Skeleton } from "../skeleton";

export default function MessageListSkeleton() {
  const skeletons = Array.from({ length: 6 });

  return (
    <div className="flex-1 overflow-y-auto border-r border-gray-200 bg-white w-full">
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between"></div>
        <div className="flex-1 overflow-y-auto border-r border-gray-200 bg-white w-full">
          <div className="p-4">
            <div className="mb-4 flex justify-end">
              <Skeleton className="h-4 w-16" />
            </div>

            <div className="space-y-4">
              {skeletons.map((_, index) => (
                <Card key={index} className="overflow-hidden border shadow-sm">
                  <div className="p-2">
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-5 w-20 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                        <div className="flex gap-2 mt-2">
                          <Skeleton className="h-4 w-12 rounded-full" />
                          <Skeleton className="h-4 w-14 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
