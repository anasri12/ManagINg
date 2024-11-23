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
import RenderMode from "../dynamic/RenderMode";
import SideBar from "../general/SideBar";

export default function AdminNavBar({ session }: { session: Session | null }) {
  return (
    <div className="flex flex-col">
      <div className="flex gap-40 pt-3 mb-5">
        <div className="font-inria font-normal text-5xl pl-11 [text-shadow:_0_2px_4px_rgb(0_0_0_/_0.3)]">
          <Link href={"/home"}>ManagINg</Link>
        </div>
        <NavigationMenu className="pt-2 pl-12">
          <NavigationMenuList>
            <NavigationMenuItem>
              <Link href="/management" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Management
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/logs" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Logs
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/InboxAdmin" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Inbox
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/userMode" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  User Mode
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      {session && session.user?.name ? (
        <SideBar session={session} />
      ) : (
        <RenderMode />
      )}
      <div className="w-auto h-px bg-[#d4afaf] border-1 rounded-md mx-12"></div>
    </div>
  );
}