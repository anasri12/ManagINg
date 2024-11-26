"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { ContactInterface } from "@/app/zods/db/contact";

interface Message {
  id: number;
  content: string;
  status: "Open" | "Resolved";
  sentDate: string;
  username: string;
  reply?: {
    content: string;
    dev: string;
    replyDate: string;
  };
}

export default function DevInbox() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingMessageId, setReplyingMessageId] = useState<number | null>(
    null
  );
  const [reply, setReply] = useState<string>("");

  const devID = session?.user.id;

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch("/api/contacts");
        if (!response.ok) {
          throw new Error("Failed to fetch contacts.");
        }

        const data = await response.json();
        const formattedMessages = data.map(
          (contact: ContactInterface["full"]) => ({
            id: contact.ID,
            content: contact.Message,
            status: contact.Status === "Open" ? "Open" : "Resolved",
            sentDate: new Date(contact.CreatedAt).toLocaleString(),
            username: devID || "Unknown", // Replace with Admin username if available
            reply: contact.Response
              ? {
                  content: contact.Response,
                  dev: contact.ResolvedByDev || "Unknown Dev",
                  replyDate: contact.ResolvedAt
                    ? new Date(contact.ResolvedAt).toLocaleString()
                    : "",
                }
              : undefined,
          })
        );
        setMessages(formattedMessages);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const handleMarkSolved = async (id: number) => {
    if (
      confirm(
        "Are you sure you want to mark this message as solved? This action cannot be undone."
      )
    ) {
      try {
        const response = await fetch(`/api/contacts/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Status: "Resolved",
            Response: reply || "-",
            ResolvedByDev: devID,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update the contact.");
        }

        window.location.reload();
      } catch (error) {
        console.error("Error updating contact:", error);
      }
    }
  };

  const handleSendReply = async (id: number) => {
    const replyDate = new Date().toLocaleString();

    if (
      confirm(
        "Are you sure you want to send this reply and mark the message as solved?"
      )
    ) {
      try {
        const response = await fetch(`/api/contacts/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Status: "Resolved",
            Response: reply,
            ResolvedByAdmin: devID,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to update the contact.");
        }

        window.location.reload();
      } catch (error) {
        console.error("Error updating contact:", error);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-28 py-6 px-6">
      {/* Header */}
      <div className="font-inria text-5xl mb-8">Dev Inbox</div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-6">
        <Button className="bg-red-600 text-white hover:bg-red-700 px-6 py-2">
          Report / Question from Admin
        </Button>
      </div>

      {/* Messages Section */}
      <div className="space-y-4 mb-20">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col rounded-lg shadow-md p-4 border ${
              msg.status === "Resolved"
                ? "bg-green-100 border-green-300"
                : "bg-red-100 border-red-300"
            }`}
          >
            <p
              className={`font-semibold ${
                msg.status === "Resolved" ? "text-green-700" : "text-red-700"
              }`}
            >
              {msg.status}
            </p>
            <p className="mt-2 text-gray-800">{msg.content}</p>
            <p className="text-sm text-gray-500 mt-2">
              Sent by: {msg.username}
            </p>
            <p className="text-sm text-gray-500">Sent date: {msg.sentDate}</p>
            {msg.reply && (
              <div className="mt-2 text-gray-800">
                <p className="text-blue-700">
                  Developer reply: {msg.reply.content}
                </p>
                <p className="text-sm text-gray-500">
                  Replied by: {msg.reply.dev} on {msg.reply.replyDate}
                </p>
              </div>
            )}
            {!msg.reply && msg.status !== "Resolved" && (
              <div className="flex gap-4 mt-4">
                <Button
                  className="bg-green-600 text-white hover:bg-green-700 px-4 py-2"
                  onClick={() => handleMarkSolved(msg.id)}
                >
                  Mark as Solved
                </Button>
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2"
                  onClick={() => setReplyingMessageId(msg.id)}
                >
                  Reply
                </Button>
              </div>
            )}
            {replyingMessageId === msg.id && msg.status !== "Resolved" && (
              <div className="mt-4">
                <textarea
                  placeholder="Type your reply here..."
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
                <div className="flex gap-4 mt-4">
                  <Button
                    className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2"
                    onClick={() => handleSendReply(msg.id)}
                    disabled={reply.trim() === ""}
                  >
                    Send Reply
                  </Button>
                  <Button
                    className="bg-gray-200 text-black hover:bg-gray-300 px-4 py-2"
                    onClick={() => setReplyingMessageId(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
