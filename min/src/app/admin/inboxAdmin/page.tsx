"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Message {
  id: number;
  content: string;
  status: "On process" | "Problem solved";
  sentDate: string;
  username: string; // Sender's username
  reply?: {
    content: string;
    admin: string;
    replyDate: string;
  };
}

export default function AdminInbox() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "User has a problem with login.",
      status: "On process",
      sentDate: new Date().toLocaleString(),
      username: "JohnDoe",
    },
  ]);
  const [replyingMessageId, setReplyingMessageId] = useState<number | null>(
    null
  );
  const [reply, setReply] = useState<string>("");

  const adminUsername = "AdminUser"; // Replace with dynamic admin username if available

  const handleReply = (id: number) => {
    setReplyingMessageId(id);
  };

  const handleMarkSolved = (id: number) => {
    if (
      confirm(
        "Are you sure you want to mark this message as solved? This action cannot be undone."
      )
    ) {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === id ? { ...msg, status: "Problem solved" } : msg
        )
      );
    }
  };

  const handleSendReply = (id: number) => {
    const replyDate = new Date().toLocaleString();

    if (
      confirm(
        "Are you sure you want to send this reply and mark the message as solved?"
      )
    ) {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === id
            ? {
                ...msg,
                status: "Problem solved",
                reply: {
                  content: reply,
                  admin: adminUsername,
                  replyDate,
                },
              }
            : msg
        )
      );
      setReply("");
      setReplyingMessageId(null);
    }
  };

  return (
    <div className="container mx-28 py-6 px-6">
      {/* Header */}
      <div className="font-inria text-5xl font-bold mb-8">Admin Inbox</div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-6">
        <Button className="bg-red-600 text-white hover:bg-red-700 px-6 py-2">
          Messages from Users
        </Button>
        <Link href="/admin/inboxAdmin/contactDev">
          <Button className="bg-gray-200 text-black hover:bg-gray-300 px-6 py-2">
            Contact Developer
          </Button>
        </Link>
      </div>

      {/* Messages Section */}
      <div className="space-y-4 mb-20">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col rounded-lg shadow-md p-4 border ${
              msg.status === "Problem solved"
                ? "bg-green-100 border-green-300"
                : "bg-red-100 border-red-300"
            }`}
          >
            <p
              className={`font-semibold ${
                msg.status === "Problem solved"
                  ? "text-green-700"
                  : "text-red-700"
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
                  Admin reply: {msg.reply.content}
                </p>
                <p className="text-sm text-gray-500">
                  Replied by: {msg.reply.admin} on {msg.reply.replyDate}
                </p>
              </div>
            )}
            {!msg.reply && msg.status !== "Problem solved" && (
              <div className="flex gap-4 mt-4">
                <Button
                  className="bg-green-600 text-white hover:bg-green-700 px-4 py-2"
                  onClick={() => handleMarkSolved(msg.id)}
                >
                  Mark as Solved
                </Button>
                <Button
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2"
                  onClick={() => handleReply(msg.id)}
                >
                  Reply
                </Button>
              </div>
            )}
            {replyingMessageId === msg.id &&
              msg.status !== "Problem solved" && (
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
