"use client";

import { useRouter } from "next/navigation";
import Loading from "@/components/general/Loading";
import { Checkbox } from "@/components/ui/checkbox";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { PersonalInventoryInterface } from "@/app/zods/db/personalInventory";
import { fetchWithLogging } from "@/app/utils/log";

export default function EditInventory({
  params,
}: {
  params: { myInventoryID: number };
}) {
  const { data: session, status } = useSession();
  const userID = session?.user.id;
  const router = useRouter();

  const [inventoryName, setInventoryName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [existingCollaborators, setExistingCollaborators] = useState<
    {
      collaborationID: string;
      username: string;
      permission: string;
      toDelete?: boolean;
    }[]
  >([]);
  const [newCollaborators, setNewCollaborators] = useState<
    { username: string; permission: string }[]
  >([]);
  const [colabUsername, setColabUsername] = useState<string>("");
  const [colabPermission, setColabPermission] = useState<string>("View");
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [existingColumns, setExistingColumns] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch inventory data on page load
  useEffect(() => {
    const fetchInventoryData = async () => {
      if (!params || !params.myInventoryID) return;

      try {
        if (!userID) return;
        const getPersonalInventory = await fetchWithLogging<
          PersonalInventoryInterface["full"][]
        >(
          `/api/users/${userID}/personalInventories/${params.myInventoryID}`,
          { method: "GET" },
          userID
        );

        const data = getPersonalInventory[0];

        console.log("Fetched Data:", data);

        setInventoryName(data.Name || "");
        setDescription(data.Description || "");
        setExistingColumns(data.Input_Enable?.Enable || []);
        setSelectedColumns(data.Input_Enable?.Enable || []);

        const collaborators =
          data.Collaborator_Username?.map((username, index) => ({
            collaborationID: data.Collaboration_ID[index],
            username,
            permission: data.Collaborator_Permission[index] || "View",
          })) || [];

        console.log("Mapped Collaborators:", collaborators);
        setExistingCollaborators(collaborators);
      } catch (error) {
        console.error("Error fetching inventory data:", error);
        alert("Failed to load inventory data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventoryData();
  }, [params, session?.user.id]);

  const handleCheckboxChange = (column: string) => {
    if (existingColumns.includes(column)) return;

    setSelectedColumns((prev) =>
      prev.includes(column)
        ? prev.filter((col) => col !== column)
        : [...prev, column]
    );
  };

  const handleColabKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && colabUsername.trim() !== "") {
      setNewCollaborators((prev) => [
        ...prev,
        { username: colabUsername.trim(), permission: colabPermission },
      ]);
      setColabUsername("");
      setColabPermission("View");
      e.preventDefault();
    }
  };

  const removeNewCollaborator = (index: number) => {
    setNewCollaborators((prev) => prev.filter((_, i) => i !== index));
  };

  const markCollaboratorForDeletion = (index: number) => {
    setExistingCollaborators((prev) => {
      const updated = [...prev];
      updated[index].toDelete = true;
      return updated;
    });
  };

  const restoreCollaborator = (index: number) => {
    setExistingCollaborators((prev) => {
      const updated = [...prev];
      updated[index].toDelete = false;
      return updated;
    });
  };

  const updateExistingCollaboratorPermission = (
    index: number,
    permission: string
  ) => {
    setExistingCollaborators((prev) => {
      const updated = [...prev];
      updated[index].permission = permission;
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!session || !params?.myInventoryID) {
      alert("You must be logged in to update the inventory.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (!userID) return;
      const formattedInputEnable = { Enable: selectedColumns };

      const payload = {
        Name: inventoryName,
        Description: description || null,
        Input_Enable: formattedInputEnable,
        UpdatedBy: userID,
        Collaborators: {
          update: existingCollaborators
            .filter((col) => !col.toDelete)
            .map((col) => ({
              collaborationID: col.collaborationID,
              username: col.username,
              permission: col.permission,
            })),
          delete: existingCollaborators
            .filter((col) => col.toDelete)
            .map((col) => ({
              collaborationID: col.collaborationID,
            })),
          add: newCollaborators,
        },
      };

      console.log("Payload:", payload);

      const updatePersonalInventory = await fetchWithLogging(
        `/api/users/${session.user.id}/personalInventories/${params.myInventoryID}`,
        {
          method: "PUT",
          body: payload,
        },
        userID
      );
      console.log(updatePersonalInventory);
      alert("Inventory updated successfully.");
      router.push(`/myInventory/${params.myInventoryID}`);
    } catch (error) {
      console.error("Unexpected error:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || isLoading) {
    return <Loading />;
  }

  return (
    <>
      <div className="font-inria font-normal mt-3 text-5xl pl-11 ">
        Edit Inventory
      </div>
      <div className="font-roboto font-normal mt-16 text-xl pl-36 ">
        {/* Inventory Name and Description */}
        <div className="flex gap-4">
          <label className="text-gray-950">Name of inventory</label>
          <input
            type="text"
            value={inventoryName}
            onChange={(e) => setInventoryName(e.target.value)}
            className="w-80 h-9 p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700"
            required
          />
        </div>
        <div className="flex gap-4 mt-6">
          <label className="text-gray-950">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-96 h-9 p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700"
          />
        </div>
        {/* Collaborators */}
        <div className="flex gap-4 mt-6">
          <label className="text-gray-950">Collaborators</label>
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

        {/* Existing Collaborators */}
        <div className="mt-4">
          {existingCollaborators.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {existingCollaborators.map((collaborator, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 px-3 py-1 ${
                    collaborator.toDelete ? "bg-red-200" : "bg-gray-200"
                  } rounded-md`}
                >
                  <span>{collaborator.username}</span>
                  <select
                    value={collaborator.permission}
                    onChange={(e) =>
                      updateExistingCollaboratorPermission(
                        index,
                        e.target.value
                      )
                    }
                    className="p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700"
                    disabled={collaborator.toDelete}
                  >
                    <option value="View">View</option>
                    <option value="Edit">Edit</option>
                  </select>
                  {collaborator.toDelete ? (
                    <button
                      onClick={() => restoreCollaborator(index)}
                      className="text-blue-600"
                    >
                      Restore
                    </button>
                  ) : (
                    <button
                      onClick={() => markCollaboratorForDeletion(index)}
                      className="text-red-600"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* New Collaborators */}
        <div className="mt-4">
          {newCollaborators.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {newCollaborators.map((collaborator, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-3 py-1 bg-gray-200 rounded-md"
                >
                  <span>
                    {collaborator.username} ({collaborator.permission})
                  </span>
                  <button
                    onClick={() => removeNewCollaborator(index)}
                    className="text-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Input Columns */}
      <div className="flex gap-4 mt-6">
        <label className="text-gray-950">Enable input (column)</label>
        <div className="grid grid-rows-4 grid-flow-col gap-x-24 gap-y-8">
          {[
            { id: "Name", label: "Name", required: true },
            { id: "Amount", label: "Amount", required: true },
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
                checked={selectedColumns.includes(column.id)}
                disabled={existingColumns.includes(column.id)}
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

      {/* Submit Button */}
      <div className="flex w-full justify-center">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-auto mt-10 py-2 px-4 text-xl text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          {isSubmitting ? "Updating Inventory..." : "Update Inventory"}
        </button>
      </div>
    </>
  );
}
