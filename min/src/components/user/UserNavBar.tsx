"use client";
import React from "react";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "../ui/navigation-menu";
import { Session } from "next-auth";
import SideBar from "../general/SideBar";
import RenderUserState from "../dynamic/RenderUserState";
import RenderMode from "../dynamic/RenderMode";

export default function UserNavBar({ session }: { session: Session | null }) {
  return (
    <div className="flex flex-col">
      <div className="flex gap-40 pt-3 mb-5">
        <div className="font-inria font-normal text-5xl pl-11 [text-shadow:_0_2px_4px_rgb(0_0_0_/_0.3)]">
          <Link href={"/home"}>ManagINg</Link>
        </div>
        <NavigationMenu className="pt-2 pl-12">
          <NavigationMenuList>
            <RenderUserState />
            {session && session.user.role === "Admin" ? (
              <NavigationMenuItem>
                <Link href="/admin" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Admin Mode
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ) : session && session?.user.role === "Developer" ? (
              <NavigationMenuItem>
                <Link href="/dev" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Dev Mode
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ) : (
              <></>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      {session && session.user?.name ? (
        <SideBar session={session} />
      ) : (
        <RenderMode />
      )}
      <div className="w-auto h-px bg-[#a9a9a9] border-1 rounded-md mx-12 shadow-xl"></div>
    </div>
  );
}
