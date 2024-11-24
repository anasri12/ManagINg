"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Loading from "@/components/general/Loading";

export default function SignInPage() {
  const { data: session, status } = useSession();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
    setIsLoading(true);
    setError("");

    // Perform sign-in
    const result = await signIn("credentials", {
      redirect: false,
      identifier,
      password,
    });

    setIsLoading(false);

    if (result?.error) {
      setError("Invalid username/email or password");
    } else {
      window.location.reload();
    }
  };

  return (
    <>
      {!session ? (
        <div className="h-[80vh] flex items-center justify-center">
          <div className="p-6 border rounded-md shadow-md max-w-md w-full">
            <h1 className="text-3xl font-semibold text-center mb-6">Sign In</h1>

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

            <p className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="/signup" className="text-red-600 hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
