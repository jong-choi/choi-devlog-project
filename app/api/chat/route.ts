import { handleConnect } from "./_controllers/connect";

export async function POST() {
  return handleConnect();
}
