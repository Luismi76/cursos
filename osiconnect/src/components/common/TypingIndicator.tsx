"use client";

interface TypingIndicatorProps {
    typingUsers: string[];
}

export default function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
    if (typingUsers.length === 0) return null;

    const text =
        typingUsers.length === 1
            ? `${typingUsers[0]} está escribiendo...`
            : typingUsers.length === 2
                ? `${typingUsers[0]} y ${typingUsers[1]} están escribiendo...`
                : `${typingUsers.length} personas están escribiendo...`;

    return (
        <div className="px-4 py-2 text-sm text-muted-foreground italic flex items-center gap-2">
            <span>{text}</span>
            <div className="flex gap-1">
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
        </div>
    );
}
