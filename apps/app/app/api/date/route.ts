export async function GET() {
  return Response.json({
    date: new Date(),
    serverTimeUTC: new Date().toISOString(),
    localTime: new Date().toLocaleString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
}
