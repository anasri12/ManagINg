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
  const { data: session } = useSession();

  return (
    <>
      <div className="w-50 flex h-[80vh] w-full flex-col items-center justify-center">
        {session && session.user.role === "Admin" ? (
          <div className="mt-4 flex justify-center">
            <Link href="/admin/management/users">
              <Button variant="link">See All Users</Button>
            </Link>
          </div>
        ) : null}
      </div>
    </>
  );
}
