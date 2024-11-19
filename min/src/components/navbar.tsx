import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet"; // Adjust based on your component structure
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "./ui/navigation-menu";

// Define role types
type Role = "user" | "admin" | "dev";

// Props for the Nav component
interface NavProps {
  role: Role;
}

// Utility for dynamic navigation link styling
const navigationMenuTriggerStyle = () => "some-class-styles";

const NavBar: React.FC<NavProps> = ({ role }) => {
  const { data: session } = useSession();

  const renderLinks = () => {
    switch (role) {
      case "dev":
        return (
          <>
            <NavigationMenuItem>
              <Link href="/devTools" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Dev Tools
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/bugReports" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Bug Reports
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </>
        );
      case "admin":
        return (
          <>
            <NavigationMenuItem>
              <Link href="/userManagement" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  User Management
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <Link href="/settings" legacyBehavior passHref>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Admin Settings
                </NavigationMenuLink>
              </Link>
            </NavigationMenuItem>
          </>
        );
      case "user":
      default:
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
  };

  return (
    <div className="flex flex-col">
      <div className="flex gap-44 pt-3 mb-5">
        <div className="font-inria font-normal text-5xl pl-11 [text-shadow:_0_2px_4px_rgb(0_0_0_/_0.3)]">
          <Link href={"/home"}>ManagINg</Link>
        </div>
        <NavigationMenu className="pt-2 pl-12">
          <NavigationMenuList className="gap-10">
            {renderLinks()}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      {session && session.user?.name ? (
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
              <SheetTitle>Profile</SheetTitle>
              <button
                onClick={() => signOut()}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
              >
                Sign Out
              </button>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      ) : (
        <div className="absolute top-5 right-20 flex gap-1">
          <button className="px-4 py-2">
            <Link href={"/signin"}>Login</Link>
          </button>
          <button className="px-1 bg-[#A91A1A] text-white rounded-lg">
            <Link href={"/signup"}>Sign-up</Link>
          </button>
        </div>
      )}
      <div className="w-auto h-px bg-[#d4afaf] border-1 rounded-md mx-12"></div>
    </div>
  );
};

export default NavBar;
