import { TableCell, TableRow } from "../ui/table";

interface UserRowProps {
  $id: string;
  name?: string;
  cpf?: string;
  email?: string;
}

export function UserRow({ user }: { user: UserRowProps }) {

  return (
    <TableRow key={user.$id}>
      <TableCell className="// Pode ser opcional dependendo da APIfont-medium">{user.$id}</TableCell>
      <TableCell>{user.name || "N/A"}</TableCell>
      <TableCell>{user.email || "N/A"}</TableCell>
      <TableCell className="text-center">
        <button className="w-20 bg-white rounded-xl hover:bg-primary hover:text-white shadow">
          Testar
        </button>
      </TableCell>
    </TableRow>
  )
}