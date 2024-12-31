"use client";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export const columns: ColumnDef<any>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false
  },
  {
    accessorKey: "profile",
    header: "PROFILE",
    cell: ({ row }) => (
      <Image
        src={
          row.original.profile ??
          "https://plus.unsplash.com/premium_photo-1689530775582-83b8abdb5020?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cmFuZG9tJTIwcGVyc29ufGVufDB8fDB8fHww"
        }
        alt="image-profile"
        width={100}
        height={100}
        className="object-cover"
      />
    )
  },
  {
    accessorKey: "firstName",
    header: ({ column }) => {
      return (
        <Button
          variant={"ghost"}
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          FIRST NAME <ArrowUpDown />
        </Button>
      );
    }
  },
  {
    accessorKey: "lastName",
    header: "LAST NAME"
  },
  {
    accessorKey: "email",
    header: "EMAIL"
  },
  {
    accessorKey: "phone",
    header: "PHONE"
  },
  {
    accessorKey: "height",
    header: "HEIGHT"
  },
  {
    accessorKey: "weight",
    header: "WEIGHT"
  },
  {
    accessorKey: "hair.color",
    header: "HAIR COLOR"
  },
  {
    accessorKey: "hair.type",
    header: "HAIR TYPE"
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />
  }
];
