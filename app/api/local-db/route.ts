import { NextResponse } from "next/server";
import {
  LocalDbOperation,
  runLocalDbOperation,
} from "@/lib/localDbServer";

export async function POST(request: Request) {
  if (process.env.NEXT_PUBLIC_USE_LOCAL_DB !== "true") {
    return NextResponse.json({ error: "Local database is disabled" }, { status: 404 });
  }

  try {
    const operation = (await request.json()) as LocalDbOperation;
    const data = await runLocalDbOperation(operation);
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Local database failed" },
      { status: 500 },
    );
  }
}
