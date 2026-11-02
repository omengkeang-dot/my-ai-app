// Runs on Vercel's server. The browser sends the question here; this file adds your secret
// ANTHROPIC_API_KEY and forwards it to Claude, so the key is never visible to testers.
const MODELS = {
  quick: "claude-haiku-5-5",      // fast, cheap answers
  standard: "claude-sonnet-5-5",  // deeper analysis (Banking Expert Mode, images)
};

export async function POST(request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "ANTHROPIC_API_KEY is not set in Vercel." }, { status: 500 });
  }
  let body;
  try { body = await request.json(); } catch { return Response.json({ error: "Bad request" }, { status: 400 }); }
  const { tier, messages, tools } = body || {};
  if (!Array.isArray(messages) || !messages.length) {
    return Response.json({ error: "No messages" }, { status: 400 });
  }

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODELS[tier] || MODELS.standard,
      max_tokens: tier === "quick" ? 2000 : 4096,
      stream: true,
      messages,
      ...(Array.isArray(tools) && tools.length ? { tools } : {}),
    }),
  });

  if (!upstream.ok) {
    const text = await upstream.text();
    let msg = text;
    try { msg = JSON.parse(text).error?.message || text; } catch {}
    return Response.json({ error: msg }, { status: upstream.status });
  }
  return new Response(upstream.body, {
    headers: { "content-type": "text/event-stream", "cache-control": "no-cache" },
  });
}
