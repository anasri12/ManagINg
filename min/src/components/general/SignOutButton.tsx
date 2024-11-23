import { signOut } from "next-auth/react";

export default function SignOutButton() {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/home" }); // Redirects to /home after signing out
  };

  return (
    <button
      onClick={handleSignOut}
      className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
    >
      Log Out
    </button>
  );
}
