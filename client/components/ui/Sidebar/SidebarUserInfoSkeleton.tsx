export default function SidebarUserInfoSkeleton() {
  return (
    <div className="border-t border-gray-300 p-4">
      <div className="flex items-center space-x-3 ">
        {/* Avatar Skeleton */}
        <div className="h-8 w-8 rounded-full bg-gray-300 animate-pulse" />
        
        {/* Name & Email Skeleton */}
        <div className="flex flex-col flex-1 space-y-1">
          <div className="h-4 w-24 bg-gray-300 rounded animate-pulse" />
          <div className="h-3 w-36 bg-gray-200 rounded animate-pulse max-w-[150px]" />
        </div>
      </div>
    </div>
  );
}
