const LoadingFallback = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 dark:from-neutral-950 dark:to-neutral-900">
        <div className="flex flex-col items-center gap-6 p-8">
            <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-4 border-neutral-200 dark:border-neutral-800" />
                <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
            </div>

            <p className="text-sm text-neutral-600 dark:text-neutral-400 animate-pulse">Loading...</p>
        </div>
    </div>
);

export default LoadingFallback