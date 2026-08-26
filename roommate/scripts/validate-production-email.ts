import "dotenv/config";

import {
  EmailDeliveryConfigurationError,
  validateEmailDeliveryConfiguration,
} from "../features/account-email/delivery";

try {
  const configuration = validateEmailDeliveryConfiguration({
    ...process.env,
    NODE_ENV: "production",
  });
  console.log(`Account email provider: ${configuration.provider}`);
  console.log(`Application origin: ${configuration.baseUrl.origin}`);
} catch (error: unknown) {
  const message = error instanceof EmailDeliveryConfigurationError
    ? error.message
    : "Production account email configuration could not be validated.";
  console.error(message);
  process.exitCode = 1;
}
