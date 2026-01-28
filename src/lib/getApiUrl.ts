export function getApiUrl(): string {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  if (!url.startsWith("http")) {
    url = `https://${url}`;
  }
  return url;
}
