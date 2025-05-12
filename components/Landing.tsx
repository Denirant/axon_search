// components/Landing.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

export default function Landing() {
    return (
        <div className="bg-white dark:bg-gray-900">
            <header className="absolute inset-x-0 top-0 z-50">
                <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
                    <div className="flex lg:flex-1">
                        <a href="#" className="-m-1.5 p-1.5 flex items-center gap-4">
                            <img
                                className="select-none w-10 h-10 p-0.5 border-[3px] border-neutral-100 rounded-full"
                                src="./axon.svg"
                                alt=""
                            />
                            {/* Можно заменить логотип на свой */}
                            {/* <div className="h-8 w-auto text-2xl font-bold">Axon</div> */}
                        </a>
                    </div>
                    <div className="hidden lg:flex lg:flex-1 lg:justify-end">
                        <Link
                            href="/login"
                            className="cursor-pointer flex items-center gap-2 text-md font-semibold leading-6 text-neutral-600 bg-neutral-100 hover:text-neutral-900 hover:bg-neutral-200 px-6 py-2 rounded-2xl pr-4 border border-neutral-100 hover:border-neutral-200 transition-all duration-300"
                        >
                            Get Started
                            <ChevronRight className="w-5 h-5 text-neutral-600" strokeWidth={2.5} />
                        </Link>
                    </div>
                </nav>
            </header>
        </div>
    );
}
