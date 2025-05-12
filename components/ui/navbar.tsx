import { cn, getUserId, SearchGroupId } from '@/lib/utils';
import { Button } from './button';
import { Plus } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import UserMenu from '../UserMenu';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = () => {
    const { user } = useAuth();

    return (
        <div className={cn('fixed top-0 left-0 right-0 rounded-full z-[60] flex justify-between items-center p-4')}>
            <div className="flex items-center justify-start gap-4 w-[200px]">
                <Link href="/new">
                    <Button
                        type="button"
                        variant={'secondary'}
                        className="p-5 px-3 rounded-full bg-gray-300/50 border border-gray-300/10 dark:bg-gray-100/10 hover:bg-gray-300/20 hover:border-gray-300/50 hover:dark:bg-gray-100/20 group duration-100 overflow-hidden transition-all pointer-events-auto"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-all ease-in-out duration-300" />
                        <span className="text-sm opacity-0 w-0 ml-0 group-hover:ml-2 group-hover:opacity-100 group-hover:w-[48px] text-center transition-all ease-in-out duration-100">
                            Thread
                        </span>
                    </Button>
                </Link>
            </div>

            <div className="flex items-center justify-end gap-2 w-[200px]">
                <div>
                    <NotificationDropdown />
                </div>
                <UserMenu userName={user?.name} userImage={user?.image} />
            </div>
        </div>
    );
};

export default Navbar;
