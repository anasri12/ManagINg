"use client";
import { useSession } from "next-auth/react";

import Image from "next/image";
import { Loading } from "@/components/loading";
import NavBar from "@/components/navbar";

export default function Home() {
  const { status } = useSession();

  if (status === "loading") {
    return <Loading></Loading>;
  }

  return (
    <div
      className="h-screen overflow-hidden flex flex-col" // Full height, no scroll, flex layout
    >
      <NavBar role="user"></NavBar>
      <div className="flex justify-center font-inria text-[78px] mt-5">
        <div className="flex flex-col justify-center">
          <div>Better management</div>
          <div className="flex justify-center">is better life.</div>
        </div>
      </div>
      <div className="flex justify-center">
        <Image
          src="/home.jpg"
          width={1618}
          height={1052}
          alt="Picture of the user"
          className="w-[700px] h-[450px]"
        ></Image>
      </div>
    </div>
  );
}
