import { Board } from "@/components/board";
import ProtectedRoute from "@/components/ProtectedRoute";
import { account } from "@/lib/appwrite";

export default async function Dashboard() {

  return (
    <>
      <ProtectedRoute>
        <Board />
      </ProtectedRoute>
    </>
  )
}