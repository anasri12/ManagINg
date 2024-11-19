"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/navbar";

export default function SignupPage() {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const response = await fetch("/api/signup", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      // Redirect to the login page after successful signup
      router.push("/signIn");
    } else {
      setError(data.error || "Failed to create account");
    }

    setIsSubmitting(false);
  };

  return (
    <div
      className="h-screen overflow-hidden flex flex-col" // Full height, no scroll, flex layout
    >
      <NavBar role="user"></NavBar>
      <div className="mt-20 flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="p-6 border rounded-md shadow-md max-w-md w-full"
        >
          <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
          {error && <div className="text-red-500 mb-4">{error}</div>}
          <div className="mb-4">
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white p-2 rounded-md"
          >
            {isSubmitting ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
