// app/signin/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/navbar";

export default function SignInPage() {
  const [identifier, setIdentifier] = useState(""); // Stores username/email
  const [password, setPassword] = useState(""); // Stores password
  const [error, setError] = useState(""); // Stores error messages
  const [isLoading, setIsLoading] = useState(false); // Tracks if the request is loading
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Reset error message on new submit attempt

    // Call NextAuth signIn function
    const result = await signIn("credentials", {
      redirect: false, // Prevent automatic redirect after login
      identifier,
      password,
    });

    setIsLoading(false);

    if (result?.error) {
      setError("Invalid username/email or password"); // Display error message if login fails
    } else {
      // Redirect to the home page or wherever you want after login
      router.push("/home");
    }
  };

  return (
    <div
      className="h-screen overflow-hidden flex flex-col" // Full height, no scroll, flex layout
    >
      <NavBar role="user" sign="signin"></NavBar>
      <div className="mt-32 flex items-center justify-center ">
        <div className="p-6 border rounded-md shadow-md max-w-md w-full">
          <h1 className="text-3xl font-semibold text-center mb-6">Sign In</h1>

          {/* Login form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="identifier" className="block text-gray-700">
                Username or Email
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-700"
                required
              />
            </div>

            {/* Display error message if login fails */}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              className={`w-full mt-4 py-2 px-4 text-white bg-red-600 rounded-md hover:bg-red-700 ${
                isLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>
          </form>

          {/* Link to signup page */}
          <p className="mt-4 text-center text-sm">
            Don&apos;t have an account?{" "}
            <a href="/signup" className="text-red-600 hover:underline">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
