import { UsersTable } from "@/components/Tables/UsersTable";

export default async function page() {

  return (
    <div className="w-full h-full flex justify-center py-10 mr-5">
      <UsersTable />
    </div>
  )
}