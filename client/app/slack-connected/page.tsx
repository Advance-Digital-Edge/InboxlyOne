"use client";

import { useEffect, useState } from "react";

export default function SlackConnected() {
  const [loading, setLoading] = useState<boolean>(true);
  const [slackData, setSlackData] = useState<any>(null);

  useEffect(() => {
    const fetchSlackData = async () => {
      try {
        const res = await fetch("/api/get-session");
        const { user } = await res.json();

        if (!user) return;

        const slackRes = await fetch("/api/slack/user", {
          headers: {
            "x-user-id": user.id
          }
        });

        const data = await slackRes.json();
        setSlackData(data);
      } catch (error) {
        console.error("Error fetching Slack data:", error);
      } finally {
        if (slackData) {
          setSlackData(null);
          setLoading(true);
        } else {
          setLoading(false);
        }
      }
    };

    fetchSlackData();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Slack Connected</h1>
      {loading ? (
        <p className="text-lg">Loading Slack data...</p>
      ) : (
        <div className="mt-4 p-4 bg-white shadow-md rounded-lg">
          <h2 className="text-xl font-semibold">Slack User Info</h2>
          <p>
            <strong>Name:</strong> {slackData.profile.real_name}
          </p>
          <p>
            <strong>Slack ID:</strong> {slackData.id}
          </p>
        </div>
      )}
    </div>
  );
}
