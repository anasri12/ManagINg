"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { CollaborationInterface } from "@/app/zods/db/collaboration";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Inbox() {
  const { data: session } = useSession();
  const userID = session?.user.id;
  const [loading, setLoading] = useState(true);
  const [inboxes, setInboxes] = useState<CollaborationInterface["full"][]>([]);

  useEffect(() => {
    const fetchInventories = async () => {
      try {
        if (session) {
          const response = await fetch(`/api/users/${userID}/collaborations`);
          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }
          const data = await response.json();
          setInboxes(data);
          setLoading(false);
        }
      } catch (err: any) {
        console.error(err.message);
      }
    };

    fetchInventories();
  }, [userID]);

  const handleAccept = (ID: number) => {
    setInboxes((prev) =>
      prev.map((inbox) =>
        inbox.ID === ID ? { ...inbox, Status: "Accepted" } : inbox
      )
    );
  };

  const handleReject = (ID: number) => {
    setInboxes((prev) =>
      prev.map((inbox) =>
        inbox.ID === ID ? { ...inbox, Status: "Rejected" } : inbox
      )
    );
  };

  const generateMessage = (inbox: CollaborationInterface["full"]): string => {
    if (session?.user.id === inbox.Owner_ID) {
      if (inbox.Status === "Pending") {
        return `You invited ${inbox.Collaborator_Username} to join ${inbox.Inventory_Name} inventory`;
      } else if (inbox.Status === "Accepted") {
        return `${inbox.Collaborator_Username} has joined your ${inbox.Inventory_Name} inventory`;
      } else {
        return `${inbox.Collaborator_Username} rejected the invitation to your ${inbox.Inventory_Name} inventory`;
      }
    } else {
      if (inbox.Status === "Pending") {
        return `${inbox.Owner_Username} invites you to join ${inbox.Inventory_Name} inventory`;
      } else if (inbox.Status === "Accepted") {
        return `Welcome to ${inbox.Inventory_Name} inventory of ${inbox.Owner_Username}`;
      } else {
        return `You declined invitation to ${inbox.Inventory_Name} inventory of ${inbox.Owner_Username}`;
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-28 py-6 px-6">
      {/* Header */}
      <div className="font-inria text-5xl font-bold mb-8">Inbox</div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-6">
        <Button className="bg-red-600 text-white hover:bg-red-700 px-6 py-2">
          Notification
        </Button>
        <Link href="/inbox/contactAdmin">
          <Button className="bg-gray-200 text-black hover:bg-gray-300 px-6 py-2">
            Contact Admin
          </Button>
        </Link>
      </div>

      {/* Notification List */}
      <div className="space-y-6">
        {inboxes.length > 0 ? (
          inboxes.map((inbox, index) => (
            <div
              key={index}
              className="flex items-center justify-between border-b py-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 flex items-center justify-center">
                  <img
                    src={
                      inbox.Status === "Pending"
                        ? "invite.jpg"
                        : inbox.Status === "Accepted"
                        ? "accept.png"
                        : "reject.png"
                    }
                    alt="Notification Icon"
                    className="w-10 h-10"
                  />
                </div>

                {/* Notification Text */}
                <div>
                  <p className="font-semibold text-lg">
                    {generateMessage(inbox)}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Permission: {inbox.Permission}, Status: {inbox.Status}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              {inbox.Status === "Pending" &&
                session?.user.id !== inbox.Owner_ID && (
                  <div className="flex gap-3">
                    <Button
                      className="bg-red-600 text-white hover:bg-red-700 px-4 py-2"
                      onClick={() => handleAccept(inbox.ID)}
                    >
                      Accept
                    </Button>
                    <Button
                      className="bg-gray-200 text-black hover:bg-gray-300 px-4 py-2"
                      onClick={() => handleReject(inbox.ID)}
                    >
                      Reject
                    </Button>
                  </div>
                )}
            </div>
          ))
        ) : (
          <div className="text-center text-gray-600 mt-8">
            No notifications available.
          </div>
        )}
      </div>

      {/* Footer for Group Invitations */}
      <div className="mt-10">
        <div className="font-inria text-2xl font-semibold mb-4">
          Group Invitation
        </div>
        <div className="text-gray-600">
          You currently have no group invitations.
        </div>
      </div>
    </div>
  );
}
