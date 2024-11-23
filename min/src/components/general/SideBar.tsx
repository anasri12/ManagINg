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
import { useEffect, useState } from "react";
import { OrganizationWithMemberInterface } from "@/app/zods/db/subquery/organizationWithMember";

export default function SideBar({
  session,
  groupName,
}: {
  session: Session;
  groupName?: string;
}) {
  const userID = session?.user.id;
  const [groups, setGroups] = useState<OrganizationWithMemberInterface[]>([]);
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        if (session) {
          const response = await fetch(
            `/api/users/${session.user.id}/organizations?fields=Code,Name`
          );
          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }
          const data = await response.json();
          setGroups(data);
        }
      } catch (err: any) {
        console.log(err.message);
      }
    };

    fetchGroups();
  }, [userID]);
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
              {groupName ? (
                <div className="w-36 justify-start flex text-gray-500 text-sm">
                  {groupName}
                </div>
              ) : (
                <div className="w-36 justify-start flex text-gray-500 text-sm">
                  Personal
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>MENU</SheetTitle>
        </SheetHeader>
        <div className="mt-3 flex flex-col gap-3">
          <Link href={"/profile"}>Profile</Link>
          {groupName ? <Link href={"/home"}>Personal</Link> : <></>}
          <ul>
            {groups.map((group) => (
              <Link href={`/group/${group.Code}`} key={group.Code}>
                {group.Name}
              </Link>
            ))}
          </ul>
          <Link href={"/addGroup"}>Add/Create Group</Link>
          <Link href={"/setting"}>Setting</Link>
          <SignOutButton />
        </div>
      </SheetContent>
    </Sheet>
  );
}
