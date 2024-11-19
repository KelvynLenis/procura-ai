import { Board } from "@/components/board";
import ProtectedRoute from "@/components/ProtectedRoute";
import { account } from "@/lib/appwrite";

export default async function Dashboard() {

  return (
    <>
      <ProtectedRoute>
        <h1>Dashboard</h1>
        <Board />
      </ProtectedRoute>
    </>
  )
}