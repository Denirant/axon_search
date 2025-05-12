import React, { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Типы для данных обновлений
interface Update {
    id: number;
    title: string;
    description: string;
    date: string;
}

const UpdateNotification: React.FC = () => {
    const [showNotification, setShowNotification] = useState<boolean>(false);
    const [showModal, setShowModal] = useState<boolean>(false);

    // При монтировании компонента проверяем localStorage
    useEffect(() => {
        const shouldShowUpdate = localStorage.getItem('showUpdate');
        // Если ключа нет или значение "true" - показываем уведомление
        if (shouldShowUpdate === null || shouldShowUpdate === 'true') {
            setShowNotification(true);
            // Устанавливаем значение "false" в localStorage после первого рендера
            localStorage.setItem('showUpdate', 'false');
        }
    }, []);

    // Данные обновлений
    const updates: Update[] = [
        {
            id: 1,
            title: 'New UI Design',
            description: 'Completely redesigned interface with improved accessibility.',
            date: 'May 3, 2025',
        },
        {
            id: 2,
            title: 'Performance Boost',
            description: '50% faster loading times across all pages.',
            date: 'May 2, 2025',
        },
        { id: 3, title: 'Dark Mode', description: 'Toggle between light and dark themes.', date: 'May 1, 2025' },
        {
            id: 4,
            title: 'Mobile Improvements',
            description: 'Better responsive design for all screen sizes.',
            date: 'April 30, 2025',
        },
    ];

    const handleNotificationClick = (): void => {
        setShowModal(true);
        setShowNotification(false); // Скрывать уведомление при открытии модального окна
    };

    const handleCloseNotification = (e: React.MouseEvent): void => {
        e.stopPropagation();
        setShowNotification(false);
    };

    const handleCloseModal = (): void => {
        setShowModal(false);
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>): void => {
        if (e.target === e.currentTarget) {
            setShowModal(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {showNotification && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        transition={{ duration: 0.2 }}
                        onClick={handleNotificationClick}
                        className="absolute bottom-14 right-3 flex flex-col gap-2 w-56 h-32 bg-gray-100 rounded-3xl cursor-pointer transition-all duration-200 pointer-events-auto"
                    >
                        <h3 className="w-fit h-fit absolute text-center top-1/2 left-1/2 -translate-x-1/2 text-nowrap -translate-y-[48px] leading-[26px] text-[24px] font-bold font-syne text-neutral-50 px-3 py-1 rounded-3xl z-10">
                            Search <br /> Upgrade
                        </h3>

                        <div className="group w-[212px] h-8 hover:h-[116px] absolute flex left-1.5 bottom-1.5 bg-white/90 hover:bg-white rounded-2xl z-30 overflow-hidden transition-all duration-300 ease-in-out">
                            <motion.p className="group-hover:text-2xl group-hover:font-bold font-syne w-full px-4 pl-5 py-2 flex items-center justify-center text-sm font-semibold text-neutral-600 hover:text-neutral-800 transition-all duration-300 ease-in-out">
                                View
                                <ArrowRight className="group-hover:w-5 group-hover:h-5 w-3 h-3 ml-1 transition-all duration-300 ease-in-out" strokeWidth={2.5} />
                            </motion.p>
                        </div>

                        <img
                            src="https://cdn.openai.com/API/docs/images/model-page/model-art/gpt-4.1.jpg"
                            alt="Update preview"
                            className="w-full rounded-[20px] h-full object-cover"
                        />

                        <motion.button
                            whileHover={{ scale: 1 }}
                            whileTap={{ scale: 0.9 }}
                            className="w-7 h-7 absolute top-2 right-2 p-1.5 flex items-center justify-center z-20 bg-gray-100/10 rounded-xl hover:bg-gray-700/20 transition-all duration-100"
                            onClick={handleCloseNotification}
                        >
                            <X
                                className="-rotate-90 w-6 h-6 text-neutral-100/30 hover:text-white transition-all duration-100"
                                strokeWidth={2}
                            />
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 pointer-events-auto backdrop-blur-sm"
                        onClick={handleBackdropClick}
                        style={{ zIndex: '99999' }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 10 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 10 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-3xl shadow-lg max-w-md w-full max-h-[90vh] overflow-hidden p-2"
                        >
                            <div className="relative h-40">
                                <img
                                    src="/api/placeholder/400/320"
                                    alt="Update header"
                                    className="w-full h-full object-cover rounded-2xl"
                                />
                                <h2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-3 text-2xl font-mono font-bold text-gray-50">
                                    Search Update
                                </h2>
                                <button
                                    className="absolute top-4 right-4 w-8 h-8 bg-black/20 rounded-full flex items-center justify-center hover:bg-black/30 transition-colors"
                                    onClick={handleCloseModal}
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto max-h-[60vh]">
                                <ul className="space-y-5">
                                    {updates.map((update) => (
                                        <motion.li
                                            key={update.id}
                                            initial={{ opacity: 0, x: -5 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: update.id * 0.08 }}
                                            className="flex items-start"
                                        >
                                            <div className="w-1.5 h-1.5 mt-2 rounded-full bg-gray-400 mr-4" />
                                            <div>
                                                <h3 className="font-medium text-gray-900 text-base">{update.title}</h3>
                                                <p className="text-gray-600 text-sm mt-1">{update.description}</p>
                                            </div>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-2 flex justify-end items-center">
                                <button
                                    className="px-5 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-full text-sm font-medium transition-colors"
                                    onClick={handleCloseModal}
                                >
                                    Got it
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default UpdateNotification;