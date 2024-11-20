"use client";
import { useSession } from "next-auth/react";

import Image from "next/image";
import { Loading } from "@/components/loading";
import NavBar from "@/components/navbar";

export default function Inbox() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Loading></Loading>;
  }

  return (
    <div>
      {session ? (
        <div
          className="h-screen overflow-hidden flex flex-col" // Full height, no scroll, flex layout
        >
          <NavBar role="user" sign="signup"></NavBar>
          <div className="font-inria font-normal mt-8 text-5xl pl-11 [text-shadow:_0_2px_4px_rgb(0_0_0_/_0.3)]">
            Inbox
          </div>
        </div>
      ) : (
        <div>Login First</div>
      )}
    </div>
  );
}
