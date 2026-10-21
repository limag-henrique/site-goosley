import type { Metadata } from 'next';
import ResearchPortal from './portal';

export const metadata: Metadata = {
  title: 'Pesquisa musical · Goosley',
  description: 'Leitura metodológica e avaliação independente de letras musicais.',
  robots: { index: false, follow: false, noarchive: true },
};

export default function Page() { return <ResearchPortal />; }
