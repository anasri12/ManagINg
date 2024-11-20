"use client";

import { Loading } from "@/components/loading";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <Loading />; // Loading state while session is being fetched
  }

  if (!session) {
    // If no session, redirect to login or show a message
    router.push("/signIn");
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h1 className="text-3xl font-semibold mb-4">Profile</h1>
      <div className="flex gap-8 items-center">
        <Image
          src={session.user?.image || "/profile.png"}
          alt="Profile Picture"
          width={150}
          height={150}
          className="rounded-full"
        />
        <div>
          <h2 className="text-2xl">{session.user?.name}</h2>
          <p className="text-gray-500">{session.user?.email}</p>
        </div>
      </div>
      <div className="mt-6">
        <h3 className="text-xl">Session Information</h3>
        <pre className="bg-gray-100 p-4 rounded-lg mt-2">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>
    </div>
  );
}
