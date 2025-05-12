'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronRight, Code, Info, ChevronDown, ExternalLink, Menu, X, Edit, Github, Home, ArrowLeft } from 'lucide-react';
import { TelegramLogo } from '@phosphor-icons/react';

export default function DocumentationComponent() {
    // Состояния компонента
    const [activePage, setActivePage] = useState('overview');
    const [searchQuery, setSearchQuery] = useState('');
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [expandedSections, setExpandedSections] = useState({ info: true, dev: true });
    const [activeHeading, setActiveHeading] = useState('');

    // Рефы для управления скроллом
    const mainContentRef = useRef(null);
    const headingRefs = useRef({});

    // Состояние для блокировки наблюдателя при программной прокрутке
    const isScrollingRef = useRef(false);

    // Определение разделов документации
    const sections = [
        {
            id: 'info',
            title: 'Информация',
            icon: <Info className="h-4 w-4" />,
            pages: [
                { id: 'overview', title: 'Обзор' },
                { id: 'installation', title: 'Начало работы' },
                { id: 'configuration', title: 'Настройка' },
            ],
        },
        {
            id: 'dev',
            title: 'Использование',
            icon: <Code className="h-4 w-4" />,
            pages: [
                { id: 'api', title: 'AI поиск' },
                { id: 'examples', title: 'Примеры' },
                { id: 'plugins', title: 'Модули' },
            ],
        },
    ];

    // Содержимое страниц (markdown)
    const pageContent = {
        overview: `
# Обзор

Фреймворк для создания интерфейсов с открытым исходным кодом.

## Особенности

- Быстрый
- Легкий
- Расширяемый
- Совместим с популярными библиотеками
    `,
        installation: `
# Установка

## Быстрый старт

\`\`\`bash
npm install myframework
\`\`\`

## Docker

\`\`\`bash
docker pull myframework/latest
\`\`\`
    `,
        configuration: `
# Настройка

## Основные параметры

\`\`\`js
// config.js
module.exports = {
  port: 3000,
  debug: true,
  theme: 'dark'
}
\`\`\`

## Расширенные настройки

Поддерживаются различные плагины и интеграции.
    `,
        api: `
# API

## Core API

\`\`\`js
import { createApp } from 'myframework'

const app = createApp()
app.mount('#root')
\`\`\`

## Хуки

| Хук | Описание |
|-----|----------|
| useData | Доступ к данным |
| useState | Локальное состояние |
| useEffect | Эффекты жизненного цикла |
    `,
        examples: `
# Примеры

## Простое приложение

\`\`\`js
import { createApp, useData } from 'myframework'

function Counter() {
  const [count, setCount] = useData(0)
  
  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>
        Увеличить
      </button>
    </div>
  )
}

createApp().mount(Counter, '#app')
\`\`\`
    `,
        plugins: `
# Плагины

## Официальные плагины

- Router: навигация по страницам
- Store: глобальное хранилище данных
- UI: готовые UI компоненты

## Сторонние плагины

Сообщество создало десятки полезных плагинов.
    `,
    };

    // Получить заголовки из markdown для оглавления
    const getHeadings = (content) => {
        const headings = [];
        const lines = content.split('\n');

        lines.forEach((line) => {
            if (line.startsWith('# ')) {
                headings.push({
                    id: line.substring(2).toLowerCase().replace(/\s+/g, '-'),
                    title: line.substring(2),
                    level: 1,
                });
            } else if (line.startsWith('## ')) {
                headings.push({
                    id: line.substring(3).toLowerCase().replace(/\s+/g, '-'),
                    title: line.substring(3),
                    level: 2,
                });
            }
        });

        return headings;
    };

    // Сброс скролла при смене страницы
    useEffect(() => {
        if (mainContentRef.current) {
            mainContentRef.current.scrollTop = 0;
        }
        setActiveHeading('');
        headingRefs.current = {};
    }, [activePage]);

    // Инициализация наблюдателя за заголовками
    useEffect(() => {
        // Задержка для полного рендеринга содержимого
        const timer = setTimeout(() => {
            // Сначала получим все заголовки и сохраним их в refs
            const headingElements = document.querySelectorAll('#main-content h1[id], #main-content h2[id]');

            headingElements.forEach((el) => {
                headingRefs.current[el.id] = el;
            });

            // Создаем и настраиваем наблюдатель
            const observer = new IntersectionObserver(
                (entries) => {
                    // Пропускаем обработку, если скролл был вызван программно
                    if (isScrollingRef.current) return;

                    // Получаем видимые заголовки и сортируем их по положению
                    const visibleHeadings = entries
                        .filter((entry) => entry.isIntersecting)
                        .sort((a, b) => {
                            const posA = a.boundingClientRect.top;
                            const posB = b.boundingClientRect.top;
                            return posA - posB;
                        });

                    // Устанавливаем активный заголовок
                    if (visibleHeadings.length > 0) {
                        setActiveHeading(visibleHeadings[0].target.id);
                    }
                },
                {
                    root: mainContentRef.current,
                    rootMargin: '-100px 0px -70% 0px',
                    threshold: [0.1, 0.5],
                },
            );

            // Добавляем заголовки в наблюдение
            headingElements.forEach((heading) => {
                observer.observe(heading);
            });

            return () => {
                headingElements.forEach((heading) => {
                    observer.unobserve(heading);
                });
            };
        }, 300);

        return () => clearTimeout(timer);
    }, [activePage]);

    // Функция для плавной прокрутки к заголовку
    const scrollToHeading = (headingId) => {
        const heading = headingRefs.current[headingId];

        if (heading && mainContentRef.current) {
            // Блокируем observer во время программной прокрутки
            isScrollingRef.current = true;

            // Получаем позицию элемента относительно контейнера
            const containerTop = mainContentRef.current.getBoundingClientRect().top;
            const headingTop = heading.getBoundingClientRect().top;
            const offsetPosition = headingTop - containerTop - 100; // Отступ сверху

            // Плавная прокрутка
            mainContentRef.current.scrollBy({
                top: offsetPosition,
                behavior: 'smooth',
            });

            // Устанавливаем активный заголовок
            setActiveHeading(headingId);

            // Разблокируем observer после прокрутки
            setTimeout(() => {
                isScrollingRef.current = false;
            }, 500);
        }
    };

    // Преобразование markdown в HTML с улучшенным форматированием
    const renderMarkdown = (markdown) => {
        let html = markdown;

        // Заголовки с якорями
        html = html.replace(/^# (.*$)/gm, (match, title) => {
            const id = title.toLowerCase().replace(/\s+/g, '-');
            return `<div class="group flex items-center h-fit">
        <h1 id="${id}" class="text-2xl font-bold mt-2 mb-1 h-10 text-neutral-900 dark:text-neutral-100">
          ${title}
          <a href="#${id}" class="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-400">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
          </a>
        </h1>
      </div>`;
        });

        html = html.replace(/^## (.*$)/gm, (match, title) => {
            const id = title.toLowerCase().replace(/\s+/g, '-');
            return `<div class="group flex items-center h-fit">
        <h2 id="${id}" class="text-xl font-semibold mt-6 mb-4 text-neutral-800 dark:text-neutral-200">
          ${title}
          <a href="#${id}" class="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-neutral-400">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
            </svg>
          </a>
        </h2>
      </div>`;
        });

        // Улучшенные блоки кода
        html = html.replace(/```(\w+)?\n([\s\S]*?)```/gm, (match, lang, code) => {
            const language = lang || 'text';
            const escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

            return `
        <div class="relative mt-5 mb-6 group">
          <div class="absolute top-0 right-0 bg-neutral-100 dark:bg-neutral-800 text-xs font-mono py-1 px-2 rounded-bl-lg rounded-tr-lg text-neutral-500 dark:text-neutral-400 border-t border-r border-neutral-200 dark:border-neutral-700">${language}</div>
          <pre class="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 overflow-auto text-sm font-mono text-neutral-800 dark:text-neutral-300 shadow-sm"><code>${escapedCode}</code></pre>
          <button 
            class="absolute right-3 bottom-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 bg-white/50 dark:bg-neutral-800/50 p-1.5 rounded-md backdrop-blur-sm opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity" 
            title="Копировать код"
            onclick="navigator.clipboard.writeText(decodeURIComponent('${encodeURIComponent(code)}'))"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </button>
        </div>
      `;
        });

        // Инлайн код с лучшими стилями
        html = html.replace(
            /`([^`]+)`/g,
            '<code class="px-1.5 py-0.5 rounded text-xs font-mono bg-neutral-100 dark:bg-neutral-800 text-rose-600 dark:text-rose-400 border border-neutral-200 dark:border-neutral-700">$1</code>',
        );

        // Улучшенные списки
        html = html.replace(
            /^- (.*$)/gm,
            '<li class="flex items-start my-1.5 ml-1"><span class="inline-block w-1.5 h-1.5 rounded-full bg-neutral-400 dark:bg-neutral-600 mt-1.5 mr-2.5 flex-shrink-0"></span><span>$1</span></li>',
        );
        html = html.replace(/(<li.*<\/li>\n)+/g, '<ul class="my-3 ml-1">$&</ul>');

        // Улучшенные таблицы
        html = html.replace(/^\|([^|]+)\|([^|]+)\|/gm, (match, col1, col2) => {
            // Пропускаем разделители в таблицах Markdown
            if (col1.includes('---') && col2.includes('---')) {
                return '';
            }

            const isHeader = col1.trim().startsWith('Хук');
            const className = isHeader
                ? 'bg-neutral-100 dark:bg-neutral-800 font-semibold'
                : 'border-t border-neutral-200 dark:border-neutral-700';

            return `<tr class="${className}">
        <td class="px-4 py-2 text-sm">${col1.trim()}</td>
        <td class="px-4 py-2 text-sm">${col2.trim()}</td>
      </tr>`;
        });

        html = html.replace(
            /(<tr>.*<\/tr>\n)+/g,
            '<div class="my-5 overflow-hidden border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-sm"><table class="w-full border-collapse bg-white dark:bg-neutral-900">$&</table></div>',
        );

        // Параграфы с лучшими стилями
        html = html.replace(/^(?!<[a-z])(.*$)/gm, (match, text) => {
            if (text.trim() === '') return '';
            return `<p class="my-3 text-neutral-700 dark:text-neutral-300 leading-relaxed text-[15px]">${text}</p>`;
        });

        return html;
    };

    const activePageContent = pageContent[activePage] || '';
    const headings = getHeadings(activePageContent);

    // Функция для переключения раздела
    const toggleSection = (sectionId) => {
        setExpandedSections((prev) => ({
            ...prev,
            [sectionId]: !prev[sectionId],
        }));
    };

    // Получение предыдущей и следующей страницы для навигации
    const getNavigationPages = () => {
        let prevPage = null;
        let nextPage = null;

        // Создаем плоский список всех страниц
        const allPages = sections.flatMap((section) => section.pages);

        // Находим индекс текущей страницы
        const currentIndex = allPages.findIndex((page) => page.id === activePage);

        if (currentIndex > 0) {
            prevPage = allPages[currentIndex - 1];
        }

        if (currentIndex < allPages.length - 1) {
            nextPage = allPages[currentIndex + 1];
        }

        return { prevPage, nextPage };
    };

    const { prevPage, nextPage } = getNavigationPages();

    return (
        <div className="flex flex-col h-screen bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200">
            <div className="flex flex-1 overflow-hidden">
                {/* Боковое меню */}
                <aside
                    className={`w-[300px] border-r overflow-y-auto flex-shrink-0 md:sticky top-4 left-4 h-[calc(100vh-2rem)] rounded-3xl border border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 transition-all duration-300`}
                >
                    <div className="flex-1 flex justify-end items-center gap-2 p-3">
                        <button className="group flex items-center justify-center border-neutral-200 hover:bg-neutral-200/80 bg-neutral-200/50 rounded-2xl">
                            <a href="/" className="w-full h-full p-3 text-neutral-600/90 group-hover:text-neutral-700">
                                <ArrowLeft className="w-5 h-5" />
                            </a>
                        </button>
                        <div className="relative max-w-md w-full">
                            <input
                                type="text"
                                placeholder="Поиск..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                            />
                            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                                <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded-md border bg-neutral-50 px-1.5 font-mono text-[10px] font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-400">
                                    <span className="text-xs">⌘</span> + K
                                </kbd>
                            </div>
                        </div>
                    </div>
                    <nav className="p-3 md:p-4 flex flex-col gap-1 h-[calc(93.25%)]">
                        {sections.map((section) => (
                            <div key={section.id} className="mb-3">
                                <button
                                    className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800/70 transition-colors"
                                    onClick={() => toggleSection(section.id)}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="h-5 w-5 rounded-md bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-500 dark:text-neutral-400">
                                            {section.icon}
                                        </div>
                                        <span>{section.title}</span>
                                    </div>
                                    <ChevronDown
                                        className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${
                                            expandedSections[section.id] ? 'rotate-180' : ''
                                        }`}
                                    />
                                </button>

                                {expandedSections[section.id] && (
                                    <div className="mt-1 ml-4 flex flex-col">
                                        {section.pages.map((page) => (
                                            <button
                                                key={page.id}
                                                className={`flex items-center relative px-3 py-2 rounded-lg text-sm ${
                                                    activePage === page.id
                                                        ? 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 font-medium'
                                                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                                                }`}
                                                onClick={() => {
                                                    setActivePage(page.id);
                                                    setShowMobileMenu(false);
                                                }}
                                            >
                                                {activePage === page.id && (
                                                    <div className="absolute left-0 w-1 h-5 bg-blue-500 rounded-full" />
                                                )}
                                                {page.title}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}

                        <div className="mt-auto mb-0.5 pt-4 border-t border-neutral-200/60 dark:border-neutral-800">
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center p-3 px-4 text-md rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800/70 text-neutral-600 dark:text-neutral-400 group"
                            >
                                <div className="flex items-center gap-3 text-neutral-800">
                                    <TelegramLogo className="h-4 w-4" />
                                    <span>Telegram</span>
                                </div>
                            </a>
                        </div>
                    </nav>
                </aside>

                {/* Оверлей для закрытия мобильного меню */}
                {showMobileMenu && (
                    <div
                        className="fixed inset-0 bg-black/20 dark:bg-black/50 z-10 md:hidden"
                        onClick={() => setShowMobileMenu(false)}
                    />
                )}

                {/* Основное содержимое и оглавление */}
                <div className="flex flex-1 overflow-hidden min-w-0 w-full">
                    {/* Основной контент */}
                    <main
                        ref={mainContentRef}
                        id="main-content"
                        className="flex items-center justify-center h-full overflow-y-auto px-4 py-6 md:px-8 md:py-10 min-w-0 w-full"
                    >
                      <p className='text-2xl text-neutral-300 pb-80'>
                        Основной контент документации (пример)
                      </p>
                    </main>

                    {/* Оглавление */}
                    <aside className="w-[300px] border-r overflow-y-auto flex-shrink-0 md:sticky top-4 right-4 h-fit p-3 rounded-3xl border border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 transition-all duration-300">
                        {headings.length > 0 && (
                            <div className="h-fit p-1 px-2 rounded-2xl">
                                <nav className="flex flex-col">
                                    {headings.map((heading) => (
                                        <button
                                            key={heading.id}
                                            onClick={() => scrollToHeading(heading.id)}
                                            className={`relative text-left py-1.5 mt-1 px-4 text-sm rounded-lg my-0.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                                                activeHeading === heading.id
                                                    ? 'bg-neutral-100 dark:bg-neutral-800 text-blue-500 dark:text-blue-400 font-medium'
                                                    : heading.level === 1
                                                    ? 'font-medium text-blue-600 dark:text-neutral-300'
                                                    : 'pl-8 text-neutral-500 dark:text-neutral-400'
                                            }`}
                                        >
                                            <span
                                                className={`absolute top-1/2 -translate-y-1/2 w-[4px] rounded-full h-3/5  ${
                                                    heading.level !== 1 ? 'left-5 bg-neutral-200/50' : 'left-1 bg-blue-500/80'
                                                }`}
                                            ></span>
                                            {heading.title}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
}
