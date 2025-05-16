import React from "react";
import { cn } from "@/lib/utils";

export const Button = React.forwardRef(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
                    {
                        default: "bg-blue-600 text-white hover:bg-blue-700",
                        outline: "border border-gray-300 text-gray-700 hover:bg-gray-100",
                        destructive: "bg-red-600 text-white hover:bg-red-700",
                        ghost: "hover:bg-gray-100 text-gray-600",
                    }[variant],
                    {
                        default: "h-10 px-4 py-2 text-sm",
                        sm: "h-9 px-3",
                        lg: "h-11 px-6",
                        icon: "h-10 w-10 p-0",
                    }[size],
                    className
                )}
                {...props}
            />
        );
    }
);


export const Input = React.forwardRef(({ className, ...props }, ref) => {
    return (
        <input
            ref={ref}
            className={cn(
                "w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                className
            )}
            {...props}
        />
    );
});

export const Card = ({ className, children, ...props }) => {
    return (
        <div
            className={cn("bg-white p-4 rounded-2xl shadow-md", className)}
            {...props}
        >
            {children}
        </div>
    );
};