"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";
import { useEdgeStore } from "@/lib/edgestore";
import Loading from "@/components/general/Loading";
import Link from "next/link";

export default function Profile() {
  const { data: session, status } = useSession();
  const [file, setFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { edgestore } = useEdgeStore();
  const [loading, setLoading] = useState(true);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);

      // Generate a preview for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

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

      if (!response.ok) {
        throw new Error(data.error || "Failed to save profile image.");
      }

      console.log("Profile updated successfully:", data);
      setLoading(false);
      // Reload the page to reflect the new profile picture
      window.location.reload();
    } catch (err) {
      setLoading(false);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return <Loading />;
  }

  return (
    <div className="container mx-auto py-10 px-6">
      {/* Header */}
      <div className="font-inria text-5xl mb-10">Your Profile</div>

      <div className="flex flex-col items-center ml-36 md:flex-row md:gap-20">
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center">
          <div
            className="w-96 h-96 rounded-full border-2 border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50"
            style={{ position: "relative" }}
          >
            {previewImage || session?.user.image ? (
              <Image
                src={
                  previewImage !== null
                    ? previewImage
                    : session?.user.image || "/profile.png"
                }
                alt="Profile"
                layout="fill"
                objectFit="cover"
                priority
              />
            ) : (
              <div className="text-gray-500 flex flex-col items-center">
                <Image
                  src="/addImage.png"
                  alt="ImageIcon"
                  width={240}
                  height={240}
                />
              </div>
            )}
          </div>
          <label
            htmlFor="upload"
            className="text-red-600 text-xl underline mt-6 cursor-pointer"
          >
            Change your profile picture
          </label>
          <input
            type="file"
            id="upload"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />

          {/* Conditionally Render Submit Button */}
          {file && (
            <button
              className="mt-4 bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          )}
          {error && <p className="text-red-600 mt-2">{error}</p>}
        </div>

        {/* User Info Section */}
        <div className="flex flex-col items-center md:items-start text-xl md:text-xl">
          <p className="mb-8">
            <strong>Username: </strong>
            {session?.user.name}
          </p>
          <p className="mb-8">
            <strong>Email: </strong>
            {session?.user.email}
          </p>
          <Link href="/profile/changePassword">
            <button className="bg-red-600 text-white px-8 py-3 rounded-md hover:bg-red-700">
              Change your password
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
