import { NextRequest, NextResponse } from "next/server";
import { readSession } from "../../../../lib/auth";
export async function GET(request: NextRequest) { const user = await readSession(request.cookies.get("fschool_session")?.value); if (!user) return NextResponse.json({ user: null }, { status: 401 }); const { exp: _, ...safe } = user; return NextResponse.json({ user: safe }); }
