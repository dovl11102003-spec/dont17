"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Attendance = "Có mặt" | "Đi muộn" | "Vắng có phép" | "Vắng không phép";
type Phone = "Đã nộp" | "Không mang" | "Chưa nộp" | "Được phép giữ" | "";
type Student = { id: string; name: string; attendance: Attendance; phone: Phone };

const initialStudents: Student[] = [];

const classes: { name: string; teacher: string; total: number; present: number; phone: number; done: boolean }[] = [];
type Session = { username: string; name: string; role: "admin" | "homeroom" | "subject" | "representative" };
const roleLabels = { admin: "Quản trị viên", homeroom: "Giáo viên chủ nhiệm", subject: "Giáo viên bộ môn", representative: "Đại diện lớp" };

const initials = (name: string) => name.split(" ").slice(-2).map((part) => part[0]).join("");

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginError, setLoginError] = useState("");
  const [active, setActive] = useState("Điểm danh");
  const [students, setStudents] = useState(initialStudents);
  const [query, setQuery] = useState("");
  const [completed, setCompleted] = useState(false);
  const [notice, setNotice] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session").then((response) => response.ok ? response.json() : null).then((data) => setSession(data?.user ?? null)).finally(() => setAuthLoading(false));
  }, []);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError("");
    const values = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ username: values.get("username"), password: values.get("password") }) });
    const data = await response.json();
    if (!response.ok) return setLoginError(data.error || "Không thể đăng nhập");
    setSession(data.user);
  };

  const logout = async () => { await fetch("/api/auth/logout", { method: "POST" }); setSession(null); setActive("Điểm danh"); };

  const filtered = useMemo(() => students.filter((student) =>
    `${student.name} ${student.id}`.toLowerCase().includes(query.toLowerCase())), [students, query]);
  const metrics = useMemo(() => ({
    present: students.filter((student) => student.attendance === "Có mặt").length,
    late: students.filter((student) => student.attendance === "Đi muộn").length,
    absent: students.filter((student) => student.attendance.startsWith("Vắng")).length,
    phone: students.filter((student) => student.phone !== "").length,
  }), [students]);

  const updateStudent = (id: string, key: "attendance" | "phone", value: string) => {
    setStudents((current) => current.map((student) => student.id === id ? { ...student, [key]: value } as Student : student));
    setNotice("Đã tự động lưu thay đổi");
    window.setTimeout(() => setNotice(""), 1800);
  };

  const navItems = session?.role === "admin" ? ["Điểm danh", "Theo dõi lớp", "Quản trị"] : ["Điểm danh", "Theo dõi lớp"];

  if (authLoading) return <div className="auth-loading"><img src="/fpt-schools-logo.png" alt="FPT Schools" /><span>Đang khởi động hệ thống...</span></div>;
  if (!session) return <main className="login-page"><section className="login-visual"><img src="/fpt-schools-logo.png" alt="FPT Schools" /><div><span className="eyebrow">FSCHOOL ATTEND</span><h1>Mỗi buổi sáng,<br />một khởi đầu chủ động.</h1><p>Điểm danh nhanh, theo dõi điện thoại rõ ràng và kết nối giáo viên trong toàn trường.</p></div><div className="brand-stripes"><i /><i /><i /></div></section><section className="login-panel"><form className="login-card" onSubmit={login}><div className="login-mark">✓</div><h2>Đăng nhập hệ thống</h2><p>Sử dụng tài khoản do quản trị viên cấp.</p><label>Tên đăng nhập<input name="username" required autoComplete="username" placeholder="Nhập tên đăng nhập" /></label><label>Mật khẩu<input name="password" type="password" required autoComplete="current-password" placeholder="Nhập mật khẩu" /></label>{loginError && <div className="login-error">{loginError}</div>}<button type="submit">Đăng nhập →</button><small>Liên hệ quản trị viên nếu bạn quên mật khẩu.</small></form></section></main>;

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => setActive("Điểm danh")} aria-label="Về trang điểm danh">
          <img src="/fpt-schools-logo.png" alt="FPT Schools" />
          <span><strong>FSchool Attend</strong><small>Điểm danh đầu giờ</small></span>
        </button>
        <nav className={mobileMenu ? "nav open" : "nav"} aria-label="Điều hướng chính">
          {navItems.map((item) => <button key={item} className={active === item ? "active" : ""} onClick={() => { setActive(item); setMobileMenu(false); }}>{item}</button>)}
        </nav>
        <button className="account" onClick={logout} title="Đăng xuất"><span className="account-avatar">{initials(session.name)}</span><span><strong>{session.name}</strong><small>{roleLabels[session.role]} · Đăng xuất</small></span></button>
        <button className="menu-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Mở menu">☰</button>
      </header>

      <main>
        {active === "Điểm danh" && <section className="page attendance-page">
          <div className="page-heading">
            <div><span className="eyebrow">ĐIỂM DANH ĐẦU NGÀY</span><h1>Chào buổi sáng, {session.name}! 👋</h1><p>Hãy chọn lớp để bắt đầu điểm danh và kiểm tra điện thoại.</p></div>
            <div className="heading-controls"><label>Ngày<input type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></label><label>Lớp<select disabled><option>Chưa có lớp</option></select></label></div>
          </div>

          <div className="metric-grid">
            <article className="metric blue"><span className="metric-icon">👥</span><div><strong>{students.length}</strong><small>Tổng học sinh</small></div></article>
            <article className="metric green"><span className="metric-icon">✓</span><div><strong>{metrics.present}</strong><small>Có mặt</small></div></article>
            <article className="metric orange"><span className="metric-icon">◷</span><div><strong>{metrics.late}</strong><small>Đi muộn</small></div></article>
            <article className="metric red"><span className="metric-icon">!</span><div><strong>{metrics.absent}</strong><small>Vắng mặt</small></div></article>
            <article className="metric purple"><span className="metric-icon">▯</span><div><strong>{metrics.phone}/{students.length}</strong><small>Đã cập nhật ĐT</small></div></article>
          </div>

          <article className="workspace-card">
            <div className="workspace-toolbar">
              <div><h2>Danh sách học sinh</h2><p>Mọi thay đổi được lưu tự động</p></div>
              <div className="toolbar-actions"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tên hoặc mã học sinh..." aria-label="Tìm học sinh" /><button onClick={() => setStudents((current) => current.map((student) => ({ ...student, attendance: "Có mặt" })))}>✓ Tất cả có mặt</button><button className="accent" onClick={() => setStudents((current) => current.map((student) => ({ ...student, phone: "Đã nộp" })))}>▯ Tất cả đã nộp</button></div>
            </div>
            <div className="student-table">
              <div className="student-row table-head"><span>STT</span><span>Học sinh</span><span>Điểm danh</span><span>Điện thoại</span><span>Tình trạng</span></div>
              {filtered.length === 0 && <div className="empty-state"><span>🎓</span><h3>Chưa có học sinh</h3><p>Quản trị viên có thể thêm học sinh trong khu vực Quản trị.</p>{session.role === "admin" && <button onClick={() => setActive("Quản trị")}>Đến trang quản trị →</button>}</div>}
              {filtered.map((student, index) => <div className="student-row" key={student.id}>
                <span className="order">{String(index + 1).padStart(2, "0")}</span>
                <div className="student-name"><span className="student-avatar">{initials(student.name)}</span><span><strong>{student.name}</strong><small>{student.id}</small></span></div>
                <label className="mobile-label"><span>Điểm danh</span><select className={`select-status ${student.attendance === "Có mặt" ? "is-present" : student.attendance === "Đi muộn" ? "is-late" : "is-absent"}`} value={student.attendance} onChange={(event) => updateStudent(student.id, "attendance", event.target.value)}><option>Có mặt</option><option>Đi muộn</option><option>Vắng có phép</option><option>Vắng không phép</option></select></label>
                <label className="mobile-label"><span>Điện thoại</span><select value={student.phone} onChange={(event) => updateStudent(student.id, "phone", event.target.value)}><option value="">Chưa cập nhật</option><option>Đã nộp</option><option>Không mang</option><option>Chưa nộp</option><option>Được phép giữ</option></select></label>
                <span className={student.phone ? "row-state complete" : "row-state pending"}>{student.phone ? "● Đã cập nhật" : "● Cần cập nhật"}</span>
              </div>)}
            </div>
            <div className="workspace-footer"><span>{notice || "✓ Đã lưu · vài giây trước"}</span><button className={completed ? "finish done" : "finish"} onClick={() => setCompleted(true)}>{completed ? "✓ Đã hoàn tất" : "Xác nhận hoàn tất →"}</button></div>
          </article>
        </section>}

        {active === "Theo dõi lớp" && <section className="page">
          <div className="page-heading"><div><span className="eyebrow">TOÀN TRƯỜNG</span><h1>Theo dõi điểm danh</h1><p>Nắm nhanh tình hình các lớp trong buổi sáng hôm nay.</p></div><div className="heading-controls"><label>Ngày<input type="date" defaultValue="2026-08-03" /></label></div></div>
          <div className="overview-banner"><div><span>Tiến độ hôm nay</span><strong>0/0 lớp</strong><small>đã hoàn tất điểm danh</small></div><div className="progress"><i style={{ width: "0%" }} /></div><b>0%</b></div>
          {classes.length === 0 && <div className="empty-board"><span>🏫</span><h2>Chưa có lớp học</h2><p>Dữ liệu sẽ xuất hiện tại đây sau khi quản trị viên tạo lớp.</p></div>}
          <div className="class-grid">{classes.map((item, index) => <article className="class-card" key={item.name}><div className={`class-ribbon ribbon-${index % 3}`} /><div className="class-card-head"><span className="class-badge">{item.name}</span><span className={item.done ? "status-chip ready" : "status-chip waiting"}>{item.done ? "Đã hoàn tất" : "Chưa hoàn tất"}</span></div><h3>{item.teacher}</h3><small>Giáo viên chủ nhiệm</small><div className="class-stats"><span><b>{item.present}/{item.total}</b>Có mặt</span><span><b>{item.phone}/{item.total}</b>Điện thoại</span></div><button onClick={() => setActive("Điểm danh")}>Xem chi tiết →</button></article>)}</div>
        </section>}

        {active === "Quản trị" && <section className="page">
          <div className="page-heading"><div><span className="eyebrow">QUẢN TRỊ HỆ THỐNG</span><h1>Trung tâm quản lý</h1><p>Quản lý lớp học, học sinh, tài khoản và các quy tắc điểm danh.</p></div><button className="primary-button">＋ Tạo lớp mới</button></div>
          <div className="admin-grid">
            {[{icon:"🏫", title:"Lớp học", value:"0", text:"Tạo lớp, phân công GVCN và đại diện lớp", color:"blue"},{icon:"🎓", title:"Học sinh", value:"0", text:"Thêm từng em hoặc nhập danh sách Excel/CSV", color:"orange"},{icon:"👩‍🏫", title:"Tài khoản & phân quyền", value:"1", text:"Quản lý tài khoản và quyền truy cập theo lớp", color:"green"},{icon:"📱", title:"Trạng thái điện thoại", value:"4", text:"Tùy chỉnh tên, màu sắc và thứ tự hiển thị", color:"purple"}].map((item) => <article className="admin-card" key={item.title}><span className={`admin-icon ${item.color}`}>{item.icon}</span><div><small>{item.title}</small><strong>{item.value}</strong><p>{item.text}</p></div><button onClick={() => setNotice("Sẵn sàng kết nối cơ sở dữ liệu")}>Quản lý →</button></article>)}
          </div>
          <article className="quick-card"><div><span className="quick-icon">⇧</span><div><h2>Nhập danh sách học sinh</h2><p>Tải lên tệp Excel/CSV hoặc dán danh sách để thêm nhiều học sinh cùng lúc.</p></div></div><button>Nhập danh sách</button></article>
        </section>}
      </main>
      <footer className="site-footer">Made by <strong>DoNT17</strong> with luv <span aria-label="love">&lt;3</span></footer>
      <div className="toast" aria-live="polite">{notice}</div>
    </div>
  );
}
