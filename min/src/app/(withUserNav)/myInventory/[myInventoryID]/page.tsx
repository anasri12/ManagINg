"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { DataTable } from "./data-table";
import { ColumnDef } from "@tanstack/react-table";
import Loading from "@/components/general/Loading";
import { PersonalInventoryItemInterface } from "@/app/zods/db/personalInventoryItem";
import { PersonalInventoryInterface } from "@/app/zods/db/personalInventory";
import { fetchWithLogging } from "@/app/utils/log";

export default function MySelectInventory({
  params,
}: {
  params: { myInventoryID: number };
}) {
  const { data: session, status } = useSession();
  const userID = session?.user.id;
  const [loading, setLoading] = useState(true);
  const [dynamicColumns, setDynamicColumns] = useState<
    ColumnDef<PersonalInventoryItemInterface["full"], any>[]
  >([]);
  const [inventoryItems, setInventoryItems] = useState<
    PersonalInventoryItemInterface["full"][]
  >([]);
  const [inputFields, setInputFields] = useState<string[]>([]);
  const [header, setHeader] = useState<string>("My Inventory");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userID) return;
        const personalInventoryData = await fetchWithLogging<
          PersonalInventoryInterface["full"][]
        >(
          `/api/users/${userID}/personalInventories/${params.myInventoryID}`,
          { method: "GET" },
          userID
        );

        const header = personalInventoryData[0].Name ?? "My Inventory";
        const enable = personalInventoryData[0].Input_Enable.Enable ?? [];
        if (!Array.isArray(enable)) {
          throw new Error("'enable' property is missing or not an array");
        }

        setHeader(header);
        setInputFields(enable);

        const allColumns: ColumnDef<PersonalInventoryItemInterface["full"]>[] =
          [
            { id: "ID", header: "ID", cell: ({ row }) => row.original.ID },
            {
              id: "Name",
              header: "Name",
              cell: ({ row }) => row.original.Name,
            },
            {
              id: "Description",
              header: "Description",
              cell: ({ row }) => row.original.Description,
            },
            {
              id: "Bought_From",
              header: "Bought From",
              cell: ({ row }) => row.original.Bought_From,
            },
            {
              id: "Current_Used_Day",
              header: "Current Used Day",
              cell: ({ row }) => row.original.Current_Used_Day,
            },
            {
              id: "Brand",
              header: "Brand",
              cell: ({ row }) => row.original.Brand,
            },
            {
              id: "Price",
              header: "Price",
              cell: ({ row }) => row.original.Price,
            },
            {
              id: "Bought_Date",
              header: "Bought Date",
              cell: ({ row }) => row.original.Bought_Date,
            },
            {
              id: "EXP_BFF_Date",
              header: "EXP / BFF Date",
              cell: ({ row }) => row.original.EXP_BFF_Date,
            },
            {
              id: "Picture_URL",
              header: "Picture",
              cell: ({ row }) => row.original.Picture_URL,
            },
            {
              id: "Amount",
              header: "Amount",
              cell: ({ row }) => row.original.Amount,
            },
            {
              id: "Guarantee_Period",
              header: "Guarantee Period",
              cell: ({ row }) => row.original.Guarantee_Period,
            },
          ];

        const filteredColumns = allColumns.filter((col) =>
          enable.includes(col.id ?? "")
        );

        setDynamicColumns(filteredColumns);

        const personalInventoryItemData = await fetchWithLogging<
          PersonalInventoryItemInterface["full"][]
        >(
          `/api/users/${userID}/personalInventories/${params.myInventoryID}/personalInventoryItems`,
          { method: "GET" },
          userID
        );

        setInventoryItems(personalInventoryItemData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [session, userID, params.myInventoryID]);

  if (status === "loading" || loading) {
    return <Loading />;
  }

  return (
    <DataTable
      session={session}
      columns={dynamicColumns}
      data={inventoryItems}
      title={header}
      apiUrl={`/api/users/${session?.user.id}/personalInventories/${params.myInventoryID}/personalInventoryItems`}
      formFields={inputFields}
      userID={userID!}
      inventoryID={params.myInventoryID}
    />
  );
}
