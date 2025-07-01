"use client";
import { useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setHasNew } from "@/lib/features/platformStatusSlice";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import { useAuth } from "@/app/context/AuthProvider";

export default function GmailListener({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch();
  const seenHistoryIds = useRef<Set<string>>(new Set());
  const toastShownRef = useRef(false); // for debounce
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const supabase = createClient();

    const channel = supabase
      .channel("gmail-updates")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "user_integrations",
        },
        (payload) => {
          const newHistoryId = payload.new?.metadata?.historyId?.toString();
          const payloadUserId = payload.new?.user_id;
          const currentUserId = user.id;

          if (!newHistoryId || payloadUserId !== currentUserId) {
            return;
          }

          if (seenHistoryIds.current.has(newHistoryId)) {
            return;
          }

          seenHistoryIds.current.add(newHistoryId);

          dispatch(setHasNew({ platformId: "gmail", hasNew: true }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, dispatch]);

  return <>{children}</>;
}
