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
      } catch (err: unknown) {
        console.log(err);
      }
    };

    fetchGroups();
  }, [session, userID]);
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
        <div className="mt-3 flex flex-col">
          <Link href={"/profile"} className="mb-2">
            Profile
          </Link>
          {groupName ? (
            <Link href={"/home"} className="mb-2">
              Personal
            </Link>
          ) : (
            <></>
          )}
          {groups.length !== 0 ? (
            <>
              <div className="mb-1">Group</div>
              <div className="w-auto h-px bg-[#a9a9a9] border-1 rounded-md mb-1"></div>
              <ul className="mb-2 pl-5">
                {groups.map((group) => (
                  <Link
                    href={`/group/${group.Code}`}
                    key={group.Code}
                    className="mb-2"
                  >
                    {group.Name}
                  </Link>
                ))}
              </ul>
            </>
          ) : (
            <></>
          )}

          <Link href={"/addGroup"} className="mb-2">
            Add/Create Group
          </Link>
          <SignOutButton />
        </div>
      </SheetContent>
    </Sheet>
  );
}
