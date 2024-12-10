'use client'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export async function UsersTable() {

  return (
    <Table>
      <TableCaption>Lista de usuários do sistema ainda a fazer.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">ID</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead className="text-center">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium">INV001</TableCell>
          <TableCell>Nome</TableCell>
          <TableCell>email@email.com</TableCell>
          <TableCell className="text-center">
            <button className="w-20 bg-white rounded-xl hover:bg-primary hover:text-white shadow">Test</button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}