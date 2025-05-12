/* eslint-disable @next/next/no-img-element */
'use client';
import 'katex/dist/katex.min.css';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ChevronDown,
    X,
    Settings,
    Bookmark,
    PanelRightClose,
    ChevronUp,
    ChevronRight,
    Clock,
    Search,
    EllipsisVertical,
    Zap,
    Sparkles,
    Scale,
    Telescope,
    ListFilter,
    History,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

const TabSelector = ({ activeTab, setActiveTab, itemVariants }) => {
    // Реф для измерения ширины контейнера табов
    const tabsRef = useRef(null);

    return (
        <motion.div
            className="relative flex bg-gray-200/80 dark:bg-neutral-700/60 rounded-3xl px-1 py-1"
            variants={itemVariants}
            ref={tabsRef}
        >
            <motion.div
                className="absolute inset-y-1.5 inset-x-1.5 w-[48%] bg-black/70 dark:bg-neutral-100 rounded-3xl z-999"
                initial={false}
                animate={{
                    x: activeTab === 'history' ? 0 : '102%',
                }}
                transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 38, // Уменьшено затухание для большего отскока
                    mass: 1.5, // Увеличена масса для эффекта инерции
                    velocity: 10, // Добавлена начальная скорость
                    restDelta: 0.001, // Меньшая точность остановки для плавности
                }}
            />
            <button
                className={`group flex-1 py-2 px-1 w-full relative text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'history' ? 'text-white dark:text-neutral-900' : 'text-gray-500 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-300'
                }`}
                onClick={() => setActiveTab('history')}
            >
                <span className="flex items-center justify-center gap-2">
                    <Clock className={`w-4 h-4 transition-colors ${activeTab === 'history' ? 'stroke-white dark:stroke-neutral-900' : 'stroke-gray-500 dark:stroke-neutral-500 group-hover:stroke-gray-700 dark:group-hover:stroke-neutral-300'}`} />
                    <span>История</span>
                </span>
            </button>

            <button
                className={`group flex-1 py-2 px-1 w-full relative text-sm font-medium rounded-lg transition-colors ${
                    activeTab === 'bookmarks' ? 'text-white dark:text-neutral-900' : 'text-gray-500 dark:text-neutral-500 hover:text-gray-700 dark:hover:text-neutral-300'
                }`}
                onClick={() => setActiveTab('bookmarks')}
            >
                <span className="flex items-center justify-center gap-2">
                    <Bookmark className={`w-4 h-4 transition-colors ${activeTab === 'bookmarks' ? 'stroke-white dark:stroke-neutral-900' : 'stroke-gray-500 dark:stroke-neutral-500 group-hover:stroke-gray-700 dark:group-hover:stroke-neutral-300'}`} />
                    <span>Закладки</span>
                </span>
            </button>
        </motion.div>
    );
};

