"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ReportInterface } from "@/app/zods/db/report";

interface Message {
  id: number;
  content: string;
  status: "Open" | "Resolved";
  sentDate: string;
  resolvedAt?: string | null;
  response?: string | null;
}

export default function ContactAdmin() {
  const { data: session } = useSession();
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const userID = session?.user.id;

  useEffect(() => {
    const fetchMessages = async () => {
      if (!userID) return;

      try {
        const response = await fetch(`/api/users/${userID}/reports`);
        if (!response.ok) {
          throw new Error("Failed to fetch messages.");
        }

        const data = await response.json();
        const formattedMessages = data.map((msg: ReportInterface["full"]) => ({
          id: msg.ID,
          content: msg.Message,
          status: msg.Status,
          sentDate: new Date(msg.CreatedAt).toLocaleString(),
          resolvedAt: msg.ResolvedAt
            ? new Date(msg.ResolvedAt).toLocaleString()
            : null,
          response: msg.Response,
        }));
        setMessages(formattedMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [userID]);

  const handleSubmit = async () => {
    if (message.trim() === "") return;

    try {
      const response = await fetch(`/api/users/${userID}/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          User_ID: userID,
          Message: message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit the message.");
      }

      const newMessage = await response.json();
      setMessages((prevMessages) => [
        {
          id: newMessage.reportID,
          content: message,
          status: "Open",
          sentDate: new Date().toLocaleString(),
        },
        ...prevMessages,
      ]);
      setMessage("");
    } catch (error) {
      console.error("Error submitting message:", error);
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
        <Link href="/inbox">
          <Button className="bg-gray-200 text-black hover:bg-gray-300 px-6 py-2">
            Notification
          </Button>
        </Link>
        <Button className="bg-red-600 text-white hover:bg-red-700 px-6 py-2">
          Contact Admin
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
              Sent date: {msg.sentDate}
            </p>
            {msg.resolvedAt && (
              <p className="text-sm text-gray-500">
                Resolved date: {msg.resolvedAt}
              </p>
            )}
            {msg.response && (
              <p className="text-sm text-gray-700 mt-1">
                Admin Response: {msg.response}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Input Section */}
      <div className="fixed bottom-0 left-0 w-full bg-white shadow-lg px-6 py-4">
        <div className="flex items-center max-w-6xl gap-4 mx-auto">
          <textarea
            placeholder="Type your report/question here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-grow p-3 border rounded-lg focus:ring-2 focus:ring-red-600 focus:outline-none"
          />
          <Button
            className="bg-red-600 text-white hover:bg-red-700 px-4 py-2"
            onClick={handleSubmit}
            disabled={message.trim() === ""}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
