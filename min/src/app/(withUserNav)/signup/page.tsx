"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Loading from "@/components/general/Loading";

export default function SignupPage() {
  const { data: session, status } = useSession();
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [cpassword, setCPassword] = useState<string>(""); // Confirm password
  const [errorMessages, setErrorMessages] = useState<string[]>([]); // Store error messages
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/home");
    }
  }, [session, router]);

  if (status === "loading") {
    return <Loading />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessages([]);
    setIsSubmitting(true);

    const response = await fetch("/api/users", {
      method: "POST",
      body: JSON.stringify({ username, email, password, cpassword }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      router.push("/signin");
    } else {
      if (data.errors && Array.isArray(data.errors)) {
        // Extract and display specific error messages from Zod validation
        setErrorMessages(
          data.errors.map((err: { message: string }) => err.message)
        );
      } else {
        setErrorMessages([data.error || "Failed to create account"]);
      }
    }

    setIsSubmitting(false);
  };

  return (
    <>
      <div className="h-[80vh] flex items-center justify-center ">
        <form
          onSubmit={handleSubmit}
          className="p-6 border rounded-md shadow-md max-w-md w-full"
        >
          <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
          {errorMessages.length > 0 && (
            <div className="text-red-500 mb-4">
              {errorMessages.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          )}
          <div className="mb-4">
            <label className="block text-gray-700">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              value={cpassword}
              onChange={(e) => setCPassword(e.target.value)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-4 py-2 px-4 text-white bg-red-600 rounded-md hover:bg-red-700 "
          >
            {isSubmitting ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
      </div>
    </>
  );
}
