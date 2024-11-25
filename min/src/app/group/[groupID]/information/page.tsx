"use client";

import { OrganizationWithMemberInterface } from "@/app/zods/db/subquery/organizationWithMember";
import Loading from "@/components/general/Loading";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function UserGroups({
  params,
}: {
  params: { groupID: string };
}) {
  const { data: session } = useSession();
  const userID = session?.user.id;
  const [groups, setGroups] = useState<OrganizationWithMemberInterface[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        if (session) {
          const response = await fetch(
            `/api/users/${userID}/organizations/${params.groupID}`
          );
          if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
          }
          const data = await response.json();
          setGroups(data);
          setLoading(false);
        }
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchGroups();
  }, [userID]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="flex flex-col justify-center items-center mt-5">
          <h1>User Groups</h1>
          {session && groups.length > 0 ? (
            <ul>
              {groups.map((group) => (
                <li key={group.Code}>
                  {group.Code} {group.Name}
                </li>
              ))}
            </ul>
          ) : (
            <p>No groups found.</p>
          )}
        </div>
      )}
    </>
  );
}
