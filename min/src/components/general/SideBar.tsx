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

export default function SideBar({ session }: { session: Session }) {
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
              <div className="w-36 justify-start flex text-gray-500 text-sm">
                Personal
              </div>
            </div>
          </div>
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>MENU</SheetTitle>
        </SheetHeader>
        <div className="mt-3 flex flex-col gap-3">
          <Link href={"/personal"}>Personal</Link>
          <Link href={"/group/1"}>Group 1</Link>
          <Link href={"/group/2"}>Group 2</Link>
          <Link href={"/personal"}>Add/Create Group</Link>
          <Link href={"/personal"}>Setting</Link>
          <SignOutButton />
        </div>
      </SheetContent>
    </Sheet>
  );
}
