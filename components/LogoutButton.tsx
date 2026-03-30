"use client";

import Button from "./Button";
import { LogOut } from "lucide-react";
import { logoutToAppHome } from "@/lib/govbr/logout";

export function LogoutButton() {
  async function handleLogOut() {
    await logoutToAppHome();
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
