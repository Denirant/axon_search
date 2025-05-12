import React, { useState } from 'react';
import {
    X,
    Command,
    Keyboard,
    Search,
    Zap,
    Edit,
    ArrowUpRight,
    CornerDownLeft,
    MousePointer,
    Clipboard,
} from 'lucide-react';
import { createPortal } from 'react-dom';

const ShortcutsModal = ({ isOpen, onClose }) => {
    const [activeCategory, setActiveCategory] = useState('general');

    if (!isOpen) return null;

    const categories = [
        { id: 'general', name: 'Основные', icon: <Command className="h-4 w-4" /> },
        { id: 'navigation', name: 'Навигация', icon: <MousePointer className="h-4 w-4" /> },
        { id: 'advanced', name: 'Продвинутые', icon: <Zap className="h-4 w-4" /> },
    ];

    const shortcuts = {
        general: [
            { keys: ['Ctrl', 'N'], description: 'Создать новый чат/поиск' },
            { keys: ['Ctrl', 'S'], description: 'Сохранить чат/поиск' },
            { keys: ['Ctrl', 'Z'], description: 'Отменить действие' },
            { keys: ['Ctrl', 'Y'], description: 'Повторить действие' },
        ],
        navigation: [
            { keys: ['Tab'], description: 'Открыть окно модулей' },
            { keys: ['Home'], description: 'Открыть главную страницу (поисковик)' },
            { keys: ['Page Up'], description: 'Прокрутка вверх' },
            { keys: ['Page Down'], description: 'Прокрутка вниз' },
        ],
        advanced: [
            { keys: ['Ctrl', 'Shift', 'N'], description: 'Создать новую приватный чат/поиск' },
            { keys: ['Alt', 'S'], description: 'Открыть настройки' },
            { keys: ['Ctrl', 'Alt', 'D'], description: 'Удалить выбранный файл/файлы' },
            { keys: ['Ctrl', 'Shift', 'L'], description: 'Выйти из аккаунта' },
        ],
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleCopyToClipboard = () => {
        const activeShortcuts = shortcuts[activeCategory];
        const text = activeShortcuts
            .map((shortcut) => `${shortcut.keys.join(' + ')}: ${shortcut.description}`)
            .join('\n');

        navigator.clipboard
            .writeText(text)
            .then(() => {
                alert('Шорткаты скопированы в буфер обмена!');
            })
            .catch((err) => {
                console.error('Ошибка при копировании: ', err);
            });
    };

    return createPortal(
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center"
            onClick={handleBackdropClick}
            style={{
                zIndex: 99999,
                isolation: 'isolate',
                position: 'fixed',
            }}
        >
            <div className="bg-white dark:bg-neutral-900 w-[80%] max-w-3xl rounded-3xl shadow-xl overflow-hidden animate-fadeIn">
                <div className="flex justify-between items-start py-4 px-4 mt-2">
                    <div className="w-full pl-3">
                        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">
                            Горячие клавиши
                        </h2>
                    </div>
                    <div className="w-full h-10 flex items-start justify-end pr-2">
                        <button
                            onClick={onClose}
                            className="p-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* Категории шорткатов */}
                <div className="">
                    <div className="flex overflow-x-auto px-6 py-1 gap-2 scrollbar-hide">
                        {categories.map((category) => (
                            <button
                                key={category.id}
                                className={`px-4 py-2 rounded-2xl whitespace-nowrap text-sm font-medium transition-colors flex items-center gap-2 ${
                                    activeCategory === category.id
                                        ? 'bg-neutral-700 text-white'
                                        : 'bg-neutral-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                                }`}
                                onClick={() => setActiveCategory(category.id)}
                            >
                                {category.icon}
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Таблица шорткатов */}
                <div className="p-6">
                    <div className="mb-4 flex justify-between items-center">
                        <h3 className="text-md font-medium text-neutral-800 dark:text-neutral-200">
                            {categories.find((cat) => cat.id === activeCategory)?.name} шорткаты
                        </h3>
                        <button
                            onClick={handleCopyToClipboard}
                            className="flex items-center text-xs px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        >
                            <Clipboard className="h-3.5 w-3.5 mr-2" />
                            Копировать все
                        </button>
                    </div>

                    <div className="bg-neutral-50 dark:bg-neutral-800 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
                        <table className="w-full">
                            <thead className="bg-neutral-100 dark:bg-neutral-700/50">
                                <tr>
                                    <th className="text-center py-3 px-4 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Сочетание клавиш
                                    </th>
                                    <th className="border-l border-neutral-200 dark:border-neutral-700 text-center py-3 px-4 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Действие
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                                {shortcuts[activeCategory].map((shortcut, index) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-neutral-100 dark:hover:bg-neutral-700/30 transition-colors"
                                    >
                                        <td className="py-3 px-4 flex items-center justify-center gap-1.5 ">
                                            {shortcut.keys.map((key, keyIndex) => (
                                                <React.Fragment key={keyIndex}>
                                                    <kbd className="px-2 py-1 text-xs font-semibold text-neutral-700 bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 rounded-md shadow-sm">
                                                        {key}
                                                    </kbd>
                                                    {keyIndex < shortcut.keys.length - 1 && (
                                                        <span className="text-neutral-400">+</span>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </td>
                                        <td className="py-3 px-4 text-sm text-center border-l border-neutral-200 dark:border-neutral-700/80 text-neutral-700 dark:text-neutral-300">
                                            {shortcut.description}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700">
                        <div className="flex items-start">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Используйте{' '}
                                    <kbd className="px-1.5 py-0.5 text-xs font-semibold text-neutral-700 bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 rounded-md shadow-sm">
                                        Ctrl
                                    </kbd>{' '}
                                    +{' '}
                                    <kbd className="px-1.5 py-0.5 text-xs font-semibold text-neutral-700 bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 rounded-md shadow-sm">
                                        K
                                    </kbd>{' '}
                                    в любом месте приложения, чтобы быстро открыть это окно с горячими клавишами.
                                </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 pt-0 dark:border-neutral-800 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-2xl bg-neutral-700 dark:bg-neutral-800 text-white text-sm font-medium hover:bg-neutral-700/90 dark:hover:bg-neutral-700/80 transition-colors"
                    >
                        Закрыть
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
};

// // Демонстрационный компонент
// export default function ShortcutsModalDemo() {
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   return (
//     <div className="p-4">
//       <button
//         onClick={() => setIsModalOpen(true)}
//         className="px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors flex items-center gap-1.5"
//       >
//         <Keyboard className="h-4 w-4" />
//         Показать горячие клавиши
//       </button>

//       <ShortcutsModal
//         isOpen={isModalOpen}
//         onClose={() => setIsModalOpen(false)}
//       />
//     </div>
//   );
// }

export default ShortcutsModal;
