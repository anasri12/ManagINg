"use client";

import { useRouter } from "next/navigation";
import Loading from "@/components/general/Loading";
import { Checkbox } from "@/components/ui/checkbox";
import { useSession } from "next-auth/react";
import { useState } from "react";

const NewGroup = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [groupName, setGroupName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [memberUsername, setMemberUsername] = useState<string>("");
  const [memberPermission, setMemberPermission] = useState<string>("View");
  const [memberArray, setMemberArray] = useState<
    { username: string; permission: string }[]
  >([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handlememberKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && memberUsername.trim() !== "") {
      setMemberArray((prev) => [
        ...prev,
        { username: memberUsername.trim(), permission: memberPermission },
      ]);
      setMemberUsername(""); // Clear input field
      setMemberPermission("View-Only"); // Reset permission to default
      e.preventDefault(); // Prevent form submission
    }
  };

  const removeMember = (index: number) => {
    setMemberArray((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!session) {
      alert("You must be logged in to create a new group.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Step 1: Create the group
      if (session) {
        const groupResponse = await fetch(
          `/api/users/${session.user.id}/groupInventories`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              Name: groupName,
              Description: description || null,
              Owner_ID: session.user.id,
              UpdatedBy: session.user.id,
            }),
          }
        );

        if (!groupResponse.ok) {
          const errorData = await groupResponse.json();
          console.error("Error creating group:", errorData);
          alert("Failed to create group: " + errorData.message);
          return;
        }

        const groupResult = await groupResponse.json();
        const groupID = groupResult.inventoryID;
        console.log("Group created successfully:", groupID);

        // Step 2: Send collaboration invitations
        for (const member of memberArray) {
          const memberResponse = await fetch(
            `/api/users/${session.user.id}/members`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                Permission: member.permission,
                Inventory_ID: groupID,
                Owner_ID: session.user.id,
                Member_Username: member.username,
              }),
            }
          );

          if (!memberResponse.ok) {
            const errorData = await memberResponse.json();
            console.error("Error creating member:", errorData);
            alert(
              `Failed to send invitation to ${member.username}: ${errorData.message}`
            );
            continue;
          }

          console.log(`member invitation sent to ${member.username}.`);
        }

        // Redirect to the inventory page
        router.push(`/createGroup/${groupID}`);
      }
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
        <div className="font-inria text-5xl mb-8">Create Group</div>
        <div className="font-roboto font-normal mt-16 text-xl pl-36 ">
          <div className="flex gap-4">
            <label className=" text-gray-950">Name of group</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
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
            <label className=" text-gray-950">Member</label>
            <div>
              <input
                type="text"
                value={memberUsername}
                onChange={(e) => setMemberUsername(e.target.value)}
                onKeyDown={handlememberKeyPress}
                placeholder="Enter username"
                className="w-80 h-9 p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700"
              />
              <select
                value={memberPermission}
                onChange={(e) => setMemberPermission(e.target.value)}
                className="ml-4 p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700"
              >
                <option value="Admin">Admin</option>
                <option value="Staff">Staff</option>
                <option value="View-Only">View-Only</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            {memberArray.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {memberArray.map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1 bg-gray-200 rounded-md"
                  >
                    <span>
                      {member.username} ({member.permission})
                    </span>
                    <button
                      onClick={() => removeMember(index)}
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
        <div className="flex w-full justify-center">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-auto mt-10 py-2 px-4 text-xl text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            {isSubmitting ? "Creating Group..." : "Create new group"}
          </button>
        </div>
      </div>
    </>
  );
};

export default NewGroup;
