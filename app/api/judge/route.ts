import { NextResponse } from "next/server";

const LIMIT = 10; // Maximum requests per IP per minute.

async function enforceRateLimit(request: Request): Promise<boolean> {
  // Development: existing local workflow remains available.
  if (process.env.NODE_ENV !== "production") return true;

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!redisUrl || !redisToken) return false; // Fail closed if not configured.

  // Vercel sets x-vercel-forwarded-for. Do not trust arbitrary x-forwarded-for.
  const forwarded = request.headers.get("x-vercel-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim();
  if (!ip) return false;

  const window = Math.floor(Date.now() / 60_000);
  const key = `codearena:judge:${ip}:${window}`;

  try {
    const response = await fetch(redisUrl.replace(/\/$/, ""), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${redisToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(["EVAL", "local c=redis.call('INCR',KEYS[1]); if c==1 then redis.call('EXPIRE',KEYS[1],120) end; return c", "1", key]),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return false;
    const data: unknown = await response.json();
    if (!data || typeof data !== "object" || !("result" in data)) return false;
    const count = (data as { result: unknown }).result;
    return typeof count === "number" && count <= LIMIT;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV === "production") {
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");
    if (!origin || !host) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    try {
      if (new URL(origin).host !== host) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  if (!(await enforceRateLimit(request))) {
    return NextResponse.json(
      { error: "Judge is unavailable or rate limit reached. Try again later." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { code, input = "" } = body as Record<string, unknown>;
  if (
    typeof code !== "string" || !code.trim() || code.length > 20_000 ||
    typeof input !== "string" || input.length > 10_000
  ) {
    return NextResponse.json({ error: "Invalid code or input" }, { status: 400 });
  }

  try {
    const response = await fetch(
      "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_code: code,
          language_id: 54,
          stdin: input,
          cpu_time_limit: 2,
          wall_time_limit: 5,
          memory_limit: 128000,
        }),
        signal: AbortSignal.timeout(15_000),
        cache: "no-store",
      },
    );
    if (!response.ok) {
      return NextResponse.json(
        { error: `Judge0 returned HTTP ${response.status}` },
        { status: 502 },
      );
    }
    const result = await response.json();
    return NextResponse.json({
      output: result.stdout ?? "",
      error: result.stderr ?? result.compile_output ?? result.message ?? "",
      status: result.status?.description ?? "Unknown",
      time: result.time ?? null,
      memory: result.memory ?? null,
    });
  } catch (error) {
    console.error("Judge0 execution error", error);
    return NextResponse.json({ error: "Failed to run C++ code" }, { status: 502 });
  }
}
