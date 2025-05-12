// components/UserMenu.tsx
'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    LogOut,
    Settings,
    User,
    ChevronDown,
    Moon,
    Sun,
    Upload,
    Pencil,
    X,
    Loader2,
    Eye,
    EyeOff,
    Lock,
    Check,
    Mail,
    Clock,
    Bell,
    Shield,
    FileText,
    Users,
    KeyRound,
    CreditCard,
    Menu,
    Podcast,
    Plus,
	ShieldBan,
	ShieldCheck,
	ShieldIcon,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { Dialog, DialogContent, DialogTitle, DialogHeader } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateImage, compressImage } from '@/lib/imageUtils';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import UserSettingsDialog from './UserSettingsDialog';
import ThemeToggle from './ui/themeToggle';
import SubscriptionPlansModal from './subscriptionPlans';

interface UserMenuProps {
    userName?: string;
    userImage?: string;
}

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;

export default function UserMenu({ userName, userImage }: UserMenuProps) {
    const { user, logout, updateProfile } = useAuth();
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [activeTab, setActiveTab] = useState<'profile' | 'settings'>('profile');
    const [activeSidebarItem, setActiveSidebarItem] = useState<string>('profile');
    const [displayName, setDisplayName] = useState<string>('');
    const [originalName, setOriginalName] = useState<string>('');
    const [avatarPreview, setAvatarPreview] = useState<string>('');
    const [originalAvatar, setOriginalAvatar] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [imageError, setImageError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { theme, setTheme } = useTheme();

    const [isPlansOpen, setIsPlansOpen] = useState(false);

    // Password change states
    const [currentPassword, setCurrentPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false);
    const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [passwordErrors, setPasswordErrors] = useState<string[]>([]);
    const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
    const [passwordChangeStep, setPasswordChangeStep] = useState<'form' | 'verification'>('form');
    const [verificationCode, setVerificationCode] = useState<string>('');
    const [codeRequested, setCodeRequested] = useState<boolean>(false);

    // Initialize user data
    useEffect(() => {
        const name = userName || user?.name || user?.email?.split('@')[0] || 'User';
        setDisplayName(name);
        setOriginalName(name);

        const image =
            userImage ||
            user?.image ||
            'https://img.freepik.com/free-photo/blue-purple-fluid-background_53876-108681.jpg?semt=ais_hybrid&w=740';
        setAvatarPreview(image);
        setOriginalAvatar(image);
    }, [user, userName, userImage]);

    // Logout handler
    const handleLogout = async () => {
        await logout();
        setIsOpen(false);
		setTheme('light')
    };

    // Theme toggle
    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    // Open modal with specific tab
    const openModal = (tab: 'profile' | 'general' | 'payments') => {
        setActiveTab(tab);
        setActiveSidebarItem(tab);
        setIsModalOpen(true);
        setIsOpen(false);

        // Reset to initial values when opening modal
        setDisplayName(originalName);
        setAvatarPreview(originalAvatar);
        setImageError('');

        // Reset password fields
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordErrors([]);
        setPasswordChangeStep('form');
        setVerificationCode('');
        setCodeRequested(false);
    };

    // Avatar change handler
    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Image validation
        const validation = validateImage(file);
        if (!validation.valid) {
            setImageError(validation.error || 'File upload error');
            return;
        }

        setImageError('');

        try {
            // Compress image before sending
            const compressedImage = await compressImage(file);
            setAvatarPreview(compressedImage);
        } catch (error) {
            console.error('Error processing image:', error);
            setImageError('Failed to process image');
        }
    };

    // Save profile changes
    const saveProfileChanges = async () => {
        // Check if changes were made
        if (displayName === originalName && avatarPreview === originalAvatar) {
            setIsModalOpen(false);
            return;
        }

        setIsSubmitting(true);

        try {
            // Prepare data for update
            const updateData: { name?: string; image?: string } = {};

            if (displayName !== originalName) {
                updateData.name = displayName;
            }

            if (avatarPreview !== originalAvatar) {
                updateData.image = avatarPreview;
            }

            // Send request to update profile
            const success = await updateProfile(updateData);

            if (success) {
                // Update original values after successful save
                setOriginalName(displayName);
                setOriginalAvatar(avatarPreview);

                toast.success('Profile updated successfully');
                setIsModalOpen(false);
            } else {
                toast.error('Failed to update profile');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error('An error occurred while saving');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Cancel profile changes
    const cancelProfileChanges = () => {
        setDisplayName(originalName);
        setAvatarPreview(originalAvatar);
        setImageError('');
        setIsModalOpen(false);
    };

    // Remove current avatar
    const removeAvatar = () => {
        setAvatarPreview('');
    };

    // Password validation
    const validatePassword = (password: string): string[] => {
        const errors: string[] = [];

        if (password.length < 8) {
            errors.push('Password must contain at least 8 characters');
        }

        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }

        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }

        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }

        if (!/[^\da-zA-Z]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }

        return errors;
    };

    // Request verification code for password change
    const requestVerificationCode = async () => {
        if (!user?.email) {
            toast.error('Email not found');
            return;
        }

        // Validate new password
        const errors = validatePassword(newPassword);

        if (errors.length > 0) {
            setPasswordErrors(errors);
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordErrors(['Passwords do not match']);
            return;
        }

        setIsChangingPassword(true);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: user.email }),
            });

            const data = await response.json();

            if (response.ok) {
                setCodeRequested(true);
                setPasswordChangeStep('verification');
                toast.success('Verification code sent to your email');
            } else {
                toast.error(data.error || 'Failed to send verification code');
            }
        } catch (error) {
            console.error('Error requesting verification code:', error);
            toast.error('An error occurred while requesting verification code');
        } finally {
            setIsChangingPassword(false);
        }
    };

    // Confirm password change
    const confirmPasswordChange = async () => {
        if (!user?.email || !verificationCode || !newPassword) {
            toast.error('Please fill in all fields');
            return;
        }

        setIsChangingPassword(true);

        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: user.email,
                    code: verificationCode,
                    newPassword: newPassword,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Password changed successfully');

                // Reset form
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setVerificationCode('');
                setPasswordErrors([]);
                setPasswordChangeStep('form');
                setCodeRequested(false);

                // Close modal
                setIsModalOpen(false);
            } else {
                toast.error(data.error || 'Failed to change password');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            toast.error('An error occurred while changing password');
        } finally {
            setIsChangingPassword(false);
        }
    };

    // Handle password change
    const handlePasswordChange = () => {
        // Clear previous errors
        setPasswordErrors([]);

        // Validate input
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordErrors(['Please fill in all fields']);
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordErrors(['Passwords do not match']);
            return;
        }

        const errors = validatePassword(newPassword);

        if (errors.length > 0) {
            setPasswordErrors(errors);
            return;
        }

        // Request verification code
        requestVerificationCode();
    };

    // Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
            y: -5,
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
            y: -5,
            scale: 0.95,
            transition: {
                duration: 0.15,
                ease: 'easeInOut',
            },
        },
    };

    // Define displayed avatar
    const displayAvatar = avatarPreview || 'https://i.pravatar.cc/300';

    // Password strength indicator
    const getPasswordStrength = (password: string): { strength: 'weak' | 'medium' | 'strong'; color: string } => {
        if (!password) return { strength: 'weak', color: 'bg-neutral-200 dark:bg-neutral-700' };

        const errors = validatePassword(password);

        if (errors.length === 0) {
            return { strength: 'strong', color: 'bg-green-500' };
        } else if (errors.length <= 2) {
            return { strength: 'medium', color: 'bg-yellow-500' };
        } else {
            return { strength: 'weak', color: 'bg-red-500' };
        }
    };

    const passwordStrength = getPasswordStrength(newPassword);

    // Sidebar navigation items
    const sidebarItems = [
        { id: 'profile', label: 'Профиль', icon: <User className="w-4 h-4" /> },
        { id: 'general', label: 'Общие', icon: <Settings className="w-4 h-4" /> },
        { id: 'security', label: 'Конфиденциальность', icon: <ShieldIcon className="w-4 h-4" /> },
        // { id: 'appearance', label: 'Appearance', icon: <Sun className="w-4 h-4" /> },
        // { id: 'timezone', label: 'Time Zones', icon: <Clock className="w-4 h-4" /> },
        { id: 'notifications', label: 'Уведомления', icon: <Bell className="w-4 h-4" /> },
        // { id: 'security', label: 'Security & Access', icon: <Shield className="w-4 h-4" /> },
        // { id: 'team', label: 'User Management', icon: <Users className="w-4 h-4" /> },
        // { id: 'authentication', label: 'Authentication', icon: <KeyRound className="w-4 h-4" /> },
        { id: 'payments', label: 'Оплата', icon: <CreditCard className="w-4 h-4" /> },
        { id: 'data', label: 'Импорт / Экспорт', icon: <FileText className="w-4 h-4" /> },
    ];

    return (
        <>
            <div className="relative select-none" ref={dropdownRef}>
                <div
                    className="pl-3 group flex gap-2 items-center border border-neutral-200 bg-neutral-50 p-1 rounded-full cursor-pointer hover:bg-neutral-100 dark:bg-neutral-800 dark:border-neutral-700 dark:hover:bg-neutral-700 duration-200 transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="flex items-center">
                        <Menu
                            className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-500 ease-in-out`}
                        />
                    </div>
                    <div className="h-8 w-8 rounded-full overflow-hidden flex-shrink-0">
                        <img
                            className="w-full h-full rounded-full object-cover"
                            src={displayAvatar}
                            alt={displayName}
                            onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                    'https://img.freepik.com/free-photo/blue-purple-fluid-background_53876-108681.jpg?semt=ais_hybrid&w=740';
                            }}
                        />
                    </div>
                </div>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            className="absolute px-1 right-0 mt-2 w-[300px] rounded-2xl bg-white dark:bg-neutral-800 shadow-md ring-black ring-opacity-5 border border-neutral-100 dark:border-neutral-700 overflow-hidden z-50"
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={dropdownVariants}
                        >
                            <div className="py-3 px-4 dark:border-neutral-700">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 mr-3">
                                        <div className="h-8 w-8 rounded-full overflow-hidden ring-2 ring-gray-100 dark:ring-gray-700">
                                            <img
                                                src={displayAvatar}
                                                alt={displayName}
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src =
                                                        'https://img.freepik.com/free-photo/blue-purple-fluid-background_53876-108681.jpg?semt=ais_hybrid&w=740';
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                            {displayName}
                                        </span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[180px]">
                                            {user?.email}
                                        </span>
                                    </div>

                                    <span className="ml-auto px-3.5 py-1 text-sm font-semibold bg-neutral-200/50 text-neutral-600 dark:bg-neutral-700/70 dark:text-gray-200 rounded-2xl">
                                        Free
                                    </span>
                                </div>
                            </div>

                            <span className="block bg-neutral-100 dark:bg-neutral-700 my-1 w-[90%] mx-auto h-[1px]"></span>

                            <div className="px-4 py-1 flex items-center justify-between">
                                <p className="flex gap-1 items-center text-xl">
                                    <img
                                        className="w-7 h-7 rounded-full object-cover mr-1 border-[2px] border-neutral-200 dark:border-neutral-600"
                                        src="https://images.prismic.io/worldcoin-company-website/5ef465df-1bdd-4f4b-b8ce-b2c66b40de05_story-behind-new-worldcoin-logo-2.png?auto=compress,format"
                                        alt=""
                                    />
                                    10<span className="text-neutral-400 text-[12px] mt-1">/10 (free)</span>
                                </p>

                                <button onClick={() => openModal('payments')} className="p-1.5 bg-neutral-100 hover:bg-neutral-200 rounded-xl dark:bg-neutral-700/80 dark:hover:bg-neutral-700/40 transition-all duration-300">
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>

                            <span className="block bg-neutral-100 dark:bg-neutral-700 my-1 w-[90%] mx-auto h-[1px]"></span>

                            <div className="py-1">
                                <button
                                    className="rounded-xl flex items-center w-full px-4 py-2.5 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-150"
                                    onClick={() => openModal('profile')}
                                >
                                    <User className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                                    Профиль
                                </button>

                                <button
                                    className="rounded-xl flex items-center w-full px-4 py-2.5 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-150"
                                    onClick={() => openModal('general')}
                                >
                                    <Settings className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                                    Настройки
                                </button>

                                <button
                                    className="rounded-xl flex items-center w-full px-4 py-2.5 text-sm text-left text-gray-700 dark:text-gray-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-150"
                                    onClick={() => {
                                        setIsPlansOpen(true);
                                        setIsOpen(false);
                                    }}
                                >
                                    <Podcast className="h-4 w-4 mr-3 text-gray-500 dark:text-gray-400" />
                                    Подписки
                                </button>

                                <ThemeToggle themeValue={theme} onChange={toggleTheme} />

                                <span className="block bg-neutral-100 dark:bg-neutral-700 my-1 w-[90%] mx-auto h-[1px]"></span>

                                <button
                                    className="rounded-xl flex items-center justify-center w-full px-4 py-2.5 text-sm text-left text-red-600 dark:text-red-400 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-150"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-4 w-4 mr-3 text-red-500 dark:text-red-400" />
                                    Выйти из профиля
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[900px] p-0 gap-0 z-[99999]">
                    <div className="flex h-[600px] overflow-hidden rounded-3xl p-2">
                        <div className="w-[240px] bg-neutral-50 dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 flex flex-col">
                            <div className="px-4 mb-6">
                                <div className="flex items-center mt-3">
                                    <div className="h-10 w-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-gray-100 dark:ring-gray-700">
                                        <img
                                            src={displayAvatar}
                                            alt={displayName}
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src =
                                                    'https://img.freepik.com/free-photo/blue-purple-fluid-background_53876-108681.jpg?semt=ais_hybrid&w=740';
                                            }}
                                        />
                                    </div>
                                    <div className="ml-3">
                                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                            {displayName}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">
                                            {user?.email || 'User'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar navigation */}
                            <div className="flex-1 overflow-y-auto">
                                <nav className="px-2 space-y-1">
                                    {sidebarItems.map((item) => (
                                        <button
                                            key={item.id}
                                            className={`flex items-center w-full px-3 py-2 text-sm rounded-xl ${
                                                activeSidebarItem === item.id
                                                    ? 'bg-neutral-800 text-white'
                                                    : 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                                            }`}
                                            onClick={() => setActiveSidebarItem(item.id)}
                                        >
                                            <span className="mr-3">{item.icon}</span>
                                            {item.label}
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            <div className="p-2 mt-2">
                                <button
                                    className="flex items-center justify-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-800"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-4 w-4 mr-3" />
                                    Выйти из профиля
                                </button>
                            </div>
                        </div>

                        {/* Right content area */}
                        <div className="flex-1 p-6 overflow-y-auto">
                            {activeSidebarItem === 'profile1' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Profile</h2>

                                    <div className="flex flex-col items-center gap-4 bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
                                        <div className="relative group">
                                            <div className="h-24 w-24 rounded-full overflow-hidden ring-4 ring-gray-100 dark:ring-gray-700">
                                                {avatarPreview ? (
                                                    <img
                                                        src={avatarPreview}
                                                        alt="Avatar"
                                                        className="h-full w-full object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src =
                                                                'https://img.freepik.com/free-photo/blue-purple-fluid-background_53876-108681.jpg?semt=ais_hybrid&w=740';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="h-full w-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                                                        <User className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Avatar action buttons */}
                                            <div className="absolute -bottom-2 -right-2 flex gap-1">
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="p-1.5 rounded-full bg-primary text-white shadow-sm hover:bg-primary/90"
                                                    title="Upload photo"
                                                >
                                                    <Upload className="h-4 w-4" />
                                                </button>

                                                {avatarPreview && (
                                                    <button
                                                        onClick={removeAvatar}
                                                        className="p-1.5 rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600"
                                                        title="Remove photo"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>

                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleAvatarChange}
                                            />
                                        </div>

                                        {imageError && (
                                            <div className="text-sm text-red-500 dark:text-red-400 text-center">
                                                {imageError}
                                            </div>
                                        )}

                                        <div className="w-full max-w-md mt-4">
                                            <Label htmlFor="name">Name</Label>
                                            <div className="relative mt-1">
                                                <Input
                                                    id="name"
                                                    value={displayName}
                                                    onChange={(e) => setDisplayName(e.target.value)}
                                                    className="pl-8"
                                                    placeholder="Enter your name"
                                                />
                                                <Pencil className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                            </div>
                                        </div>

                                        <div className="w-full max-w-md">
                                            <Label htmlFor="email">Email</Label>
                                            <div className="relative mt-1">
                                                <Input
                                                    id="email"
                                                    value={user?.email || ''}
                                                    className="pl-8 bg-neutral-50 dark:bg-neutral-700"
                                                    disabled
                                                />
                                                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Contact administrator to change your email.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Save and cancel buttons */}
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            onClick={cancelProfileChanges}
                                            disabled={isSubmitting}
                                        >
                                            Cancel
                                        </Button>

                                        <Button
                                            onClick={saveProfileChanges}
                                            disabled={isSubmitting || (!displayName && !avatarPreview)}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                'Save Changes'
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {activeSidebarItem === 'security1' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                                        Security & Access
                                    </h2>

                                    <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
                                        <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-4">
                                            Change Password
                                        </h3>

                                        {passwordChangeStep === 'form' ? (
                                            <div className="space-y-4 max-w-md">
                                                {/* Current password */}
                                                <div>
                                                    <Label htmlFor="current-password">Current Password</Label>
                                                    <div className="relative mt-1">
                                                        <Input
                                                            id="current-password"
                                                            type={showCurrentPassword ? 'text' : 'password'}
                                                            value={currentPassword}
                                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                                            className="pl-8 pr-10"
                                                            placeholder="Enter current password"
                                                        />
                                                        <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                            className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                        >
                                                            {showCurrentPassword ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* New password */}
                                                <div>
                                                    <Label htmlFor="new-password">New Password</Label>
                                                    <div className="relative mt-1">
                                                        <Input
                                                            id="new-password"
                                                            type={showNewPassword ? 'text' : 'password'}
                                                            value={newPassword}
                                                            onChange={(e) => setNewPassword(e.target.value)}
                                                            className="pl-8 pr-10"
                                                            placeholder="Enter new password"
                                                        />
                                                        <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                                            className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                        >
                                                            {showNewPassword ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    </div>

                                                    {/* Password strength indicator */}
                                                    {newPassword && (
                                                        <div className="mt-2">
                                                            <div className="flex items-center justify-between text-xs mb-1">
                                                                <span>Password strength:</span>
                                                                <span
                                                                    className={`font-medium ${
                                                                        passwordStrength.strength === 'weak'
                                                                            ? 'text-red-500'
                                                                            : passwordStrength.strength === 'medium'
                                                                            ? 'text-yellow-500'
                                                                            : 'text-green-500'
                                                                    }`}
                                                                >
                                                                    {passwordStrength.strength === 'weak'
                                                                        ? 'Weak'
                                                                        : passwordStrength.strength === 'medium'
                                                                        ? 'Medium'
                                                                        : 'Strong'}
                                                                </span>
                                                            </div>
                                                            <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full ${passwordStrength.color} rounded-full`}
                                                                    style={{
                                                                        width:
                                                                            passwordStrength.strength === 'weak'
                                                                                ? '33%'
                                                                                : passwordStrength.strength === 'medium'
                                                                                ? '66%'
                                                                                : '100%',
                                                                    }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Confirm password */}
                                                <div>
                                                    <Label htmlFor="confirm-password">Confirm Password</Label>
                                                    <div className="relative mt-1">
                                                        <Input
                                                            id="confirm-password"
                                                            type={showConfirmPassword ? 'text' : 'password'}
                                                            value={confirmPassword}
                                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                                            className="pl-8 pr-10"
                                                            placeholder="Repeat new password"
                                                        />
                                                        <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                            className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                        >
                                                            {showConfirmPassword ? (
                                                                <EyeOff className="h-4 w-4" />
                                                            ) : (
                                                                <Eye className="h-4 w-4" />
                                                            )}
                                                        </button>
                                                    </div>

                                                    {/* Password match validation */}
                                                    {newPassword && confirmPassword && (
                                                        <div className="flex items-center mt-1 text-xs">
                                                            {newPassword === confirmPassword ? (
                                                                <span className="text-green-500 flex items-center">
                                                                    <Check className="h-3 w-3 mr-1" /> Passwords match
                                                                </span>
                                                            ) : (
                                                                <span className="text-red-500">
                                                                    Passwords don't match
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Error display */}
                                                {passwordErrors.length > 0 && (
                                                    <Alert variant="destructive" className="mt-3">
                                                        <AlertDescription>
                                                            <ul className="list-disc pl-5 text-sm">
                                                                {passwordErrors.map((error, index) => (
                                                                    <li key={index}>{error}</li>
                                                                ))}
                                                            </ul>
                                                        </AlertDescription>
                                                    </Alert>
                                                )}

                                                <div className="flex justify-end mt-4">
                                                    <Button
                                                        onClick={handlePasswordChange}
                                                        disabled={
                                                            isChangingPassword ||
                                                            !currentPassword ||
                                                            !newPassword ||
                                                            !confirmPassword
                                                        }
                                                    >
                                                        {isChangingPassword ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Processing...
                                                            </>
                                                        ) : (
                                                            'Change Password'
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            // Verification code form
                                            <div className="space-y-4 max-w-md">
                                                <Alert>
                                                    <AlertDescription>
                                                        A verification code has been sent to your email{' '}
                                                        <strong>{user?.email}</strong>. Enter the code to complete the
                                                        password change process.
                                                    </AlertDescription>
                                                </Alert>

                                                <div>
                                                    <Label htmlFor="verification-code">Verification Code</Label>
                                                    <div className="relative mt-1">
                                                        <Input
                                                            id="verification-code"
                                                            value={verificationCode}
                                                            onChange={(e) => setVerificationCode(e.target.value)}
                                                            className="pl-8"
                                                            placeholder="Enter code from email"
                                                            maxLength={6}
                                                        />
                                                        <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                                                    </div>
                                                </div>

                                                <div className="flex justify-between mt-4">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => setPasswordChangeStep('form')}
                                                        disabled={isChangingPassword}
                                                    >
                                                        Back
                                                    </Button>

                                                    <Button
                                                        onClick={confirmPasswordChange}
                                                        disabled={isChangingPassword || verificationCode.length < 6}
                                                    >
                                                        {isChangingPassword ? (
                                                            <>
                                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                Confirming...
                                                            </>
                                                        ) : (
                                                            'Confirm'
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeSidebarItem === 'appearance1' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                                        Appearance
                                    </h2>

                                    <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                    Interface Theme
                                                </h3>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                    Choose your preferred interface theme
                                                </p>
                                            </div>
                                            <Button variant="outline" size="sm" onClick={toggleTheme}>
                                                {theme === 'dark' ? (
                                                    <>
                                                        <Sun className="h-4 w-4 mr-2" />
                                                        Light Mode
                                                    </>
                                                ) : (
                                                    <>
                                                        <Moon className="h-4 w-4 mr-2" />
                                                        Dark Mode
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeSidebarItem && (
                                <div className="flex flex-col items-center justify-center h-full py-12">
                                    <div className="text-center">
                                        {sidebarItems.find((item) => item.id === activeSidebarItem)?.icon
                                            ? React.cloneElement(
                                                  sidebarItems.find((item) => item.id === activeSidebarItem)?.icon,
                                                  {
                                                      className:
                                                          'h-14 w-14 text-neutral-300 dark:text-neutral-700/90 mx-auto mb-6',
                                                  },
                                              )
                                            : null}
                                        <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">
                                            Раздел - {sidebarItems.find((item) => item.id === activeSidebarItem)?.label ||
                                                'Settings'}
                                        </h3>
                                        <p className="text-xs text-neutral-400 dark:text-neutral-500 max-w-md">
                                            This section is under development and will be available soon.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <SubscriptionPlansModal
                isOpen={isPlansOpen}
                onClose={() => {
                    setIsPlansOpen(false);
                }}
            />
        </>
    );
}
