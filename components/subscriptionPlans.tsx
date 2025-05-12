import React, { useState, useEffect } from 'react';
import { X, CheckCircle, ChevronRight, Shield, Zap, Clock, Crown, Check, Star } from 'lucide-react';
import { createPortal } from 'react-dom';

const SubscriptionPlansModal = ({ isOpen, onClose }) => {
    const [selectedPlan, setSelectedPlan] = useState('plus');
    const [billingPeriod, setBillingPeriod] = useState('annual'); // 'annual' или 'monthly'

    if (!isOpen) return null;

    // Подробная информация о планах с ценами для разных периодов
    const plansData = [
        {
            id: 'lite',
            name: 'Lite',
            monthlyPrice: 2.99,
            annualPrice: 2.99 * 12 * 0.8,
            description: 'Базовый тариф - минимум',
            features: ['Безлимитные истории поиска', 'Поддержка', 'Быстрые модели', 'Холст'],
            icon: <Shield className="h-5 w-5" />,
            color: 'bg-blue-500',
            recommended: false,
        },
        {
            id: 'plus',
            name: 'Plus',
            monthlyPrice: 9.99,
            annualPrice: 9.99 * 12 * 0.8, 
            description: 'Оптимально для работы',
            features: ['Безлимитные истории поиска', 'Поддержка', 'Быстрые модели', 'Холст', 'Поддержка', 'Быстрые модели', 'Холст',],
            icon: <Zap className="h-5 w-5" />,
            color: 'bg-purple-600',
            recommended: true,
        },
        {
            id: 'pro',
            name: 'Pro',
            monthlyPrice: 29.99,
            annualPrice: 29.99 * 12 * 0.8, // 20% скидка на годовую подписку
            description: 'Самый большой пакет',
            features: ['Безлимитные истории поиска', 'Поддержка', 'Быстрые модели', 'Холст'],
            icon: <Crown className="h-5 w-5" />,
            color: 'bg-amber-500',
            recommended: false,
        },
    ];

    // Подготовка планов для отображения с учетом выбранного периода
    const plans = plansData.map((plan) => {
        // Форматируем цену в зависимости от периода
        let price =
            plan.id === 'basic'
                ? 'Free'
                : billingPeriod === 'monthly'
                ? `${plan.monthlyPrice.toFixed(2)}`
                : `${(plan.monthlyPrice * 0.8).toFixed(2)}`;

        // Форматируем период для отображения
        let period = plan.id === 'basic' ? '' : billingPeriod === 'monthly' ? '/месяц' : '/месяц';

        // Годовая сумма для годовой подписки (только для платных планов)
        let yearlyAmount = plan.id === 'basic' ? null : `${plan.annualPrice.toFixed(2)}`;

        // Сумма экономии при годовой подписке (только для платных планов)
        let savingsAmount =
            plan.id === 'basic'
                ? null
                : billingPeriod === 'annual'
                ? `Save ${(plan.monthlyPrice * 12 - plan.annualPrice).toFixed(2)}`
                : null;

        return {
            ...plan,
            price,
            period,
            yearlyAmount,
            savingsAmount,
        };
    });

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            setSelectedPlan('plus');
            onClose();
        }
    };

    // Обработчик переключения периода
    const toggleBillingPeriod = () => {
        setBillingPeriod(billingPeriod === 'monthly' ? 'annual' : 'monthly');
    };

    return createPortal(
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center"
            onClick={handleBackdropClick}
            style={{ 
                zIndex: 99999, 
                isolation: 'isolate',
                position: 'fixed'
              }}         
        >
            <div className="bg-white dark:bg-neutral-900 w-[95%] max-w-4xl rounded-3xl shadow-md overflow-hidden animate-fadeIn">
                <div className="flex justify-between items-start py-4 px-4 mt-2">
                    <div className="w-full pl-6">
                        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">Подписки</h2>
                    </div>
                    <div className="flex justify-center w-full mt-8 mb-2">
                        <div className="bg-neutral-100 dark:bg-neutral-800 p-1 rounded-2xl flex items-center">
                            <button
                                className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                                    billingPeriod === 'monthly'
                                        ? 'bg-transparent text-gray-700 dark:text-gray-300'
                                        : 'bg-white dark:bg-neutral-700 text-primary shadow-sm'
                                }`}
                                onClick={() => setBillingPeriod('annual')}
                            >
                                На год
                                <span className="ml-2 text-xs py-0.5 px-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-500 border border-green-400/30 rounded-full">
                                    - 20%
                                </span>
                            </button>
                            <button
                                className={`px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                                    billingPeriod === 'annual'
                                        ? 'bg-transparent text-gray-700 dark:text-gray-300'
                                        : 'bg-white dark:bg-neutral-700 text-primary shadow-sm'
                                }`}
                                onClick={() => setBillingPeriod('monthly')}
                            >
                                На месяц
                            </button>
                        </div>
                    </div>
                    <div className="w-full h-10 flex items-start justify-end pr-2">
                        <button
                            onClick={() => {
                                setSelectedPlan('plus');
                                onClose();
                            }}
                            className="p-1 rounded-full bg-neutral-0 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="p-6 py-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {plans.map((plan, index) => (
                            <div
                                key={plan.id}
                                className={`relative rounded-2xl border overflow-hidden transition-all duration-300 cursor-pointer ${
                                    selectedPlan === plan.id
                                        ? 'border-neutral-300 shadow-md dark:border-neutral-800 opacity-100 dark:bg-neutral-800'
                                        : 'border-neutral-200 dark:border-neutral-800 opacity-60 hover:opacity-100 bg-gray-50 dark:bg-neutral-800/50'
                                }
                                    ${index === 0 || index === 2 ? 'scale-95' : 'scale-105'}
                                    ${index === 0 ? 'translate-x-[6px]' : ''}
                                    ${index === 2 ? '-translate-x-[6px]' : ''}
                                `}
                                onClick={() => setSelectedPlan(plan.id)}
                            >
                                {plan.recommended && (
                                    <div className="absolute top-1.5 right-1.5">
                                        <div className="bg-neutral-700 flex items-center gap-2 text-white text-xs font-semibold px-4 py-1.5 rounded-xl">
                                            <Star className='w-3 h-3 fill-white'/> Лучший
                                        </div>
                                    </div>
                                )}

                                <div className="p-6 h-full flex flex-col">
                                    <div className='flex items-center gap-3 '>
                                    <div
                                        className={`h-10 w-10 rounded-full ${plan.color} flex items-center justify-center text-white mb-4`}
                                    >
                                        {plan.icon}
                                    </div>

                                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                                        {plan.name}
                                    </h3>
                                    </div>

                                    <div className="flex flex-col mt-2 mb-4">
                                        <div className="flex items-baseline">
                                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {plan.price}
                                            </span>
                                            <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">
                                                {plan.period}
                                            </span>
                                        </div>

                                        {/* {billingPeriod === 'annual' && plan.yearlyAmount && (
                                            <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                                {plan.yearlyAmount} per year
                                            </div>
                                        )} */}
                                    </div>

                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{plan.description}</p>

                                    <ul className="space-y-2 mb-6">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-start">
                                                <Check className="h-4 w-4 text-green-500/80 mr-2 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                                    {feature}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        className={`w-full mt-auto py-2 px-4 rounded-xl transition-colors flex items-center justify-center ${
                                            selectedPlan === plan.id
                                                ? 'bg-primary hover:bg-primary/90 text-white dark:bg-neutral-700'
                                                : 'bg-neutral-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                                        }`}
                                    >
                                        {selectedPlan === plan.id ? 'Выбранный' : 'Выбрать план'}
                                        {selectedPlan === plan.id && (<ChevronRight className="ml-1 h-4 w-4" />)}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 dark:border-neutral-800 flex justify-end gap-3">
                    <button
                        onClick={() => {
                            setSelectedPlan('plus');
                            onClose();
                        }}
                        className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                        Назад
                    </button>
                    <button className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
                        Получить {plans.find((p) => p.id === selectedPlan)?.name}
                        {billingPeriod === 'annual' ? ' (Год)' : ' (Месяц)'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default SubscriptionPlansModal;
