import { auth } from "./auth";
import { headers } from "next/headers";

export const session = await auth.api.getSession({
  headers: await headers(),
});
