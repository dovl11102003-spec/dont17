"use client";

import { useMemo, useState } from "react";

type Attendance = "Có mặt" | "Đi muộn" | "Vắng có phép" | "Vắng không phép";
type Phone = "Đã nộp" | "Không mang" | "Chưa nộp" | "Được phép giữ" | "";
type Student = { id: string; name: string; attendance: Attendance; phone: Phone };

const initialStudents: Student[] = [
  { id: "HS001", name: "Nguyễn Minh Anh", attendance: "Có mặt", phone: "Đã nộp" },
  { id: "HS002", name: "Trần Gia Bảo", attendance: "Đi muộn", phone: "Đã nộp" },
  { id: "HS003", name: "Lê Hoàng Duy", attendance: "Vắng có phép", phone: "" },
  { id: "HS004", name: "Phạm Khánh Linh", attendance: "Có mặt", phone: "Chưa nộp" },
  { id: "HS005", name: "Vũ Đức Minh", attendance: "Có mặt", phone: "Đã nộp" },
  { id: "HS006", name: "Đỗ Ngọc Hà", attendance: "Có mặt", phone: "Không mang" },
  { id: "HS007", name: "Hoàng Tuấn Kiệt", attendance: "Có mặt", phone: "Đã nộp" },
  { id: "HS008", name: "Bùi Quỳnh Mai", attendance: "Có mặt", phone: "Đã nộp" },
];

const classes = [
  { name: "10A1", teacher: "Nguyễn Thu Hà", total: 40, present: 38, phone: 37, done: true },
  { name: "10A2", teacher: "Trần Văn Hùng", total: 42, present: 40, phone: 42, done: true },
  { name: "11A1", teacher: "Phạm Minh Châu", total: 39, present: 39, phone: 31, done: false },
  { name: "11A2", teacher: "Lê Thanh Tùng", total: 41, present: 38, phone: 38, done: true },
  { name: "12A1", teacher: "Đỗ Ngọc Lan", total: 40, present: 0, phone: 0, done: false },
];

const initials = (name: string) => name.split(" ").slice(-2).map((part) => part[0]).join("");

