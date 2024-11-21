"use client";
import { useSession } from "next-auth/react";

import Loading from "@/components/general/Loading";

export default function Inbox() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <Loading></Loading>;
  }

  return (
    <>
      <div className="font-inria font-normal mt-8 text-5xl pl-11 [text-shadow:_0_2px_4px_rgb(0_0_0_/_0.3)]">
        Inbox
      </div>
    </>
  );
}
