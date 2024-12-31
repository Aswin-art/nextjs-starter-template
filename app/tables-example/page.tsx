import { columns } from "../../components/tables/columns";
import DataTable from "../../components/tables/data-table";

async function getData() {
  const req = await fetch("https://dummyjson.com/users");
  const users = await req.json();
  users.profile =
    "https://plus.unsplash.com/premium_photo-1689530775582-83b8abdb5020?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cmFuZG9tJTIwcGVyc29ufGVufDB8fDB8fHww";
  return users;
}

export default async function Page() {
  const data = await getData();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data.users} />
    </div>
  );
}
