"use client";

import { NavigationMenu } from "radix-ui";
import Link from "next/link";
import { JSX } from "react";

export default function Navbar(): JSX.Element {
  return (
    <NavigationMenu.Root className="flex justify-center py-4 bg-inherit shadow-md z-50">
      <NavigationMenu.List className="flex gap-6 items-center">
        <NavigationMenu.Item>
          <NavigationMenu.Link asChild>
            <Link
              href="/dashboard"
              className="text-sm font-medium hover:underline"
            >
              Dashboard
            </Link>
          </NavigationMenu.Link>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenu.Link asChild>
            <Link
              href="/integrations"
              className="text-sm font-medium hover:underline"
            >
              Integrations
            </Link>
          </NavigationMenu.Link>
        </NavigationMenu.Item>

        <NavigationMenu.Item>
          <NavigationMenu.Trigger className="text-sm font-medium hover:underline">
            More
          </NavigationMenu.Trigger>
          <NavigationMenu.Content className="absolute top-full bg-white p-4 shadow-lg rounded-md">
            <ul className="flex flex-col gap-2">
              <li>
                <NavigationMenu.Link asChild>
                  <Link
                    href="/settings"
                    className="text-sm text-gray-700 hover:text-black"
                  >
                    Settings
                  </Link>
                </NavigationMenu.Link>
              </li>
              <li>
                <NavigationMenu.Link asChild>
                  <Link
                    href="/support"
                    className="text-sm text-gray-700 hover:text-black"
                  >
                    Support
                  </Link>
                </NavigationMenu.Link>
              </li>
            </ul>
          </NavigationMenu.Content>
        </NavigationMenu.Item>
      </NavigationMenu.List>

      <NavigationMenu.Indicator className="NavigationMenuIndicator" />
      <NavigationMenu.Viewport className="NavigationMenuViewport" />
    </NavigationMenu.Root>
  );
}
