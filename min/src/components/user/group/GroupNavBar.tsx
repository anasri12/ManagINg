"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Use for redirection
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import SideBar from "@/components/general/SideBar";
import RenderMode from "@/components/dynamic/RenderMode";
import { Session } from "next-auth";
import RenderGroupMemberState from "@/components/dynamic/RenderGroupMemberState";
import { OrganizationWithMemberInterface } from "@/app/zods/db/subquery/organizationWithMember";

export default function GroupNavBar({
  session,
  groupID,
}: {
  session: Session | null;
  groupID: string;
}) {
  const router = useRouter();
  const userID = session?.user.id;
  const [groups, setGroups] = useState<OrganizationWithMemberInterface[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        if (session) {
          const response = await fetch(
            `/api/users/${userID}/organizations/${groupID}?fields=Name,Role`
          );

          if (!response.ok) {
            throw new Error(`Group not found: ${response.statusText}`);
          }

          const data = await response.json();

          if (!data || data.length === 0) {
            throw new Error("Group not found");
          }

          setGroups(data);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [userID, groupID, session]);

  useEffect(() => {
    // Redirect if there's an error
    if (error) {
      alert(error); // Optionally display an alert or toast message
      router.back(); // Redirect to the previous page
    }
  }, [error, router]);

  if (loading) {
    return <div>Loading...</div>; // Optionally use a spinner or loading component
  }

  if (error) {
    return null; // The redirection will handle navigation
  }

  return (
    <div className="flex flex-col">
      <div className="flex gap-40 pt-3 mb-5">
        <div className="font-inria font-normal text-5xl pl-11 [text-shadow:_0_2px_4px_rgb(0_0_0_/_0.3)]">
          <Link href={`/group/${groupID}`}>ManagINg</Link>
        </div>
        <NavigationMenu className="pt-2 pl-12">
          <NavigationMenuList>
            <RenderGroupMemberState groupID={groupID} />
            {session &&
            groups &&
            (groups[0].Role === "Member" || groups[0].Role === "Staff") ? (
              <></>
            ) : session && groups ? (
              <NavigationMenuItem>
                <Link
                  href={`/group/${groupID}/management`}
                  legacyBehavior
                  passHref
                >
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Management
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ) : (
              <></>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      {session && groups ? (
        <SideBar session={session} groupName={groups[0].Name} />
      ) : (
        <RenderMode />
      )}
      <div className="w-auto h-px bg-[#d4afaf] border-1 rounded-md mx-12"></div>
    </div>
  );
}
