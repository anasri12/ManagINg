"use client";

import { PersonalInventoryInterface } from "@/app/zods/db/personalInventory";
import Loading from "@/components/general/Loading";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MyInventory() {
  const { data: session, status } = useSession();
  const userID = session?.user.id;
  const [inventories, setInventories] = useState<
    PersonalInventoryInterface["full"][]
  >([]);
  useEffect(() => {
    const fetchInventories = async () => {
      try {
        if (session) {
          const response = await fetch(
            `/api/users/${userID}/personalInventories`
          );
          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }
          const data = await response.json();
          setInventories(data);
        }
      } catch (err: any) {
        console.log(err.message);
      }
    };

    fetchInventories();
  }, [userID]);
  if (status === "loading") {
    return <Loading></Loading>;
  }

  return (
    <>
      <div className="font-inria font-normal mt-8 text-5xl pl-11 [text-shadow:_0_2px_4px_rgb(0_0_0_/_0.3)]">
        My Inventory
      </div>
      <ul className="mb-2 pl-5">
        {inventories.map((inventory) => (
          <Link
            href={`/myInventory/${inventory.ID}`}
            key={inventory.ID}
            className="mb-2"
          >
            {inventory.Name}
          </Link>
        ))}
      </ul>
    </>
  );
}
