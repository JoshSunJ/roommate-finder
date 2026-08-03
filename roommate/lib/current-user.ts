import prisma from "@/lib/prisma";

// This is a development-only stand-in for an authentication provider. Later,
// Auth.js will supply this identity from a signed-in session instead.
export type CurrentUser = {
  id: number;
  name: string;
  email: string;
};

const demoUserEmail = "joshua@roommate-finder.local";

export async function getCurrentUser(): Promise<CurrentUser> {
  const user = await prisma.user.findUnique({
    where: { email: demoUserEmail },
  });

  if (!user) {
    throw new Error("The local demo user is missing. Run the database seed script.");
  }

  return user;
}
