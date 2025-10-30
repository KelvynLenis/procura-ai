"use client";

import { useToast } from "@/hooks/use-toast";
import Button from "./Button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";

export function LogoutButton() {
  const { toast } = useToast();
  const router = useRouter();

  async function handleLogOut() {
    await account.deleteSession("current");

    router.push("/");
  }
  return (
    <Button
      variant="red"
      type="button"
      className="self-start"
      onClick={handleLogOut}
    >
      <LogOut />
    </Button>
  );
}
