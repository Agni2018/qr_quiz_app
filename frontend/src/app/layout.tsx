import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import BFCacheHandler from "@/components/BFCacheHandler";

const inter = Inter({
    subsets: ["latin"],
    weight: ['300', '400', '500', '600', '700', '800', '900'],
    display: 'swap',
});

export const metadata: Metadata = {
    title: "QR Quiz Platform",
    description: "Topic-based quizzes via QR code",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <ThemeProvider>
                    <BFCacheHandler />
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
