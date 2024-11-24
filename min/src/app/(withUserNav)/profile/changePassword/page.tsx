"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Use router for redirection

export default function ChangePassword() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      // Make an API call to verify the old password and update the new password
      const response = await fetch("/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Password changed successfully.");
        router.push("/profile"); // Redirect to the profile page
      } else {
        alert(data.message || "Failed to change password.");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="container mx-auto py-10 px-6">
      <div className="font-inria text-5xl mb-10">Change Password</div>

      <div className="space-y-6 max-w-xl mx-auto">
        <div>
          <label className="block text-lg font-semibold mb-2">
            Current Password
          </label>
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-red-600 focus:outline-none"
            />
            <img
              src={showCurrentPassword ? "/eye-open.png" : "/eye-closed.png"}
              alt="Toggle Password Visibility"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 cursor-pointer"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            />
          </div>
        </div>

        <div>
          <label className="block text-lg font-semibold mb-2">
            New Password
          </label>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-red-600 focus:outline-none"
            />
            <img
              src={showNewPassword ? "/eye-open.png" : "/eye-closed.png"}
              alt="Toggle Password Visibility"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 cursor-pointer"
              onClick={() => setShowNewPassword(!showNewPassword)}
            />
          </div>
        </div>

        <div>
          <label className="block text-lg font-semibold mb-2">
            Confirm Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border rounded-md focus:ring-2 focus:ring-red-600 focus:outline-none"
            />
            <img
              src={showConfirmPassword ? "/eye-open.png" : "/eye-closed.png"}
              alt="Toggle Password Visibility"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 cursor-pointer"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          </div>
        </div>

        <button
          className="bg-red-600 text-white w-full py-3 rounded-md hover:bg-red-700"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>
    </div>
  );
}
