// Gives the page your Supabase address and public key from Vercel's Environment Variables.
// (These two values are designed to be public; your Claude key is NOT sent here.)
export function GET() {
  return Response.json({
    supabaseUrl: process.env.SUPABASE_URL || "",
    supabaseKey: process.env.SUPABASE_ANON_KEY || "",
  });
}
