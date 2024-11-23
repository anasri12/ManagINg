"use client";
import Loading from "@/components/general/Loading";
import { useSession } from "next-auth/react";

import Image from "next/image";

export default function Home() {
  const { status } = useSession();

  if (status === "loading") {
    return <Loading />;
  }

  return (
    <>
      <div className="flex justify-center font-inria text-[78px] mt-5">
        <div className="flex flex-col justify-center items-center">
          <div>Better management</div>
          <div>is better life.</div>
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
    </>
  );
}
