import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'SmartSearch',
  description: 'Testing background color',
}

export default function RootLayout({ children, }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en" className="h-full bg-slate-500">
      <body className="h-full" >
        {children}
      </body>
    </html>
  );
}
