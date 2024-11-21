"use client";
import { usePathname } from "next/navigation";
import {
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "../ui/navigation-menu";
import Link from "next/link";
import { cva } from "class-variance-authority";

const selectNav = cva(
  "group inline-flex h-9 w-max items-center justify-center font-bold rounded-md bg-background px-4 py-2 text-lg transition-colors disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
);

export default function RenderUserState() {
  const pathname = usePathname();

  if (pathname.startsWith("/newInventory"))
    return (
      <>
        <NavigationMenuItem>
          <Link href="/newInventory" legacyBehavior passHref>
            <NavigationMenuLink className={selectNav()}>
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
          <Link href="/inbox" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Inbox
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </>
    );
  else if (pathname.startsWith("/myInventory"))
    return (
      <>
        <NavigationMenuItem>
          <Link href="/newInventory" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              New / Create Inventory
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/myInventory" legacyBehavior passHref>
            <NavigationMenuLink className={selectNav()}>
              My Inventory
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href="/inbox" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Inbox
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </>
    );
  else if (pathname.startsWith("/inbox"))
    return (
      <>
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
          <Link href="/inbox" legacyBehavior passHref>
            <NavigationMenuLink className={selectNav()}>
              Inbox
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </>
    );
  else
    return (
      <>
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
          <Link href="/inbox" legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Inbox
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </>
    );
}
