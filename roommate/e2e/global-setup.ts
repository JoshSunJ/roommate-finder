import { cleanE2EAccount } from "./database";

export default async function globalSetup() {
  await cleanE2EAccount();
}
