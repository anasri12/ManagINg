"use client";

import NavBar from "@/components/navbar";
import { SingleImageDropzone } from "@/components/SingleImageDropzone";
import { useEdgeStore } from "@/lib/edgestore";
import { signIn, useSession } from "next-auth/react"; // Importing useSession hook
import { useState } from "react";

export default function Upload() {
  const { data: session, update: updateSession } = useSession(); // Access session data and update function
  const [file, setFile] = useState<File>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { edgestore } = useEdgeStore();

  const handleSubmit = async () => {
    if (!file) {
      setError("Please upload a file before submitting.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      // Upload the file to EdgeStore
      const uploadResponse = await edgestore.publicFiles.upload({
        file,
        onProgressChange: (progress) => {
          console.log(`Upload Progress: ${progress}%`);
        },
      });

      if (!uploadResponse.url) {
        throw new Error("File upload failed. No URL returned.");
      }

      // Save the uploaded file URL to the user's profile in the database
      const response = await fetch(`/api/users/${session?.user.id}`, {
        method: "PATCH",
        body: JSON.stringify({ Profile_Picture_URL: uploadResponse.url }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log(uploadResponse.url);

      if (!response.ok) {
        throw new Error(data.error || "Failed to save profile image.");
      }

      console.log("Profile updated successfully:", data);

      window.location.reload();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col gap-20">
      <NavBar role="user" />
      <div className="flex flex-col items-center gap-4">
        <SingleImageDropzone
          width={200}
          height={200}
          value={file}
          onChange={(file) => setFile(file)}
        />
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`px-4 py-2 text-white rounded ${
            isSubmitting ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
          }`}
        >
          {isSubmitting ? "Uploading..." : "Upload"}
        </button>
        {error && (
          <div className="text-red-500 mt-2">
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
