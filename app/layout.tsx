import type { Metadata } from "next";
import "./globals.css"; // This imports your styles

export const metadata: Metadata = {
  title: "Team Tracker",
  description: "Checklist app synced with Supabase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
