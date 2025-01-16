
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Pencil, TriangleAlert } from "lucide-react"
import Link from "next/link"

export async function DevicesTable() {

  return (
    <Table className="bg-white shadow-lg rounded-lg">
      <TableHeader className="bg-zinc-200/60">
        <TableRow>
          <TableHead className="text-black/80">Modelo</TableHead>
          <TableHead className="text-black/80">Marca</TableHead>
          <TableHead className="text-black/80">IMEI</TableHead>
          <TableHead className="text-black/80">Status</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-medium text-zinc-800">Galaxy A54</TableCell>
          <TableCell>Samsung </TableCell>
          <TableCell>2 242974 ****** **</TableCell>
          <TableCell>
            <span className="bg-lime-500/20 text-lime-700 p-1">Regular</span>
          </TableCell>
          <TableCell className="flex flex-col gap-2">
            <Link href={'/meus-dispositivos/edit/1'}>
              <button className="rounded-xl flex bg-blue-100 text-blue-700 py-1 px-2 gap-2 items-center w-fit">
                <Pencil size={16} />
                Editar
              </button>
            </Link>

            <button className="rounded-xl flex bg-red-100 text-red-700 py-1 px-2 gap-2 items-center w-fit">
              <TriangleAlert size={16} />
              Marcar como roubado
            </button>
          </TableCell>
        </TableRow>

        <TableRow>
          <TableCell className="font-medium text-zinc-800">Galaxy A54</TableCell>
          <TableCell>Samsung </TableCell>
          <TableCell>2 242974 ****** **</TableCell>
          <TableCell>
            <span className="bg-lime-500/20 text-lime-700 p-1">Regular</span>
          </TableCell>
          <TableCell className="flex flex-col gap-2">
            <button className="rounded-xl flex bg-blue-100 text-blue-700 py-1 px-2 gap-2 items-center w-fit">
              <Pencil size={16} />
              Editar
            </button>

            <button className="rounded-xl flex bg-red-100 text-red-700 py-1 px-2 gap-2 items-center w-fit">
              <TriangleAlert size={16} />
              Marcar como roubado
            </button>
          </TableCell>
        </TableRow>

        <TableRow className="">
          <TableCell className="font-medium text-zinc-800">Galaxy A54</TableCell>
          <TableCell>Samsung </TableCell>
          <TableCell>2 242974 ****** **</TableCell>
          <TableCell>
            <span className="bg-lime-500/20 text-lime-700 p-1">Regular</span>
          </TableCell>

          <TableCell className="flex flex-col gap-2">
            <button className="rounded-xl flex bg-blue-100 text-blue-700 py-1 px-2 gap-2 items-center w-fit">
              <Pencil size={16} />
              Editar
            </button>

            <button className="rounded-xl flex bg-red-100 text-red-700 py-1 px-2 gap-2 items-center w-fit">
              <TriangleAlert size={16} />
              Marcar como roubado
            </button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}