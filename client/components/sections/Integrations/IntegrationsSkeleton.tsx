import React from "react";

export default function IntegrationSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="h-6 w-40 mx-auto bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-72 mx-auto mt-2 bg-gray-200 rounded animate-pulse" />
      </div>

      {/* Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 shadow-sm p-5 animate-pulse space-y-4"
          >
            {/* Top section (icon and title) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gray-300" />
                <div className="h-4 w-24 bg-gray-300 rounded" />
              </div>
              <div className="h-5 w-20 rounded bg-gray-200" />
            </div>

            {/* Account bubbles */}
            <div className="flex flex-wrap gap-2">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="h-6 w-24 rounded-full bg-gray-200"
                />
              ))}
              <div className="h-6 w-16 rounded-full bg-gray-100" />
            </div>

            {/* Connect button (only for empty) */}
            <div className="pt-2">
              <div className="h-10 w-full rounded bg-gray-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
