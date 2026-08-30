import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Earthform Creature Prototype",
  description: "Spielbarer 2D-Mobile-God-Game-Prototyp im Browser.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
