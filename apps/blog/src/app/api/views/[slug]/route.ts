import { NextResponse } from "next/server";
import { incrementViews } from "@/lib/views";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const count = await incrementViews(slug);
  return NextResponse.json({ count });
}
