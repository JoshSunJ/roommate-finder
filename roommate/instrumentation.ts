export async function register() {
  if (
    process.env.NEXT_RUNTIME === "nodejs"
    && process.env.UNITERN_VALIDATE_RUNTIME_ENV === "true"
  ) {
    const { validateProductionEnvironment } = await import(
      "@/lib/production-environment"
    );
    validateProductionEnvironment();
  }
}
