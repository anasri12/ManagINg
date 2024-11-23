import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import GroupNavBar from "@/components/user/group/GroupNavBar";

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { groupID: string };
}) {
  const session = await getServerSession(authOptions);

  return (
    <>
      <GroupNavBar session={session} groupID={params.groupID} />
      <main className="h-screen w-full overflow-hidden flex flex-col">
        {children}
      </main>
    </>
  );
}
