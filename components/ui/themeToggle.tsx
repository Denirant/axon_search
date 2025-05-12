import { useState } from 'react';
import { Moon } from 'lucide-react';

export default function ThemeToggle({themeValue, onChange}) {
  const [theme, setTheme] = useState(themeValue);
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    onChange()
  };
  
  return (
    <button 
      className="rounded-xl flex items-center w-full px-4 py-2.5 text-sm text-left text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors duration-150"
      onClick={toggleTheme}
    >
      <Moon className="h-4 w-4 mr-3 text-neutral-500 dark:text-neutral-400" />
      <span className="flex-grow">Темная тема</span>
      <div className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors duration-300 ${theme === 'dark' ? 'bg-blue-500/80' : 'bg-neutral-200'}`}>
        <span 
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
            theme === 'dark' ? 'translate-x-5' : 'translate-x-1'
          }`} 
        />
      </div>
    </button>
  );
}