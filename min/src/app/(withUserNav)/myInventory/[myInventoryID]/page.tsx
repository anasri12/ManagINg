"use client";
import { PersonalInventoryItemInterface } from "@/app/zods/db/personalInventoryItem";
import Loading from "@/components/general/Loading";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function mySelectInventory({
  params,
}: {
  params: { myInventoryID: number };
}) {
  const { data: session } = useSession();
  const userID = session?.user.id;
  const [loading, setLoading] = useState(true);
  const [inventoryItems, setInventoryItems] = useState<
    PersonalInventoryItemInterface["full"][]
  >([]);
  useEffect(() => {
    const fetchInventories = async () => {
      try {
        if (session) {
          const response = await fetch(
            `/api/users/${userID}/personalInventories/${params.myInventoryID}`
          );
          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }
          const data = await response.json();
          setInventoryItems(data);
          setLoading(false);
        }
      } catch (err: any) {
        console.log(err.message);
      }
    };

    fetchInventories();
  }, [userID, params.myInventoryID]);
  if (loading) {
    return <Loading></Loading>;
  }

  return (
    <>
      <div className="font-inria font-normal mt-8 text-5xl pl-11 [text-shadow:_0_2px_4px_rgb(0_0_0_/_0.3)]">
        My Inventory
      </div>
      <ul className="mb-2 pl-5">
        {inventoryItems.map((inventory) => (
          <div>{JSON.stringify(inventory)}</div>
        ))}
      </ul>
    </>
  );
}
