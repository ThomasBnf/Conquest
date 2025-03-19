export async function GET() {
  return Response.json({
    serverTimeUTC: new Date().toISOString(),
    localTime: new Date().toLocaleString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
}
