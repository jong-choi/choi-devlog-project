import { signOutAction } from "@/app/(auth)/actions";

export default async function Page() {
  return await signOutAction();
}
