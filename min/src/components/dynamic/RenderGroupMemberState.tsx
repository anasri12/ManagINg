"use client";
import { usePathname } from "next/navigation";
import {
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from "../ui/navigation-menu";
import Link from "next/link";
import { cva } from "class-variance-authority";

export const selectNav = cva(
  "group inline-flex h-9 w-max items-center justify-center font-bold rounded-md bg-background px-4 py-2 text-lg transition-colors disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50"
);

export default function RenderGroupMemberState({
  groupID,
}: {
  groupID: string;
}) {
  const pathname = usePathname();

  if (pathname.startsWith(`/group/${groupID}/newInventory`))
    return (
      <>
        <NavigationMenuItem>
          <Link href={`/group/${groupID}/newInventory`} legacyBehavior passHref>
            <NavigationMenuLink className={selectNav()}>
              New / Create Group Inventory
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link
            href={`/group/${groupID}/groupInventory`}
            legacyBehavior
            passHref
          >
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Group Inventory
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href={`/group/${groupID}/groupInbox`} legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Inbox
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </>
    );
  else if (pathname.startsWith(`/group/${groupID}/groupInventory`))
    return (
      <>
        <NavigationMenuItem>
          <Link href={`/group/${groupID}/newInventory`} legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              New / Create Group Inventory
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link
            href={`/group/${groupID}/groupInventory`}
            legacyBehavior
            passHref
          >
            <NavigationMenuLink className={selectNav()}>
              Group Inventory
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href={`/group/${groupID}/groupInbox`} legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Inbox
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </>
    );
  else if (pathname.startsWith(`/group/${groupID}/groupInbox`))
    return (
      <>
        <NavigationMenuItem>
          <Link href={`/group/${groupID}/newInventory`} legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              New / Create Group Inventory
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link
            href={`/group/${groupID}/groupInventory`}
            legacyBehavior
            passHref
          >
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Group Inventory
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href={`/group/${groupID}/groupInbox`} legacyBehavior passHref>
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
          <Link href={`/group/${groupID}/newInventory`} legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              New / Create Group Inventory
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link
            href={`/group/${groupID}/groupInventory`}
            legacyBehavior
            passHref
          >
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Group Inventory
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <Link href={`/group/${groupID}/groupInbox`} legacyBehavior passHref>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Inbox
            </NavigationMenuLink>
          </Link>
        </NavigationMenuItem>
      </>
    );
}
