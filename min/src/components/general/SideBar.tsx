"use client";
import { Session } from "next-auth";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import Image from "next/image";
import SignOutButton from "./SignOutButton";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SideBar({
  session,
  state,
}: {
  session: Session;
  state?: "dev" | "admin";
}) {
  return (
    <Sheet>
      <SheetTrigger>
        <div
          className="absolute top-3 right-36 h-16 w-16"
          style={{
            right: `${Math.min(session.user?.name.length * 15 || 0)}px`,
          }}
        >
          <div className="flex gap-2">
            <Image
              src={session.user?.image || "/profile.png"}
              width={500}
              height={500}
              alt="Picture of the user"
              className="rounded-full w-14 h-14"
            />
            <div className="mt-2 flex-row">
              <div className="w-36 justify-start flex">
                {session.user?.name || "User"}
              </div>
              {state === "admin" ? (
                <div className="w-36 justify-start flex text-red-500 text-sm">
                  Admin
                </div>
              ) : state === "dev" ? (
                <div className="w-36 justify-start flex text-red-500 text-sm">
                  Dev
                </div>
              ) : (
                <div className="w-36 justify-start flex text-gray-500 text-sm">
                  Personal
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>MENU</SheetTitle>
        </SheetHeader>
        <div className="mt-3 flex flex-col">
          <Link href={"/profile"} className="mb-2">
            Profile
          </Link>
          <SignOutButton />
        </div>
      </SheetContent>
    </Sheet>
  );
}
