
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // Пока разрешаем выполнение только локально.
  // Перед публикацией добавим защиту от злоупотреблений.
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Judge is not available in production yet." },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { code, input = "" } = body;

    if (
      typeof code !== "string" ||
      !code.trim() ||
      code.length > 20000 ||
      typeof input !== "string" ||
      input.length > 10000
    ) {
      return NextResponse.json(
        { error: "Invalid code or input." },
        { status: 400 }
      );
    }

    const response = await fetch(
      "https://ce.judge0.com/submissions?base64_encoded=false&wait=true",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source_code: code,
          language_id: 54,
          stdin: input,
          cpu_time_limit: 2,
          wall_time_limit: 5,
          memory_limit: 128000,
        }),
        signal: AbortSignal.timeout(15000),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: `Judge0 returned HTTP ${response.status}` },
        { status: 502 }
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
    console.error("Judge error:", error);

    return NextResponse.json(
      { error: "Failed to execute C++ code." },
      { status: 500 }
    );
  }
}
