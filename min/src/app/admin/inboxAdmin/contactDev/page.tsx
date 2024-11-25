"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Message {
  id: number;
  content: string;
  status: "On process" | "Problem solved";
  sentDate: string;
  reply?: {
    content: string;
    admin: string;
    replyDate: string;
  };
}

export default function UserInbox() {
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSubmit = () => {
    if (message.trim() === "") return;

    const newMessage: Message = {
      id: messages.length + 1,
      content: message,
      status: "On process",
      sentDate: new Date().toLocaleString(),
    };

    setMessages((prevMessages) => [newMessage, ...prevMessages]);
    setMessage("");
  };

  return (
    <div className="container mx-28 py-6 px-6">
      {/* Header */}
      <div className="font-inria text-5xl font-bold mb-8">Admin Inbox</div>

      {/* Navigation Tabs */}
      <div className="flex gap-4 mb-6">
        <Link href="/admin/inboxAdmin">
          <Button className="bg-gray-200 text-black hover:bg-gray-300 px-6 py-2">
            Notification
          </Button>
        </Link>
        <Button className="bg-red-600 text-white hover:bg-red-700 px-6 py-2">
          Contact developer
        </Button>
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
              Sent date: {msg.sentDate}
            </p>
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
