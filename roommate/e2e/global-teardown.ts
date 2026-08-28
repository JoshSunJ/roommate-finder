import { cleanE2EAccount } from "./database";

export default async function globalTeardown() {
  await cleanE2EAccount();
}
