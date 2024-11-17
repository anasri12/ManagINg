import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Admin() {
  return (
    <div className="mt-4 flex justify-center">
      <Link href="/admin/students">
        <Button variant="link">See Students</Button>
      </Link>
    </div>
  );
}
