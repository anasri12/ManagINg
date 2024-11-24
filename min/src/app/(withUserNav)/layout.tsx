import UserNavBar from "@/components/user/UserNavBar";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);

  return (
    <>
      {/* Navbar with fixed position and high z-index */}
      <div className="fixed top-0 left-0 w-full z-50 bg-white">
        <UserNavBar session={session} />
      </div>
      {/* Main content with padding to avoid overlap */}
      <main className="pt-[64px] h-screen w-full overflow-auto flex flex-col">
        <div className="mb-5"></div>
        {children}
      </main>
    </>
  );
}
