import type { Metadata } from "next";
import { Source_Sans_3 as FontSans } from "next/font/google";
import "./globals.css";
import Header from "@/components/common/header";
import Providers from "./provider";
import { getTokenStatus } from "./actions/cookies";

const fontSans = FontSans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"]
});

export const metadata: Metadata = {
  title: "Snipnote",
  description: "Snipnote is an AI powered PDF summarization tool.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tokenStatus = await getTokenStatus()
  return (
    <html lang="en">
      <body
        className={`${fontSans.variable} font-sans antialiased`}
      >
        <div className="flex flex-col relative min-h-screen">
          <Providers tokenStatus={tokenStatus}>
            <Header />
            <main className="flex-1">
              {children}
            </main>
          </Providers>
        </div>

      </body>
    </html>
  );
}
