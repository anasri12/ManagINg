"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function RenderMode() {
  const pathname = usePathname();
  if (pathname.startsWith("/signin"))
    return (
      <div className="absolute top-5 right-20 flex gap-1">
        <button className="px-1 py-2  bg-red-600 text-white rounded-lg">
          <Link href={"/signin"}>Login</Link>
        </button>
        <button className="px-1">
          <Link href={"/signup"}>Sign-up</Link>
        </button>
      </div>
    );
  else
    return (
      <div className="absolute top-5 right-20 flex gap-1">
        <button className="px-1 py-2">
          <Link href={"/signin"}>Login</Link>
        </button>
        <button className="px-1  bg-red-600 text-white rounded-lg">
          <Link href={"/signup"}>Sign-up</Link>
        </button>
      </div>
    );
}
