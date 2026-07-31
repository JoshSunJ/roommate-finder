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
  await prisma.listing.createMany({
    data: listings.map((listing) => ({
      title: listing.title,
      rent: listing.rent,
      location: listing.location,
      description: listing.description,
      bedrooms: listing.bedrooms,
      bathroomType: listing.bathroomType,
      availableFrom: listing.availableFrom,
      postedBy: listing.postedBy,
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
