import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Eternity Creative Assistant',
  description: 'Metodologia guiada para criar todos os materiais de uma campanha no mesmo chat.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
