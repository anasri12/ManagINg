"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function Inbox() {
  const { data: session } = useSession();
  const userID = session?.user.id;

  const [loading, setLoading] = useState(true);
  const [inboxes, setInboxes] = useState<
    {
      ID: number;
      Permission?: "View" | "Edit";
      Status?: "Pending" | "Accepted" | "Rejected";
      ResolvedAt?: Date;
      Inventory_Name: string;
      Collaborator_Username: string;
      Owner_Username: string;
      Owner_ID: string;
    }[]
  >([]);

  useEffect(() => {
    const fetchInventories = async () => {
      try {
        if (session) {
          const response = await fetch(
            `/api/users/${userID}/collaborations?order=DESC`
          );
          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }
          const data = await response.json();
          setInboxes(data);
        }
      } catch (err) {
        console.error("Error fetching collaborations:", err);
        alert("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };

    fetchInventories();
  }, [session, userID]);

  const handleStatusChange = async (
    ID: number,
    status: "Accepted" | "Rejected"
  ) => {
    try {
      console.log("Updating collaboration:", { ID, status }); // Debugging log

      const response = await fetch(
        `/api/users/${userID}/collaborations/${ID}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ Status: status }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from API:", errorData); // Log API response
        throw new Error("Failed to update collaboration status");
      }

      setInboxes((prev) =>
        prev.map((inbox) =>
          inbox.ID === ID ? { ...inbox, Status: status } : inbox
        )
      );
    } catch (error) {
      console.error(`Error updating collaboration to ${status}:`, error);
      alert(
        `Failed to update collaboration status to ${status}. Please try again.`
      );
    }
  };

  const generateMessage = (inbox: (typeof inboxes)[0]): string => {
    if (session?.user.id === inbox.Owner_ID) {
      if (inbox.Status === "Pending") {
        return `You invited ${inbox.Collaborator_Username} to join ${inbox.Inventory_Name} inventory.`;
      } else if (inbox.Status === "Accepted") {
        return `${inbox.Collaborator_Username} has joined your ${inbox.Inventory_Name} inventory.`;
      } else {
        return `${inbox.Collaborator_Username} rejected the invitation to your ${inbox.Inventory_Name} inventory.`;
      }
    } else {
      if (inbox.Status === "Pending") {
        return `${inbox.Owner_Username} invites you to join ${inbox.Inventory_Name} inventory.`;
      } else if (inbox.Status === "Accepted") {
        return `Welcome to ${inbox.Inventory_Name} inventory of ${inbox.Owner_Username}.`;
      } else {
        return `You declined the invitation to ${inbox.Inventory_Name} inventory of ${inbox.Owner_Username}.`;
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
          inboxes.map((inbox) => (
            <div
              key={inbox.ID}
              className="flex items-center justify-between border-b py-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 flex items-center justify-center">
                  <Image
                    src={
                      inbox.Status === "Pending"
                        ? "/invite.jpg"
                        : inbox.Status === "Accepted"
                        ? "/accept.png"
                        : "/reject.png"
                    }
                    width={200}
                    height={200}
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
                    Permission: {inbox.Permission || "N/A"}, Status:{" "}
                    {inbox.Status || "N/A"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              {inbox.Status === "Pending" &&
                session?.user.id !== inbox.Owner_ID && (
                  <div className="flex gap-3">
                    <Button
                      className="bg-red-600 text-white hover:bg-red-700 px-4 py-2"
                      onClick={() => handleStatusChange(inbox.ID, "Accepted")}
                    >
                      Accept
                    </Button>
                    <Button
                      className="bg-gray-200 text-black hover:bg-gray-300 px-4 py-2"
                      onClick={() => handleStatusChange(inbox.ID, "Rejected")}
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
    </div>
  );
}