const FakeSearchHeader = ({ itemVariants }) => {
    const [searchValue, setSearchValue] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('all');
    const inputRef = useRef(null);

    // Имитация изменения поискового запроса
    const handleSearchChange = (e) => {
        setSearchValue(e.target.value);
    };

    // Очистка поля поиска
    const clearSearch = () => {
        setSearchValue('');
        inputRef.current.focus();
    };

    // Переключение фильтра
    const toggleFilter = () => {
        setIsFilterOpen(!isFilterOpen);
    };

    // Выбор фильтра (только визуальный эффект)
    const selectFilter = (filter) => {
        setSelectedFilter(filter);
        setIsFilterOpen(false);
    };

    // Имитация фильтров
    const filters = [
        { id: 'tech', label: 'Сначала новые' },
        { id: 'cooking', label: 'Сначала старые' },
        { id: 'travel', label: 'От А до Я' },
        { id: 'dev', label: 'От Я до А' },
    ];

    return (
        <motion.div className="relative w-full" variants={itemVariants}>
            <div className="flex items-center gap-2 px-1">
                <div className="relative flex-1 flex items-center bg-gray-100 dark:bg-neutral-700 rounded-xl overflow-hidden">
                    <Search className="w-4 h-4 text-gray-500 dark:text-neutral-200 absolute left-2.5" />

                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Поиск..."
                        value={searchValue}
                        onChange={handleSearchChange}
                        className="w-full py-2 pl-9 pr-7 text-sm bg-transparent rounded-xl dark:text-neutral-50 focus:outline-none text-neutral-800"
                    />

                    {searchValue && (
                        <button onClick={clearSearch} className="absolute right-2 text-gray-500 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <button
                    className={`p-2 rounded-xl text-neutral-600 dark:text-neutral-100 bg-neutral-100/70 dark:bg-neutral-700/70 hover:bg-gray-200 dark:hover:bg-neutral-700/40 transition-colors`}
                    onClick={toggleFilter}
                >
                    <ListFilter className="w-5 h-5" />
                </button>
            </div>

            {/* Фейковое выпадающее меню фильтра */}
            <AnimatePresence>
                {isFilterOpen && (
                    <motion.div
                        className="absolute flex flex-col gap-1 right-0 top-11 w-40 bg-white dark:bg-neutral-700 shadow-xl rounded-2xl z-10 p-1 border border-gray-100 dark:border-neutral-700"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {filters.map((filter) => (
                            <button
                                key={filter.id}
                                className={`w-full text-left font-medium px-4 py-2 text-sm rounded-xl text-neutral-500 ${
                                    selectedFilter === filter.id
                                        ? 'bg-gray-300/80 text-neutral-800 hover:text-neutral-700 hover:bg-gray-200/80'
                                        : 'hover:bg-gray-100 hover:text-gray-700'
                                }`}
                                onClick={() => selectFilter(filter.id)}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const GroupedHistoryItems = ({ historyItems }) => {
    if (historyItems.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center px-4 w-full py-8">
                <History className="w-8 h-8 text-gray-300 dark:text-neutral-500 mb-3" strokeWidth={1.5} />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-neutral-200 mb-1">Ничего не искали</h3>
                <p className="text-xs text-gray-500 dark:text-neutral-500 w-[250px]">Находите любую информацию, а мы ее аккуратно сохраним тут</p>
            </div>
        );
    }

    const groupItemsByDate = (items) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const groups = {
            today: [],
            yesterday: [],
            older: {},
        };

        items.forEach((item) => {
            // Create a Date object from the item's date string
            // Note: We need to handle date strings correctly
            const itemDate = new Date(item.date);
            itemDate.setHours(0, 0, 0, 0);

            // Format the date for display
            const formattedDate = formatDateForDisplay(itemDate);
            item.displayDate = formattedDate;

            if (itemDate.getTime() === today.getTime()) {
                groups.today.push(item);
            } else if (itemDate.getTime() === yesterday.getTime()) {
                groups.yesterday.push(item);
            } else {
                // Fix: Ensure we're using a consistent date format for the key
                // that doesn't get affected by timezone issues
                const dateKey = `${itemDate.getFullYear()}-${String(itemDate.getMonth() + 1).padStart(2, '0')}-${String(
                    itemDate.getDate(),
                ).padStart(2, '0')}`;

                if (!groups.older[dateKey]) {
                    groups.older[dateKey] = [];
                }
                groups.older[dateKey].push(item);
            }
        });

        return groups;
    };

    // Format date for display
    const formatDateForDisplay = (date) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.getTime() === today.getTime()) {
            return 'Сегодня';
        } else if (date.getTime() === yesterday.getTime()) {
            return 'Вчера';
        } else {
            // Format the date as needed, e.g., "May 1, 2025"
            return date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        }
    };

    // State to track which groups are expanded
    const [expandedGroups, setExpandedGroups] = useState({
        today: true,
        yesterday: true,
        // Initialize all older date groups as expanded
        ...Object.fromEntries(
            historyItems
                .filter((item) => {
                    const itemDate = new Date(item.date);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    return itemDate < yesterday;
                })
                .map((item) => [item.date, true]),
        ),
    });

    console.log(expandedGroups);

    // Toggle expanded state for a group
    const toggleGroup = (groupKey) => {
        setExpandedGroups((prev) => ({
            ...prev,
            [groupKey]: !prev[groupKey],
        }));
    };

    const getIconByPreference = (value) => {
        switch (value) {
            case 'speed':
                return <Zap className="w-5 h-5 fill-green-400 text-green-500" />;
            case 'quality':
                return <Sparkles className="w-5 h-5 fill-purple-400 text-purple-500" />;
            case 'balanced':
            default:
                return <Scale className="w-5 h-5 fill-blue-200 text-blue-500" />;
        }
    };

    const groupedItems = groupItemsByDate(historyItems);

    // Renders a group of items
    const renderGroup = (items, index) => {
        console.log(items);

        return (
            <div className="space-y-2 mt-2 select-none">
                {items.map((item, itemIndex) => (
                    <motion.div
                        key={item.id}
                        className="p-3 px-4 bg-gray-50 hover:bg-gray-100 w-full rounded-2xl transition-colors cursor-pointer group relative"
                        variants={{
                            hidden: { opacity: 0, y: 6 },
                            visible: {
                                opacity: 1,
                                y: 0,
                                transition: {
                                    duration: 0.3,
                                },
                            },
                            exit: {
                                opacity: 0,
                                transition: {
                                    duration: 0.3,
                                },
                            },
                        }}
                        transition={{
                            duration: 0.2,
                        }}
                    >
                        <div className="flex items-center justify-start w-full gap-3">
                            <span
                                className={`absolute w-9 h-9 top-3.5 left-4 flex items-center justify-center border-[2px]  ${
                                    item.type == 'deep_search'
                                        ? 'bg-neutral-700 opacity-100'
                                        : 'bg-gray-200/80 opacity-0'
                                } rounded-2xl`}
                            >
                                <Telescope className="w-5 h-5 text-gray-50/90" />
                            </span>
                            <div className="w-9 h-9 p-1 bg-white border-[2px] border-gray-200/50 rounded-2xl flex items-center justify-center">
                                {getIconByPreference(item.preferences)}
                            </div>
                            <div className="flex flex-col w-[260px] overflow-hidden">
                                <h3 className="w-full text-sm font-medium text-nowrap overflow-hidden text-ellipsis text-gray-900 mb-1 group-hover:text-black transition-colors">
                                    {item.title}
                                </h3>
                                <p className="w-fit text-xs text-gray-500 flex items-center gap-1">
                                    <span>{item.displayDate}</span>
                                    <span className="inline-block w-1 h-1 rounded-full bg-gray-300"></span>
                                    <span>{item.time}</span>
                                    {/* <span>{item.model_id}</span>
                                    <span>{item.type}</span> */}
                                </p>
                            </div>
                            <div className="absolute top-1/2 -translate-y-1/2 right-2.5 opacity-0 p-1.5 rounded-[12px] text-gray-500 group-hover:opacity-100 hover:text-gray-900 hover:bg-gray-200/80 transition-all duration-200">
                                <EllipsisVertical className="w-4 h-4" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6 w-full select-none">
            {/* Today's items */}
            {groupedItems.today.length > 0 && (
                <div className="space-y-2">
                    <div
                        className="flex items-center justify-between gap-2 cursor-pointer bg-gray-200/0 hover:bg-gray-200/80 duration-200 transition-colors py-2 px-4 rounded-2xl"
                        onClick={() => toggleGroup('today')}
                    >
                        <h2 className="text-sm font-semibold text-gray-700">Сегодня</h2>
                        {expandedGroups.today ? (
                            <ChevronUp className="w-4 h-4 text-gray-700" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-gray-700" />
                        )}
                    </div>
                    {expandedGroups.today && renderGroup(groupedItems.today, 0)}
                </div>
            )}

            {/* Yesterday's items */}
            {groupedItems.yesterday.length > 0 && (
                <div className="space-y-2">
                    <div
                        className="flex items-center justify-between gap-2 cursor-pointer bg-gray-200/0 hover:bg-gray-200/80 duration-200 transition-colors py-2 px-4 rounded-2xl"
                        onClick={() => toggleGroup('yesterday')}
                    >
                        <h2 className="text-sm font-semibold text-gray-700">Вчера</h2>
                        {expandedGroups.yesterday ? (
                            <ChevronUp className="w-4 h-4 text-gray-700" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-gray-700" />
                        )}
                    </div>
                    {expandedGroups.yesterday && renderGroup(groupedItems.yesterday, 1)}
                </div>
            )}

            {Object.entries(groupedItems.older).map(([dateKey, items], index) => {
                const displayDate = new Date(dateKey).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                });

                return (
                    <div key={dateKey} className="space-y-2">
                        <div
                            className="flex items-center justify-between gap-2 cursor-pointer bg-gray-200/0 hover:bg-gray-200/80 duration-200 transition-colors py-2 px-4 rounded-2xl"
                            onClick={() => toggleGroup(dateKey)}
                        >
                            <h2 className="text-sm font-semibold text-gray-700">{displayDate}</h2>
                            {expandedGroups[dateKey] ? (
                                <ChevronUp className="w-4 h-4 text-gray-700" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-gray-700" />
                            )}
                        </div>
                        {expandedGroups[dateKey] && renderGroup(items, index + 2)}
                        {console.log(dateKey)}
                    </div>
                );
            })}
        </div>
    );
};

const HistoryOverflow = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('history');
    const panelRef = useRef(null);

    const historyItems = [
        //     {
        //     id: 1,
        //     title: 'Фото лучших ресторанов спб',
        //     date: '2025-05-10',
        //     time: '12:36 PM',
        //     model_id: 'google',
        //     type: 'search',
        //     preferences: 'speed',
        // },
    ];
    // const historyItems = [
    //     {
    //         id: 5,
    //         title: 'Лучшие нейросети 2025',
    //         date: '2025-05-03',
    //         time: '03:30 PM',
    //         model_id: 'google',
    //         type: 'deep_search',
    //         preferences: 'speed',
    //     },
    // ]
    //     {
    //         id: 4,
    //         title: 'Фото МСК',
    //         date: '2025-05-03',
    //         time: '02:00 PM',
    //         model_id: 'qwen',
    //         type: 'search',
    //         preferences: 'balanced',
    //     },
    //     {
    //         id: 3,
    //         title: 'Фото Италии',
    //         date: '2025-05-03',
    //         time: '12:15 PM',
    //         model_id: 'google',
    //         type: 'search',
    //         preferences: 'speed',
    //     },
    //     {
    //         id: 2,
    //         title: 'Что такое ИИ?',
    //         date: '2025-05-03',
    //         time: '10:30 AM',
    //         model_id: 'openai',
    //         type: 'search',
    //         preferences: 'speed',
    //     },
    //     {
    //         id: 1,
    //         title: 'Что такое ИИ?',
    //         date: '2025-05-03',
    //         time: '09:21 AM',
    //         model_id: 'google',
    //         type: 'search',
    //         preferences: 'quality',
    //     },
    //     {
    //         id: 1,
    //         title: 'Анализ курса доллара за 10 последних дней?',
    //         date: '2025-05-03',
    //         time: '09:11 AM',
    //         model_id: 'google',
    //         type: 'deep_search',
    //         preferences: 'speed',
    //     },
    // ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target) && isOpen) {
                if (!event.target.closest('.toggle-button')) {
                    setIsOpen(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const openPanel = () => {
        setIsOpen(true);
    };

    const closePanel = () => {
        setIsOpen(false);
    };

    // Анимации с настройками
    const panelConfig = {
        duration: 0.4,
        ease: [0.25, 0.1, 0.25, 1],
    };

    const panelVariants = {
        hidden: { x: '-120%' },
        visible: {
            x: 0,
            transition: {
                ...panelConfig,
                staggerChildren: 0.03,
            },
        },
        exit: {
            x: '-120%',
            transition: {
                duration: 0.2,
                staggerChildren: 0,
                staggerDirection: -1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 6 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                delay: 0.2,
            },
        },
        exit: {
            opacity: 0,
            transition: {
                duration: panelConfig.duration * 0.7,
            },
        },
    };

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: panelConfig,
        },
        exit: {
            opacity: 0,
            transition: panelConfig,
        },
    };

    const buttonVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                delay: 0.2,
                duration: 0.4,
            },
        },
        exit: {
            opacity: 0,
            x: -10,
            transition: {
                duration: 0.1,
            },
        },
    };

    return (
        <div
            className="fixed inset-0 w-full h-full bg-transparent pointer-events-none overflow-hidden"
            style={{ zIndex: 9999 }}
        >
            {/* Оверлей */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="absolute inset-0 bg-black/25 backdrop-blur-[2px] pointer-events-auto"
                        variants={overlayVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        onClick={closePanel}
                    />
                )}
            </AnimatePresence>

            {/* Кнопка открытия (показывается только когда панель закрыта) */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        className="absolute top-1/2 -translate-y-1/2 left-3 z-20 flex items-center justify-center pointer-events-auto w-10 h-10 rounded-full cursor-pointer bg-white dark:bg-neutral-700 text-black dark:text-neutral-200 toggle-button hover:bg-gray-50 dark:hover:bg-neutral-700/80 transition-colors duration-300"
                        onClick={openPanel}
                        variants={buttonVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Панель истории */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        ref={panelRef}
                        className="absolute top-4 left-4 bottom-4 w-70 bg-white dark:bg-neutral-800 text-black dark:text-neutral-100 pointer-events-auto overflow-hidden rounded-3xl border border-gray-100 dark:border-neutral-900"
                        variants={panelVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <motion.div
                            className="flex items-center gap-2 justify-between p-4 pb-2"
                            variants={itemVariants}
                        >
                            <div className="flex gap-2">
                                <button
                                    className="w-9 h-9 rotate-180 flex items-center justify-center rounded-xl text-neutral-600 dark:text-neutral-100 bg-neutral-100/70 dark:bg-neutral-700/70 hover:bg-gray-200 dark:hover:bg-neutral-700/40  transition-colors"
                                    onClick={closePanel}
                                    aria-label="Закрыть"
                                >
                                    <PanelRightClose className="w-5 h-5" strokeWidth={2} />
                                </button>
                            </div>
                            <span className="mx-2 inline-block w-0.5 h-6 bg-gray-200 dark:bg-neutral-700"></span>
                            <FakeSearchHeader itemVariants={itemVariants} />
                        </motion.div>

                        {/* Табы */}
                        <div className="px-3 pt-2">
                            <TabSelector
                                activeTab={activeTab}
                                setActiveTab={setActiveTab}
                                itemVariants={itemVariants}
                            />
                        </div>

                        {/* Список элементов */}
                        <motion.div
                            className="px-4 py-3 w-full overflow-hidden overflow-y-auto h-[calc(100%-180px)]"
                            variants={itemVariants}
                        >
                            {activeTab === 'history' ? (
                                <GroupedHistoryItems historyItems={historyItems} />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center px-4 w-full py-8">
                                    <Bookmark className="w-8 h-8 text-gray-300 dark:text-neutral-500 mb-3" strokeWidth={1.5} />
                                    <h3 className="text-lg font-semibold text-gray-700 dark:text-neutral-200 mb-1">Пока что пусто</h3>
                                    <p className="text-xs text-gray-500 dark:text-neutral-500 w-[250px]">
                                        Сохраняйте интересные результаты для быстрого доступа
                                    </p>
                                </div>
                            )}
                        </motion.div>

                        {/* Подвал панели */}
                        <motion.div
                            className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white dark:from-neutral-800 to-transparent pt-8"
                            variants={itemVariants}
                        >
                            <button className="w-full py-2 px-4 bg-black/80 dark:bg-neutral-200 text-white dark:text-neutral-900 font-normal rounded-2xl hover:bg-gray-900 dark:hover:bg-neutral-50 transition-colors">
                                <span>Очистить</span>
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HistoryOverflow;
