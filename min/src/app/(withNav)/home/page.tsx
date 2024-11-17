"use client";
import React from "react";
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
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function Home() {
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
      <Sheet>
        <SheetTrigger>
          <div className="absolute top-3 right-36 h-16 w-16">
            <div className="flex gap-2">
              <Image
                src="/profile.png"
                width={500}
                height={500}
                alt="Picture of the user"
                className="rounded-full w-14 h-14"
              />
              <div className="mt-2 flex-row">
                <div className="w-36 justify-start flex">Iron Man</div>
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
          </SheetHeader>
        </SheetContent>
      </Sheet>
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
