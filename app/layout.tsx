import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FSchool Attend | Điểm danh đầu giờ",
  description: "Hệ thống điểm danh và theo dõi trạng thái điện thoại dành cho FPT Schools.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
