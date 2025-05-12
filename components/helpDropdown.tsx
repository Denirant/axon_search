import { useRef, useState, useEffect,  } from 'react';
import { ShieldQuestion, Zap, FileText, MessageSquare } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ShortcutsModal from './ShortCuts';
import Link from 'next/link';

export default function HelpDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Animations for dropdown
    const dropdownVariants = {
        hidden: {
            opacity: 0,
            y: 5,
            scale: 0.95,
            transition: {
                duration: 0.15,
                ease: 'easeInOut',
            },
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            transition: {
                duration: 0.2,
                ease: 'easeOut',
            },
        },
        exit: {
            opacity: 0,
            y: 5,
            scale: 0.95,
            transition: {
                duration: 0.15,
                ease: 'easeInOut',
            },
        },
    };

    return (
        <div className="w-screen h-screen fixed top-0 left-0 pointer-events-none">
            <div className="absolute bottom-3 right-3" ref={dropdownRef}>
                <button
                    className=" pointer-events-auto bg-gray-200 dark:bg-neutral-600 p-2 rounded-full cursor-pointer hover:bg-gray-300/80 dark:hover:bg-neutral-700/80 text-gray-500 dark:text-neutral-400 hover:text-gray-800 dark:hover:text-neutral-50 transition-colors duration-300"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <ShieldQuestion className="w-4 h-4" />
                </button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            className="pointer-events-auto absolute px-1 right-0 bottom-10 w-[250px] rounded-2xl bg-white dark:bg-neutral-800 shadow-md ring-black ring-opacity-5 border border-neutral-100 dark:border-neutral-700 overflow-hidden z-50"
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={dropdownVariants}
                        >
                            <div className="py-1">
                                <button
                                    onClick={() => {
                                        setIsModalOpen(true);
                                        setIsOpen(false);
                                    }}
                                    className="rounded-xl flex items-center w-full px-4 py-2.5 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-150"
                                >
                                    <Zap className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                                    Быстрые действия
                                </button>

                                <Link href="/">
                                    <button
                                        // onClick={() => alert('Temp disabled')}
                                        className="rounded-xl flex items-center w-full px-4 py-2.5 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-150"
                                    >
                                        <FileText className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                                        Документация
                                    </button>
                                </Link>

                                <span className="block bg-neutral-100 dark:bg-neutral-700 my-1 w-[90%] mx-auto h-[1px]"></span>

                                <button
                                    onClick={() => alert('Temp disabled')}
                                    className="rounded-xl flex items-center w-full px-4 py-2.5 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-150"
                                >
                                    <MessageSquare className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                                    Отзыв
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <ShortcutsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            {/* //   const [isModalOpen, setIsModalOpen] = useState(false);
  
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
//   ); */}
        </div>
    );
}
