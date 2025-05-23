// /lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Globe, Book, YoutubeIcon, TextSearch, Database, ChartPie, MessageCircle, Tv } from 'lucide-react'
import { ChatsCircle, Code, Memory, XLogo } from '@phosphor-icons/react'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 15)}`;
}

export function getUserId(): string {
  if (typeof window === 'undefined') return '';
  
  let userId = localStorage.getItem('mem0_user_id');
  if (!userId) {
    userId = generateId('user');
    localStorage.setItem('mem0_user_id', userId);
  }
  return userId;
}

export type SearchGroupId = 'web' | 'academic' | 'youtube' | 'x' | 'analysis' | 'chat' | 'extreme' | 'buddy';

export const searchGroups = [
  {
    id: 'web' as const,
    name: 'Web',
    description: 'Search across the entire internet',
    icon: Globe,
    show: true,
  },
  // {
  //   id: 'buddy' as const,
  //   name: 'Voidy',
  //   description: 'Your personal memory companion',
  //   icon: Database,
  //   show: true,
  // },
  // {
  //   id: 'analysis' as const,
  //   name: 'Analysis',
  //   description: 'Code, stock and currency stuff',
  //   icon: ChartPie,
  //   show: true,
  // },
  {
    id: 'chat' as const,
    name: 'Chat',
    description: 'Talk to the model directly.',
    icon: MessageCircle,
    show: true,
  },
  // {
  //   id: 'academic' as const,
  //   name: 'Academic',
  //   description: 'Search academic papers powered by Exa',
  //   icon: Book,
  //   show: true,
  // },
  // {
  //   id: 'youtube' as const,
  //   name: 'YouTube',
  //   description: 'Search YouTube videos powered by Exa',
  //   icon: Tv,
  //   show: true,
  // },
  {
    id: 'extreme' as const,
    name: 'Deep Search',
    description: 'Deep research with multiple sources and analysis',
    icon: TextSearch,
    show: false,
  },
] as const;

export type SearchGroup = typeof searchGroups[number];


export function generateChatId(): string {
  return `chat_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
}

export function isValidChatId(id: string): boolean {
  return typeof id === 'string' && id.startsWith('chat_') && id.length >= 20;
}



// Рассчитать необходимое количество выпуска авиалайнеров мс-21 300 для того чтобы рост ввп составил 1 процент по отношению к 2024 году в рф. Уточни с учетом мультипликатора влияния производства высокотехнологичной продукции на смежные отрасли
