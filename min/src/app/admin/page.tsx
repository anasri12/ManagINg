"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Loading from "@/components/general/Loading";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Admin() {
  const { data: session, status } = useSession();
  const [showError, setShowError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated" || session?.user.role !== "Admin") {
      setShowError(true);
      setTimeout(() => {
        router.push("/home");
      }, 500);
    }
  }, [status, session, router]);

  if (status === "loading") {
    return <Loading />;
  }

  return (
    <>
      <div className="w-50 flex h-[80vh] w-full flex-col items-center justify-center">
        {showError && (
          <div>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                You do not have permission to access this page.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {session && session.user.role === "Admin" ? (
          <div className="mt-4 flex justify-center">
            <Link href="/admin/users">
              <Button variant="link">See All Users</Button>
            </Link>
          </div>
        ) : null}
      </div>
    </>
  );
}
