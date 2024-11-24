"use client";
import { OrganizationWithMemberInterface } from "@/app/zods/db/subquery/organizationWithMember";
import Loading from "@/components/general/Loading";
import { useSession } from "next-auth/react";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home({ params }: { params: { groupID: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const userID = session?.user.id;
  const groupID = params.groupID;
  const [name, setName] = useState<OrganizationWithMemberInterface[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        if (session) {
          const response = await fetch(
            `/api/users/${userID}/organizations/${groupID}?fields=Name`
          );

          if (!response.ok) {
            throw new Error(`Group not found: ${response.statusText}`);
          }

          const data = await response.json();

          if (!data || data.length === 0) {
            throw new Error("Group not found");
          }

          setName(data);
          console.log(name);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, [userID, groupID, session]);

  useEffect(() => {
    // Redirect if there's an error
    if (error) {
      alert(error); // Optionally display an alert or toast message
      router.push("/home"); // Redirect to the previous page
    }
  }, [error, router]);

  if (!session) {
    return router.push("/home");
  }

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return null; // The redirection will handle navigation
  }

  return (
    <>
      <div className="flex justify-center font-inria text-[78px] mb-2">
        <div className="flex flex-col justify-center items-center">
          <div>Group {name[0].Name}</div>
          <div>Management</div>
        </div>
      </div>
      <div className="flex justify-center ">
        <Image
          src="/home.jpg"
          width={1618}
          height={1052}
          alt="Picture of the user"
          className="w-[700px] h-[450px]"
        ></Image>
      </div>
    </>
  );
}
