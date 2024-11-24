import UserNavBar from "@/components/user/UserNavBar";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50">
        <UserNavBar session={session} />
      </div>
      <main className="pt-[64px] h-screen w-full overflow-hidden flex flex-col">
        {children}
      </main>
    </>
  );
}
