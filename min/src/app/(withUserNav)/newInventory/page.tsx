"use client";

import { useRouter } from "next/navigation";
import Loading from "@/components/general/Loading";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useState } from "react";

const NewInventory = () => {
  const { data: session, status } = useSession();
  const [inventoryName, setinventoryName] = useState<string>("");
  const [description, setdescription] = useState<string>("");
  const [colabWith, setcolabWith] = useState<string>("");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "Name",
    "Amount", // Default required columns
  ]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const router = useRouter();

  const handleCheckboxChange = (column: string) => {
    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    );
  };

  if (status === "loading") {
    return <Loading />;
  }

  return (
    <>
      <div className="font-inria font-normal mt-8 text-5xl pl-11 ">
        New / Create Inventory
      </div>
      <div className="font-roboto font-normal mt-16 text-xl pl-36 ">
        <div className="flex gap-4 ">
          <label className=" text-gray-950">Name of inventory</label>
          <input
            type="text"
            value={inventoryName}
            onChange={(e) => setinventoryName(e.target.value)}
            className="w-80 h-9 p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700"
            required
          />
        </div>
        <div className="flex gap-4 mt-6">
          <label className=" text-gray-950">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setdescription(e.target.value)}
            className="w-96 h-9 p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700"
            required
          />
        </div>
        <div className="flex gap-4 mt-6">
          <label className=" text-gray-950">Colab with</label>
          <input
            type="text"
            value={colabWith}
            onChange={(e) => setcolabWith(e.target.value)}
            className="w-96 h-9 p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700"
            required
          />
        </div>
        <div className="flex gap-4 mt-6">
          <label className=" text-gray-950">Enable input (column)</label>
          <div className="grid grid-rows-4 grid-flow-col gap-x-24 gap-y-8">
            <div className="flex items-center space-x-2">
              <Checkbox id="name" disabled checked />
              <label
                htmlFor="name"
                className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Name
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="amount" disabled checked />
              <label
                htmlFor="amount"
                className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Amount
              </label>
            </div>
            {[
              { id: "Description", label: "Description" },
              { id: "BoughtFrom", label: "Bought From" },
              { id: "CurrentUsedDay", label: "Current Used Day" },
              { id: "Brand", label: "Brand" },
              { id: "Price", label: "Price" },
              { id: "BoughtDate", label: "Bought Date" },
              { id: "EXPBFFDate", label: "EXP / BFF Date" },
              { id: "Picture", label: "Picture" },
              { id: "GuaranteePeriod", label: "Guarantee Period" },
            ].map((column) => (
              <div key={column.id} className="flex items-center space-x-2">
                <Checkbox
                  id={column.id}
                  onCheckedChange={() => handleCheckboxChange(column.id)}
                />
                <label
                  htmlFor={column.id}
                  className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {column.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex w-full justify-center">
        <Link
          href={{
            pathname: "/newInventory/addInventory",
            query: { columns: JSON.stringify(selectedColumns) },
          }}
          legacyBehavior
          passHref
        >
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-auto mt-10 py-2 px-4 text-xl text-white bg-red-600 rounded-md hover:bg-red-700 "
          >
            {isSubmitting ? "Signing Up..." : "Create new inventory"}
          </button>
        </Link>
      </div>
    </>
  );
};
export default NewInventory;
