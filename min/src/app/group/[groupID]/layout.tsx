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
      <div className="fixed top-0 left-0 w-full z-50">
        <GroupNavBar session={session} groupID={params.groupID} />
      </div>
      <main className="pt-[64px] h-screen w-full overflow-hidden flex flex-col">
        <div className="mb-5"></div>
        {children}
      </main>
    </>
  );
}
