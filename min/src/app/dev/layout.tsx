import DevNavBar from "@/components/dev/DevNavBar";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "Developer") {
    return <>{children}</>;
  }

  return (
    <>
      <DevNavBar session={session} />
      <main className="h-screen w-full overflow-hidden flex flex-col">
        {children}
      </main>
    </>
  );
}
