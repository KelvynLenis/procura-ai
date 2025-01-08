'use client'

import { useToast } from "@/hooks/use-toast"
import Button from "./Button"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  const { toast } = useToast()

  async function handleLogOut() {
    // @Glaymar TODO
    // Lógica para deslogar o usuário

    toast({
      variant: 'warning',
      title: 'TODO',
      description: 'Lógica para deslogar o usuário',
      duration: 3000
    })
  }
  return (
    <Button variant='red' type='button' className="self-start" onClick={handleLogOut}>
      <LogOut />
    </Button>
  )
}
