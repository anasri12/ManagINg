"use client";

import { useRouter } from "next/navigation";
import Loading from "@/components/general/Loading";
import { Checkbox } from "@/components/ui/checkbox";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { fetchWithLogging } from "@/app/utils/log";
import { PersonalInventoryInterface } from "@/app/zods/db/personalInventory";
import { ResultSetHeader } from "mysql2/promise";

const NewInventory = () => {
  const { data: session, status } = useSession();
  const userID = session?.user.id;
  const router = useRouter();

  const [inventoryName, setInventoryName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [colabUsername, setColabUsername] = useState<string>(""); // Input for collaborator username
  const [colabPermission, setColabPermission] = useState<string>("View"); // Default permission
  const [colabArray, setColabArray] = useState<
    { username: string; permission: string }[]
  >([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    "Name",
    "Amount", // Default required columns
  ]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleCheckboxChange = (column: string) => {
    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    );
  };

  const handleColabKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && colabUsername.trim() !== "") {
      setColabArray((prev) => [
        ...prev,
        { username: colabUsername.trim(), permission: colabPermission },
      ]);
      setColabUsername(""); // Clear input field
      setColabPermission("View"); // Reset permission to default
      e.preventDefault(); // Prevent form submission
    }
  };

  const removeCollaborator = (index: number) => {
    setColabArray((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!userID) {
      alert("You must be logged in to create a new inventory.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Create the inventory
      if (!userID) return;
      const createInventory = await fetchWithLogging<{
        message: string;
        inventoryID: number;
      }>(
        `/api/users/${session.user.id}/personalInventories`,
        {
          method: "POST",
          body: {
            Name: inventoryName,
            Description: description || null,
            Owner_ID: session.user.id,
            Input_Enable: { Enable: selectedColumns },
            UpdatedBy: session.user.id,
          },
        },
        userID
      );

      console.log("Output from POST", createInventory);
      const Inventory_ID = createInventory.inventoryID;
      console.log("Inventory created successfully:", Inventory_ID);

      console.log("Next");
      // Step 2: Send collaboration invitations
      for (const collaborator of colabArray) {
        console.log("In Loop");
        const createCollaboration = await fetchWithLogging(
          `/api/users/${userID}/collaborations`,
          {
            method: "POST",
            body: {
              Permission: collaborator.permission,
              Inventory_ID: Inventory_ID,
              Owner_ID: userID,
              Collaborator_Username: collaborator.username,
            },
          },
          userID
        );
        console.log(createCollaboration);

        console.log(
          `Collaboration invitation sent to ${collaborator.username}.`
        );
      }

      router.push(`/myInventory/${Inventory_ID}`);
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return <Loading />;
  }

  return (
    <>
      <div className="container mx-28 py-6 px-6">
        {/* Header */}
        <div className="font-inria text-5xl mb-8">New / Create Inventory</div>
        <div className="font-roboto font-normal mt-16 text-xl pl-36 ">
          <div className="flex gap-4">
            <label className=" text-gray-950">Name of inventory</label>
            <input
              type="text"
              value={inventoryName}
              onChange={(e) => setInventoryName(e.target.value)}
              className="w-80 h-9 p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700"
              required
            />
          </div>
          <div className="flex gap-4 mt-6">
            <label className=" text-gray-950">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-96 h-9 p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700"
            />
          </div>
          <div className="flex gap-4 mt-6">
            <label className=" text-gray-950">Collaborators</label>
            <div>
              <input
                type="text"
                value={colabUsername}
                onChange={(e) => setColabUsername(e.target.value)}
                onKeyDown={handleColabKeyPress}
                placeholder="Enter username"
                className="w-80 h-9 p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700"
              />
              <select
                value={colabPermission}
                onChange={(e) => setColabPermission(e.target.value)}
                className="ml-4 p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700"
              >
                <option value="View">View</option>
                <option value="Edit">Edit</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            {colabArray.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {colabArray.map((collaborator, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-200 rounded-md"
                  >
                    <span>
                      {collaborator.username} ({collaborator.permission})
                    </span>
                    <button
                      onClick={() => removeCollaborator(index)}
                      className="text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
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
                { id: "Bought_From", label: "Bought From" },
                { id: "Current_Used_Day", label: "Current Used Day" },
                { id: "Brand", label: "Brand" },
                { id: "Price", label: "Price" },
                { id: "Bought_Date", label: "Bought Date" },
                { id: "EXP_BFF_Date", label: "EXP / BFF Date" },
                { id: "Picture_URL", label: "Picture" },
                { id: "Guarantee_Period", label: "Guarantee Period" },
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
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-auto mt-10 py-2 px-4 text-xl text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            {isSubmitting ? "Creating Inventory..." : "Create new inventory"}
          </button>
        </div>
      </div>
    </>
  );
};

export default NewInventory;
