"use client";

import { X, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getPlatformIcon, getPlatformColor } from "@/lib/platformUtils";
import React from "react";

export interface AccountInfo {
  id: any;
  type: "Messenger" | "Instagram" | "Gmail" | "Slack";
  name: string;
  username: string | null;
  picture: string | null;
  workspaces: any[];
}

interface DisconnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDisconnect: () => void;
  account: AccountInfo;
  linkedInstagram?: any;
  isLoading?: boolean;
  isSuccess?: boolean;
}

export function IntegrationDisconnectModal({
  isOpen,
  onClose,
  onDisconnect,
  isLoading,
  isSuccess,
  account,
  linkedInstagram,
}: DisconnectModalProps) {
  if (!isOpen) return null;

  const isFacebookPage = account.type === "Messenger" && linkedInstagram;
  console.log("ACCOUNT", account.type);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50  ">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <p className="text-sm text-center mt-1  tracking-wider">
              The following accounts will be disconnected:
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          {/* Warning for Facebook Pages */}
          {isFacebookPage && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-amber-800">
                Disconnecting this Facebook Page will also disconnect the
                Instagram account linked to it
              </p>
            </div>
          )}

          {/* Account Details */}
          {/* Primary Account */}
          <div className="flex items-center border gap-3 p-3 rounded-lg">
            <span
              className={`rounded-full border p-2 flex items-center justify-center ${getPlatformColor(account.type)}`}
            >
              {getPlatformIcon(account.type)}
            </span>

            <img
              src={account.picture || "/placeholder.svg"}
              alt={account.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {account.name}
              </p>
            </div>
          </div>

          {/* Linked Instagram Account */}
          {linkedInstagram && account.type === "Messenger" && (
            <div className="flex items-center border  gap-3 p-3 bg-gray-50 rounded-lg">
              <span
                className={`rounded-full border p-2 flex items-center justify-center ${getPlatformColor("Instagram")}`}
              >
                {getPlatformIcon("Instagram")}
              </span>

              <img
                src={linkedInstagram.picture || "/placeholder.svg"}
                alt={linkedInstagram.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {linkedInstagram.name}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 flex gap-3">
          {!isLoading && !isSuccess && (
            <>
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 text-gray-700 border-gray-300 hover:bg-gray-50 bg-transparent"
              >
                Cancel
              </Button>
              <Button
                onClick={onDisconnect}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </>
          )}

          {isLoading && (
            <div className="flex-1 flex items-center justify-center gap-2">
              <span>Disconnecting...</span>
              <span className="animate-spin border-2 border-white border-t-red-600 rounded-full w-5 h-5"></span>
            </div>
          )}

          {isSuccess && (
            <div className="flex-1 flex items-center  gap-2 rounded-lg bg-white justify-center text-green-600/70 font-medium">
              Your account has been safely disconnected
              <Check className="w-6 h-6 mr-2 text-" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
