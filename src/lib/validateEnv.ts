export function validateEnv() {
  const requiredEnvVars = [
    "MONGODB_URI",
    "REDIS_URL",
    "JWT_SECRET",
    "NEXT_PUBLIC_API_URL",
    "NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY",
    "PAYSTACK_SECRET_KEY",
  ];

  const missingEnvVars: string[] = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingEnvVars.push(envVar);
    }
  }

  if (missingEnvVars.length > 0) {
    console.error(
      "\x1b[31m%s\x1b[0m", // Red color
      `\n❌ Missing required environment variables:\n${missingEnvVars
        .map((v) => `   - ${v}`)
        .join("\n")}\n`
    );
    // In strict mode or CI, you might want to throw an error or exit
    process.exit(1);
  }

  console.log(
    "\x1b[32m%s\x1b[0m", // Green color
    "✅ All required environment variables are present.\n"
  );
}
