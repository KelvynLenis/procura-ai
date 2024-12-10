import { UsersTable } from "@/components/UsersTable";

export default async function page() {

  return (
    <>
      <div className="w-full h-full flex justify-center py-10 px-14">
        <UsersTable />
      </div>
    </>
  )
}