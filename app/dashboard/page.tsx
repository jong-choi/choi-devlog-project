import { getSidebarCategory } from "@/app/post/actions";

export default async function Page() {
  const { data } = await getSidebarCategory();
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
