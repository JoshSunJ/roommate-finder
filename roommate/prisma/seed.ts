import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";
import { listings } from "../features/listings/data";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  await prisma.listing.deleteMany();
  const demoUser = await prisma.user.upsert({
    where: { email: "joshua@roommate-finder.local" },
    update: { name: "Joshua" },
    create: { name: "Joshua", email: "joshua@roommate-finder.local" },
  });

  await prisma.listing.createMany({
    data: listings.map((listing) => ({
      title: listing.title,
      rent: listing.rent,
      location: listing.location,
      description: listing.description,
      bedrooms: listing.bedrooms,
      bathroomType: listing.bathroomType,
      availableFrom: listing.availableFrom,
      postedBy: demoUser.name,
      ownerId: demoUser.id,
      latitude: listing.coordinates?.latitude,
      longitude: listing.coordinates?.longitude,
    })),
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
