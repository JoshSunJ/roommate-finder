import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
};

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  return user;
}
