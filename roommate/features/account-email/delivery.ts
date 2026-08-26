type Environment = Record<string, string | undefined>;

type VerificationMessage = {
  recipient: string;
  name: string;
  token: string;
  idempotencyKey: string;
};

export type EmailDeliveryResult = {
  provider: "preview" | "resend";
  previewUrl?: string;
};

export class EmailDeliveryConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmailDeliveryConfigurationError";
  }
}

type EmailDeliveryConfiguration =
  | { provider: "preview"; baseUrl: URL }
  | { provider: "resend"; baseUrl: URL; apiKey: string; sender: string };

function required(value: string | undefined, name: string) {
  const normalized = value?.trim();
  if (!normalized) throw new EmailDeliveryConfigurationError(`${name} is required.`);
  return normalized;
}

function appUrl(environment: Environment) {
  const value = environment.AUTH_URL?.trim() || "http://localhost:3000";
  const url = new URL(value);
  if (environment.NODE_ENV === "production" && url.protocol !== "https:") {
    throw new EmailDeliveryConfigurationError("AUTH_URL must use HTTPS in production.");
  }
  return url;
}

export function validateEmailDeliveryConfiguration(
  environment: Environment = process.env,
): EmailDeliveryConfiguration {
  const baseUrl = appUrl(environment);
  const provider = environment.EMAIL_PROVIDER?.trim()
    || (environment.NODE_ENV === "production" ? "" : "preview");

  if (provider === "preview") {
    if (environment.NODE_ENV === "production") {
      throw new EmailDeliveryConfigurationError("Preview email delivery is disabled in production.");
    }
    return { provider, baseUrl };
  }
  if (provider !== "resend") {
    throw new EmailDeliveryConfigurationError("EMAIL_PROVIDER must be set to resend in production.");
  }
  return {
    provider,
    baseUrl,
    apiKey: required(environment.RESEND_API_KEY, "RESEND_API_KEY"),
    sender: required(environment.EMAIL_FROM, "EMAIL_FROM"),
  };
}

export function buildEmailVerificationUrl(token: string, environment: Environment = process.env) {
  const url = new URL("/api/auth/verify-email", appUrl(environment));
  url.searchParams.set("token", token);
  return url.toString();
}

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;",
  })[character]!);
}

export async function sendEmailVerification(
  message: VerificationMessage,
  environment: Environment = process.env,
  fetchImplementation: typeof fetch = fetch,
): Promise<EmailDeliveryResult> {
  const verificationUrl = buildEmailVerificationUrl(message.token, environment);
  const configuration = validateEmailDeliveryConfiguration(environment);

  if (configuration.provider === "preview") {
    return { provider: "preview", previewUrl: verificationUrl };
  }
  const safeName = escapeHtml(message.name);
  const safeUrl = escapeHtml(verificationUrl);
  const response = await fetchImplementation("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${configuration.apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": message.idempotencyKey,
      "User-Agent": "Unitern/1.0",
    },
    body: JSON.stringify({
      from: configuration.sender,
      to: [message.recipient],
      subject: "Verify your Unitern email",
      text: `Hi ${message.name}, verify your Unitern email within 24 hours: ${verificationUrl}`,
      html: `<p>Hi ${safeName},</p><p>Verify your Unitern email within 24 hours.</p><p><a href="${safeUrl}">Verify email</a></p>`,
    }),
  });

  if (!response.ok) {
    throw new Error("The verification email provider rejected the request.");
  }

  return { provider: "resend" };
}
