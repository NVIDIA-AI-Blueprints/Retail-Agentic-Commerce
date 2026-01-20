import type { Metadata } from "next";
import { ThemeProvider } from "@kui/foundations-react-external";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agentic Commerce | NVIDIA",
  description: "Client Agent Simulator for Agentic Commerce Protocol",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider theme="dark" density="standard" global target="html">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
