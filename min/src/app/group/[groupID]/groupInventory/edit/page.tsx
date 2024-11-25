"use client";

import { useRouter } from "next/navigation";
import Loading from "@/components/general/Loading";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

interface GroupMember {
  id: string;
  username: string;
  role: "Admin" | "Staff" | "View-Only";
  toDelete?: boolean;
}

export default function EditGroup({ params }: { params: { groupId: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [groupName, setGroupName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [newMembers, setNewMembers] = useState<GroupMember[]>([]);
  const [newMemberUsername, setNewMemberUsername] = useState<string>("");
  const [newMemberRole, setNewMemberRole] = useState<
    "Admin" | "Staff" | "View-Only"
  >("View-Only");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch group data on page load
  useEffect(() => {
    const fetchGroupData = async () => {
      if (!params || !params.groupId) return;

      try {
        const response = await fetch(`/api/groups/${params.groupId}`);
        if (!response.ok)
          throw new Error(`Error fetching group data: ${response.statusText}`);

        const group = await response.json();
        setGroupName(group.name || "");
        setDescription(group.description || "");
        setMembers(group.members || []);
      } catch (error) {
        console.error("Error fetching group data:", error);
        alert("Failed to load group data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupData();
  }, [params]);

  const handleAddMember = () => {
    if (newMemberUsername.trim() === "") return;

    setNewMembers((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        username: newMemberUsername.trim(),
        role: newMemberRole,
      },
    ]);
    setNewMemberUsername("");
    setNewMemberRole("View-Only");
  };

  const handleRemoveNewMember = (index: number) => {
    setNewMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMarkMemberForDeletion = (index: number) => {
    setMembers((prev) => {
      const updated = [...prev];
      updated[index].toDelete = true;
      return updated;
    });
  };

  const handleRestoreMember = (index: number) => {
    setMembers((prev) => {
      const updated = [...prev];
      updated[index].toDelete = false;
      return updated;
    });
  };

  const handleUpdateMemberRole = (
    index: number,
    role: "Admin" | "Staff" | "View-Only"
  ) => {
    setMembers((prev) => {
      const updated = [...prev];
      updated[index].role = role;
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!session || !params?.groupId) {
      alert("You must be logged in to update the group.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: groupName,
        description: description || null,
        updatedBy: session.user.id,
        members: {
          update: members
            .filter((member) => !member.toDelete)
            .map((member) => ({
              id: member.id,
              username: member.username,
              role: member.role,
            })),
          delete: members
            .filter((member) => member.toDelete)
            .map((member) => ({ id: member.id })),
          add: newMembers.map((member) => ({
            username: member.username,
            role: member.role,
          })),
        },
      };

      const response = await fetch(`/api/groups/${params.groupId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error updating group:", errorData);
        alert("Failed to update group: " + errorData.message);
        return;
      }

      alert("Group updated successfully.");
      router.push(`/groups/${params.groupId}`);
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
    <div className="container mx-28 py-6 px-6">
      <div className="font-inria text-5xl mb-8">Edit Group</div>

      {/* Group Details */}
      <div className="mb-8">
        <div className="flex gap-4 mb-4">
          <label className="text-gray-950">Group Name</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-80 h-9 p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700"
            required
          />
        </div>
        <div className="flex gap-4">
          <label className="text-gray-950">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-96 h-9 p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700"
          />
        </div>
      </div>

      {/* Group Members */}
      <div>
        <div className="font-semibold text-xl mb-4">Group Members</div>
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">Username</th>
              <th className="border border-gray-300 p-2">Role</th>
              <th className="border border-gray-300 p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member, index) => (
              <tr
                key={member.id}
                className={member.toDelete ? "bg-red-200" : ""}
              >
                <td className="border border-gray-300 p-2">
                  {member.username}
                </td>
                <td className="border border-gray-300 p-2">
                  <select
                    value={member.role}
                    onChange={(e) =>
                      handleUpdateMemberRole(
                        index,
                        e.target.value as "Admin" | "Staff" | "View-Only"
                      )
                    }
                    disabled={member.toDelete}
                    className="p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Staff">Staff</option>
                    <option value="View-Only">View-Only</option>
                  </select>
                </td>
                <td className="border border-gray-300 p-2">
                  {member.toDelete ? (
                    <button
                      onClick={() => handleRestoreMember(index)}
                      className="text-blue-600"
                    >
                      Restore
                    </button>
                  ) : (
                    <button
                      onClick={() => handleMarkMemberForDeletion(index)}
                      className="text-red-600"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {newMembers.map((member, index) => (
              <tr key={`new-${index}`}>
                <td className="border border-gray-300 p-2">
                  {member.username}
                </td>
                <td className="border border-gray-300 p-2">{member.role}</td>
                <td className="border border-gray-300 p-2">
                  <button
                    onClick={() => handleRemoveNewMember(index)}
                    className="text-red-600"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex gap-4 mt-4">
          <input
            type="text"
            value={newMemberUsername}
            onChange={(e) => setNewMemberUsername(e.target.value)}
            placeholder="Enter username"
            className="w-80 h-9 p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700"
          />
          <select
            value={newMemberRole}
            onChange={(e) =>
              setNewMemberRole(
                e.target.value as "Admin" | "Staff" | "View-Only"
              )
            }
            className="p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-700"
          >
            <option value="Admin">Admin</option>
            <option value="Staff">Staff</option>
            <option value="View-Only">View-Only</option>
          </select>
          <button
            onClick={handleAddMember}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add Member
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex w-full justify-center">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-auto mt-10 py-2 px-4 text-xl text-white bg-red-600 rounded-md hover:bg-red-700"
        >
          {isSubmitting ? "Updating Group..." : "Update Group"}
        </button>
      </div>
    </div>
  );
}
