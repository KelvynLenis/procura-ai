import { UsersTable } from "@/components/Tables/UsersTable";

export default async function page() {

  return (
    <>
      <div className="w-full h-full flex justify-center py-10 px-8">
        <UsersTable />
      </div>
    </>
  )
}