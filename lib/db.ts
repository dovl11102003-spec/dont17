import postgres from "postgres";
let client: ReturnType<typeof postgres> | null = null;
let ready = false;
export async function db() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL chưa được cấu hình");
  if (!client) client = postgres(process.env.DATABASE_URL, { ssl: "require", max: 3, idle_timeout: 20 });
  if (!ready) {
    await client`CREATE TABLE IF NOT EXISTS app_users (id BIGSERIAL PRIMARY KEY, username TEXT UNIQUE NOT NULL, password_hash TEXT NOT NULL, name TEXT NOT NULL, role TEXT NOT NULL CHECK (role IN ('admin','homeroom','subject','representative')), active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
    await client`CREATE TABLE IF NOT EXISTS school_classes (id BIGSERIAL PRIMARY KEY, name TEXT UNIQUE NOT NULL, grade TEXT NOT NULL DEFAULT '', homeroom_teacher_id BIGINT REFERENCES app_users(id) ON DELETE SET NULL, representative_id BIGINT REFERENCES app_users(id) ON DELETE SET NULL, active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
    await client`CREATE TABLE IF NOT EXISTS students (id BIGSERIAL PRIMARY KEY, student_code TEXT UNIQUE NOT NULL, name TEXT NOT NULL, class_id BIGINT REFERENCES school_classes(id) ON DELETE SET NULL, active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`;
    await client`CREATE TABLE IF NOT EXISTS class_permissions (id BIGSERIAL PRIMARY KEY, user_id BIGINT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE, class_id BIGINT NOT NULL REFERENCES school_classes(id) ON DELETE CASCADE, can_update BOOLEAN NOT NULL DEFAULT FALSE, UNIQUE(user_id,class_id))`;
    ready = true;
  }
  return client;
}
