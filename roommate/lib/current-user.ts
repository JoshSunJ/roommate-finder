import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export type CurrentUser = {
  id: number;
  name: string;
  email: string;
  affiliationType: string | null;
  affiliationName: string | null;
  verificationStatus: "unverified" | "submitted" | "verified" | "rejected";
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

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    affiliationType: user.affiliationType,
    affiliationName: user.affiliationName,
    verificationStatus: user.verificationStatus as CurrentUser["verificationStatus"],
  };
}

export function isVerifiedUser(user: CurrentUser): boolean {
  return user.verificationStatus === "verified";
}
