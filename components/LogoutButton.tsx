"use client";

import { useToast } from "@/hooks/use-toast";
import Button from "./Button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";
import { deleteCookie } from "@/lib/govbr-utils";

export function LogoutButton() {
  const { toast } = useToast();
  const router = useRouter();

  async function handleLogOut() {
    await account.deleteSession("current");

    deleteCookie("govbr_user_data");
    document.cookie =
      "govbr_user_data=; Path=/; Max-Age=0; Secure; SameSite=Lax";

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
