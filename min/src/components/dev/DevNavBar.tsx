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
import RenderMode from "../dynamic/RenderMode";

export default function DevNavBar({ session }: { session: Session | null }) {
  return (
    <div className="flex flex-col">
      <div className="flex gap-40 pt-3 mb-5">
        <div className="font-inria font-normal text-5xl pl-11 [text-shadow:_0_2px_4px_rgb(0_0_0_/_0.3)]">
          <Link href={"/home"}>ManagINg</Link>
        </div>
        <NavigationMenu className="pt-2 pl-12">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/dev/apiUsage" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  API Uasge
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/dev/inboxDev" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Inbox
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/home" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  User Mode
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      {session && session.user?.name ? (
        <SideBar session={session} state="dev" />
      ) : (
        <RenderMode />
      )}
      <div className="w-auto h-px bg-[#a9a9a9] border-1 rounded-md mx-12"></div>
    </div>
  );
}
