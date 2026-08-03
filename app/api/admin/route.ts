import { NextRequest, NextResponse } from "next/server";
import { readSession } from "../../../lib/auth";
import { db } from "../../../lib/db";
import { hashPassword } from "../../../lib/password";

async function requireAdmin(request: NextRequest) {
  const session = await readSession(request.cookies.get("fschool_session")?.value);
  return session?.role === "admin" ? session : null;
}

export async function GET(request: NextRequest) {
  if (!await requireAdmin(request)) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  try {
    const sql = await db();
    const [users, classes, students, permissions] = await Promise.all([
      sql`SELECT id, username, name, role, active FROM app_users ORDER BY name`,
      sql`SELECT c.id, c.name, c.grade, c.active, u.name AS homeroom_teacher FROM school_classes c LEFT JOIN app_users u ON u.id=c.homeroom_teacher_id ORDER BY c.name`,
      sql`SELECT s.id, s.student_code, s.name, s.active, c.name AS class_name, s.class_id FROM students s LEFT JOIN school_classes c ON c.id=s.class_id ORDER BY s.name`,
      sql`SELECT p.id, p.user_id, p.class_id, p.can_update, u.name AS user_name, c.name AS class_name FROM class_permissions p JOIN app_users u ON u.id=p.user_id JOIN school_classes c ON c.id=p.class_id ORDER BY u.name,c.name`,
    ]);
    return NextResponse.json({ users, classes, students, permissions });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Lỗi cơ sở dữ liệu" }, { status: 503 }); }
}

export async function POST(request: NextRequest) {
  if (!await requireAdmin(request)) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  try {
    const sql = await db();
    const body = await request.json();
    if (body.action === "createUser") {
      const passwordHash = await hashPassword(String(body.password));
      await sql`INSERT INTO app_users (username,password_hash,name,role) VALUES (${String(body.username).trim()},${passwordHash},${String(body.name).trim()},${body.role})`;
    } else if (body.action === "createClass") {
      await sql`INSERT INTO school_classes (name,grade,homeroom_teacher_id) VALUES (${String(body.name).trim()},${String(body.grade || "").trim()},${body.teacherId ? Number(body.teacherId) : null})`;
    } else if (body.action === "createStudent") {
      await sql`INSERT INTO students (student_code,name,class_id) VALUES (${String(body.code).trim()},${String(body.name).trim()},${body.classId ? Number(body.classId) : null})`;
    } else if (body.action === "importStudents") {
      const rows = String(body.list).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
      for (const [index, line] of rows.entries()) { const parts = line.split(/[;,\t]/).map((item) => item.trim()); const code = parts.length > 1 ? parts[0] : `HS${Date.now()}${index}`; const name = parts.length > 1 ? parts.slice(1).join(" ") : parts[0]; await sql`INSERT INTO students (student_code,name,class_id) VALUES (${code},${name},${body.classId ? Number(body.classId) : null}) ON CONFLICT (student_code) DO UPDATE SET name=EXCLUDED.name,class_id=EXCLUDED.class_id`; }
    } else if (body.action === "grantPermission") {
      await sql`INSERT INTO class_permissions (user_id,class_id,can_update) VALUES (${Number(body.userId)},${Number(body.classId)},${Boolean(body.canUpdate)}) ON CONFLICT (user_id,class_id) DO UPDATE SET can_update=EXCLUDED.can_update`;
    } else return NextResponse.json({ error: "Thao tác không hợp lệ" }, { status: 400 });
    return NextResponse.json({ ok: true });
  } catch (error) { const message = error instanceof Error ? error.message : "Không thể lưu dữ liệu"; return NextResponse.json({ error: message.includes("duplicate") ? "Dữ liệu đã tồn tại" : message }, { status: 400 }); }
}

export async function DELETE(request: NextRequest) {
  if (!await requireAdmin(request)) return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  try { const sql = await db(); const type = request.nextUrl.searchParams.get("type"); const id = Number(request.nextUrl.searchParams.get("id")); if (type === "user") await sql`UPDATE app_users SET active=FALSE WHERE id=${id}`; else if (type === "class") await sql`UPDATE school_classes SET active=FALSE WHERE id=${id}`; else if (type === "student") await sql`UPDATE students SET active=FALSE WHERE id=${id}`; else return NextResponse.json({ error: "Loại dữ liệu không hợp lệ" }, { status: 400 }); return NextResponse.json({ ok: true }); } catch { return NextResponse.json({ error: "Không thể khóa dữ liệu" }, { status: 400 }); }
}
