"use client";

import { useState, useRef, useEffect } from "react";
import { Smile, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EmojiPickerButtonProps {
    onEmojiSelect: (emoji: string) => void;
}

const EMOJI_CATEGORIES = {
    "😊": {
        name: "Caras",
        emojis: [
            "😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂",
            "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛",
            "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🥳", "😏", "😒",
        ],
    },
    "👋": {
        name: "Gestos",
        emojis: [
            "👍", "👎", "👌", "✌️", "🤞", "🤟", "🤘", "🤙", "👏", "🙌",
            "👋", "🤚", "✋", "🖐️", "🖖", "👊", "✊", "🤛", "🤜", "💪",
        ],
    },
    "❤️": {
        name: "Corazones",
        emojis: [
            "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔",
            "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟",
        ],
    },
    "🎉": {
        name: "Objetos",
        emojis: [
            "🔥", "✨", "💫", "⭐", "🌟", "💥", "💯", "✅", "❌", "⚠️",
            "🎉", "🎊", "🎈", "🎁", "🏆", "🥇", "🥈", "🥉", "🎯", "🎮",
        ],
    },
    "🍕": {
        name: "Comida",
        emojis: [
            "🍕", "🍔", "🍟", "🌭", "🍿", "🧀", "🥓", "🥚", "🍳", "🥞",
            "🍞", "🥐", "🥖", "🥨", "🥯", "🍰", "🎂", "🧁", "🍪", "🍩",
        ],
    },
};

export default function EmojiPickerButton({ onEmojiSelect }: EmojiPickerButtonProps) {
    const [showPicker, setShowPicker] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string>(Object.keys(EMOJI_CATEGORIES)[0]);
    const [searchTerm, setSearchTerm] = useState("");
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setShowPicker(false);
                setSearchTerm("");
            }
        };

        if (showPicker) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showPicker]);

    const handleEmojiClick = (emoji: string) => {
        onEmojiSelect(emoji);
        setShowPicker(false);
        setSearchTerm("");
    };

    const getFilteredEmojis = () => {
        if (!searchTerm) {
            return EMOJI_CATEGORIES[selectedCategory as keyof typeof EMOJI_CATEGORIES]?.emojis || [];
        }

        // Search across all categories
        return Object.values(EMOJI_CATEGORIES)
            .flatMap((cat) => cat.emojis)
            .filter((emoji) => emoji.includes(searchTerm));
    };

    return (
        <div className="relative" ref={pickerRef}>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShowPicker(!showPicker)}
                title="Agregar emoji"
                className="hover:bg-primary/10 shrink-0"
            >
                <Smile className="w-5 h-5" />
            </Button>

            {showPicker && (
                <>
                    {/* Mobile overlay */}
                    <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setShowPicker(false)} />

                    {/* Picker */}
                    <div className="fixed md:absolute bottom-0 md:bottom-full left-0 md:left-auto right-0 md:right-0 md:mb-2 z-50 bg-white dark:bg-zinc-900 border-t md:border border-zinc-200 dark:border-zinc-700 md:rounded-xl shadow-2xl md:w-80 max-h-[70vh] md:max-h-96 flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-700 shrink-0">
                            <h3 className="font-semibold text-sm">Emojis</h3>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowPicker(false)}
                                className="h-8 w-8 md:hidden"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Search */}
                        <div className="p-3 border-b border-zinc-200 dark:border-zinc-700 shrink-0">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Buscar emoji..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 h-9 text-sm"
                                    autoFocus={false}
                                />
                            </div>
                        </div>

                        {/* Categories */}
                        {!searchTerm && (
                            <div className="flex gap-2 p-3 border-b border-zinc-200 dark:border-zinc-700 overflow-x-auto shrink-0 scrollbar-thin">
                                {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
                                    <button
                                        key={key}
                                        type="button"
                                        onClick={() => setSelectedCategory(key)}
                                        className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all shrink-0 ${selectedCategory === key
                                                ? "bg-primary text-primary-foreground scale-105"
                                                : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                            }`}
                                        title={category.name}
                                    >
                                        <span className="text-xl">{key}</span>
                                        <span className="text-[10px] font-medium hidden sm:block">{category.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Emoji Grid */}
                        <div className="flex-1 overflow-y-auto p-3">
                            <div className="grid grid-cols-6 sm:grid-cols-8 gap-1">
                                {getFilteredEmojis().map((emoji, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => handleEmojiClick(emoji)}
                                        className="aspect-square flex items-center justify-center text-2xl sm:text-3xl hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-all hover:scale-110 active:scale-95 touch-manipulation"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                            {getFilteredEmojis().length === 0 && (
                                <div className="text-center py-12 text-muted-foreground text-sm">
                                    <div className="text-4xl mb-2">🔍</div>
                                    No se encontraron emojis
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-3 py-2 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 text-center shrink-0">
                            <p className="text-xs text-muted-foreground">
                                {getFilteredEmojis().length} emoji{getFilteredEmojis().length !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