export default function Home() {
  const [active, setActive] = useState("Điểm danh");
  const [students, setStudents] = useState(initialStudents);
  const [query, setQuery] = useState("");
  const [completed, setCompleted] = useState(false);
  const [notice, setNotice] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  const filtered = useMemo(() => students.filter((student) =>
    `${student.name} ${student.id}`.toLowerCase().includes(query.toLowerCase())), [students, query]);
  const metrics = useMemo(() => ({
    present: 40 - students.filter((student) => student.attendance !== "Có mặt").length,
    late: students.filter((student) => student.attendance === "Đi muộn").length,
    absent: students.filter((student) => student.attendance.startsWith("Vắng")).length,
    phone: 32 + students.filter((student) => student.phone !== "").length,
  }), [students]);

  const updateStudent = (id: string, key: "attendance" | "phone", value: string) => {
    setStudents((current) => current.map((student) => student.id === id ? { ...student, [key]: value } as Student : student));
    setNotice("Đã tự động lưu thay đổi");
    window.setTimeout(() => setNotice(""), 1800);
  };

  const navItems = ["Điểm danh", "Theo dõi lớp", "Quản trị"];

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
        <div className="account"><span className="account-avatar">LT</span><span><strong>Đại diện 10A1</strong><small>Học sinh</small></span></div>
        <button className="menu-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Mở menu">☰</button>
      </header>

      <main>
        {active === "Điểm danh" && <section className="page attendance-page">
          <div className="page-heading">
            <div><span className="eyebrow">THỨ HAI · 03/08/2026</span><h1>Chào buổi sáng, lớp 10A1! 👋</h1><p>Hãy hoàn tất điểm danh và kiểm tra điện thoại trước khi vào tiết học.</p></div>
            <div className="heading-controls"><label>Ngày<input type="date" defaultValue="2026-08-03" /></label><label>Lớp<select defaultValue="10A1"><option>10A1</option></select></label></div>
          </div>

          <div className="metric-grid">
            <article className="metric blue"><span className="metric-icon">👥</span><div><strong>40</strong><small>Tổng học sinh</small></div></article>
            <article className="metric green"><span className="metric-icon">✓</span><div><strong>{metrics.present}</strong><small>Có mặt</small></div></article>
            <article className="metric orange"><span className="metric-icon">◷</span><div><strong>{metrics.late}</strong><small>Đi muộn</small></div></article>
            <article className="metric red"><span className="metric-icon">!</span><div><strong>{metrics.absent}</strong><small>Vắng mặt</small></div></article>
            <article className="metric purple"><span className="metric-icon">▯</span><div><strong>{metrics.phone}/40</strong><small>Đã cập nhật ĐT</small></div></article>
          </div>

          <article className="workspace-card">
            <div className="workspace-toolbar">
              <div><h2>Danh sách học sinh</h2><p>Mọi thay đổi được lưu tự động</p></div>
              <div className="toolbar-actions"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm tên hoặc mã học sinh..." aria-label="Tìm học sinh" /><button onClick={() => setStudents((current) => current.map((student) => ({ ...student, attendance: "Có mặt" })))}>✓ Tất cả có mặt</button><button className="accent" onClick={() => setStudents((current) => current.map((student) => ({ ...student, phone: "Đã nộp" })))}>▯ Tất cả đã nộp</button></div>
            </div>
            <div className="student-table">
              <div className="student-row table-head"><span>STT</span><span>Học sinh</span><span>Điểm danh</span><span>Điện thoại</span><span>Tình trạng</span></div>
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
          <div className="overview-banner"><div><span>Tiến độ hôm nay</span><strong>43/50 lớp</strong><small>đã hoàn tất điểm danh</small></div><div className="progress"><i style={{ width: "86%" }} /></div><b>86%</b></div>
          <div className="class-grid">{classes.map((item, index) => <article className="class-card" key={item.name}><div className={`class-ribbon ribbon-${index % 3}`} /><div className="class-card-head"><span className="class-badge">{item.name}</span><span className={item.done ? "status-chip ready" : "status-chip waiting"}>{item.done ? "Đã hoàn tất" : "Chưa hoàn tất"}</span></div><h3>{item.teacher}</h3><small>Giáo viên chủ nhiệm</small><div className="class-stats"><span><b>{item.present}/{item.total}</b>Có mặt</span><span><b>{item.phone}/{item.total}</b>Điện thoại</span></div><button onClick={() => setActive("Điểm danh")}>Xem chi tiết →</button></article>)}</div>
        </section>}

        {active === "Quản trị" && <section className="page">
          <div className="page-heading"><div><span className="eyebrow">QUẢN TRỊ HỆ THỐNG</span><h1>Trung tâm quản lý</h1><p>Quản lý lớp học, học sinh, tài khoản và các quy tắc điểm danh.</p></div><button className="primary-button">＋ Tạo lớp mới</button></div>
          <div className="admin-grid">
            {[{icon:"🏫", title:"Lớp học", value:"50", text:"Tạo lớp, phân công GVCN và đại diện lớp", color:"blue"},{icon:"🎓", title:"Học sinh", value:"1.000", text:"Thêm từng em hoặc nhập danh sách Excel/CSV", color:"orange"},{icon:"👩‍🏫", title:"Giáo viên", value:"70", text:"Tạo tài khoản và phân quyền theo từng lớp", color:"green"},{icon:"📱", title:"Trạng thái điện thoại", value:"4", text:"Tùy chỉnh tên, màu sắc và thứ tự hiển thị", color:"purple"}].map((item) => <article className="admin-card" key={item.title}><span className={`admin-icon ${item.color}`}>{item.icon}</span><div><small>{item.title}</small><strong>{item.value}</strong><p>{item.text}</p></div><button>Quản lý →</button></article>)}
          </div>
          <article className="quick-card"><div><span className="quick-icon">⇧</span><div><h2>Nhập danh sách học sinh</h2><p>Tải lên tệp Excel/CSV hoặc dán danh sách để thêm nhiều học sinh cùng lúc.</p></div></div><button>Nhập danh sách</button></article>
        </section>}
      </main>
      <div className="toast" aria-live="polite">{notice}</div>
    </div>
  );
}
