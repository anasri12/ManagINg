"use client";
import React from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div>
      <div className="flex gap-36 pt-3">
        <div className="font-serif font-normal text-5xl pl-11">
          <Link href={"/home"}>ManagINg</Link>
        </div>
        <NavigationMenu className="pt-2">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/newInventory" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  New / Create Inventory
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/myInventory" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  My Inventory
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/Inbox" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Inbox
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      {session && session.user?.name ? (
        <Sheet>
          <SheetTrigger>
            <div
              className="absolute top-3 right-36 h-16 w-16"
              style={{
                right: `${Math.min(session.user?.name.length * 15 || 0)}px`, // Move the entire div right based on name length
              }}
            >
              <div className="flex gap-2">
                <Image
                  src={session.user?.image || "/profile.png"} // Use session image
                  width={500}
                  height={500}
                  alt="Picture of the user"
                  className="rounded-full w-14 h-14"
                />
                <div className="mt-2 flex-row">
                  <div className="w-36 justify-start flex">
                    {session.user?.name || "User"} {/* User name */}
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
              <SheetTitle>Profile</SheetTitle>
              <button
                onClick={() => signOut()} // Sign Out Button
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
              >
                Sign Out
              </button>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ) : (
        <div className="mb-5">
          <div className="absolute top-5 right-20 flex gap-4">
            <button className="px-4 py-2">
              <Link href={"/signIn"}>Log In</Link>
            </button>
            <button className="px-4 py-2 bg-red-500 text-white rounded">
              <Link href={"/signUp"}>Sign Up</Link>
            </button>
          </div>
        </div>
      )}
      <div className="w-auto h-px bg-black border-0 dark:bg-gray-700 mx-12"></div>
      <div className="flex justify-center mt-10 font-serif font-thin text-8xl">
        <div className="flex flex-col justify-center gap-10">
          <div className="mb-2">Better management </div>
          <div className="flex justify-center">is better life.</div>
        </div>
      </div>
      <div className="mt-5 flex justify-center">
        <Image
          src="/home.jpg"
          width={1618}
          height={1052}
          alt="Picture of the user"
          className="w-auto h-auto"
        ></Image>
      </div>
    </div>
  );
}
