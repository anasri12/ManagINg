import { inventoryName, columns } from "./columns";
import { DataTable } from "./data-table";

async function getData(): Promise<inventoryName[]> {
  // Fetch data from your API here.
  return [
    {
      id: 20,
      Name: "a",
      Description: "a",
      BoughtFrom: "a",
      CurrentUsedDay: "2024-11-11",
      Brand: "a",
      Price: 500,
      BoughtDate: "2024-12-11",
      EXPBFFDate: "2024-11-11",
      Picture: "a",
      Amount: 2,
      GuaranteePeriod: "a",
    },
    // ...
  ];
}

export default async function DemoPage() {
  const data = await getData();

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
