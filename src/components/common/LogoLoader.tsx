import React from 'react';
import { cn } from "@/lib/utils";

interface LogoLoaderProps {
    size?: 'xs' | 'sm' | 'md';
    className?: string;
    logoClassName?: string;
}

const LogoLoader: React.FC<LogoLoaderProps> = ({
    size = 'sm',
    className,
    logoClassName,
}) => {
    const sizeClasses = {
        xs: "w-5 h-5",
        sm: "w-8 h-8",
        md: "w-12 h-12",
    };

    const logoSizeClasses = {
        xs: "w-3 h-3",
        sm: "w-5 h-5",
        md: "w-8 h-8",
    };

    return (
        <div className={cn("relative flex items-center justify-center animate-pulse-slow", className)}>
            <div className={cn(
                "absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse",
                sizeClasses[size]
            )}></div>
            <div className={cn(
                "relative rounded-full overflow-hidden bg-background flex items-center justify-center border border-border/50",
                sizeClasses[size],
            )}>
                <img
                    src="/logo-160.png"
                    alt=""
                    className={cn("object-contain", logoSizeClasses[size], logoClassName)}
                />
            </div>
        </div>
    );
};

export default LogoLoader;
