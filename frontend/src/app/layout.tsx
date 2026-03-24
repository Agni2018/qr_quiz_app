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
    icons: {
        icon: [
            { url: '/favicon.ico' },
            { url: '/favicon.svg', type: 'image/svg+xml' },
        ],
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning={true}>
            <head>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            (function() {
                                try {
                                    var savedTheme = localStorage.getItem('quiz-theme');
                                    var migrated = localStorage.getItem('theme-migrated-v2');
                                    var theme = 'dark';
                                    
                                    if (migrated && savedTheme && (savedTheme === 'dark' || savedTheme === 'emerald')) {
                                        theme = savedTheme;
                                    } else {
                                        localStorage.setItem('quiz-theme', 'dark');
                                        localStorage.setItem('theme-migrated-v2', 'true');
                                    }
                                    
                                    document.documentElement.setAttribute('data-theme', theme);
                                } catch (e) {}
                            })()
                        `,
                    }}
                />
            </head>
            <body className={inter.className}>
                <ThemeProvider>
                    <BFCacheHandler />
                    {children}
                </ThemeProvider>
            </body>
        </html>
    );
}
