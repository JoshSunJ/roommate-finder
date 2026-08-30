import { cleanE2EAccount, createMarketplaceE2EAccounts } from "./database";

export default async function globalSetup() {
  await cleanE2EAccount();
  await createMarketplaceE2EAccounts();
}
