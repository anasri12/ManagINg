"use client";
import { useSession } from "next-auth/react";

import Loading from "@/components/general/Loading";
import { useEffect, useState } from "react";
import { CollaborationInterface } from "@/app/zods/db/collaboration";
import { Collaboration_Receiver, Collaboration_Sender } from "./collaboration";

export default function Inbox() {
  const { data: session } = useSession();
  const userID = session?.user.id;
  const [loading, setLoading] = useState(true);
  const [inboxes, setInboxes] = useState<CollaborationInterface["full"][]>([]);
  useEffect(() => {
    const fetchInventories = async () => {
      try {
        if (session) {
          const response = await fetch(`/api/users/${userID}/collaborations`);
          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }
          const data = await response.json();
          setInboxes(data);
          setLoading(false);
        }
      } catch (err: any) {
        console.log(err.message);
      }
    };

    fetchInventories();
  }, [userID]);
  if (loading) {
    return <Loading></Loading>;
  }

  return (
    <>
      <div className="font-inria font-normal mt-3 text-5xl pl-11 [text-shadow:_0_2px_4px_rgb(0_0_0_/_0.3)] mb-5">
        Inbox
      </div>
      <div className="font-inria font-normal text-xl [text-shadow:_0_2px_4px_rgb(0_0_0_/_0.3)] mb-2 ml-20">
        Collaboration
      </div>
      <ul className="mb-2 ml-32">
        {inboxes.map((inbox) => (
          <div className="flex flex-row gap-5">
            <div>
              {session?.user.id === inbox.Owner_ID ? (
                <>
                  {Collaboration_Sender(
                    inbox.Inventory_Name,
                    inbox.Collaborator_Username,
                    inbox.Permission
                  )}
                </>
              ) : (
                <>
                  {Collaboration_Receiver(
                    inbox.Inventory_Name,
                    inbox.Owner_Username,
                    inbox.Permission
                  )}
                </>
              )}
            </div>
            <div>{inbox.Status}</div>
          </div>
        ))}
      </ul>
      <div className="font-inria font-normal text-xl [text-shadow:_0_2px_4px_rgb(0_0_0_/_0.3)] mb-2 ml-20">
        Group Invitation
      </div>
    </>
  );
}
