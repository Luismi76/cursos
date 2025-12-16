"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { MensajeCursoDTO } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Check, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { getMensajesCurso, enviarMensajeCurso, marcarMensajesCursoComoLeidos } from "@/services/chatCursoService";
import { createChatCursoSocket, sendTypingIndicator } from "@/hooks/useChatCursoSocket";
import EmojiPickerButton from "./EmojiPickerButton";
import TypingIndicator from "./TypingIndicator";

interface UnifiedChatProps {
    cursoId: string;
    usuarioId: string;
    usuarioNombre?: string;
}

interface ExtendedMessage extends MensajeCursoDTO {
    read?: boolean;
}

export default function UnifiedChat({
    cursoId,
    usuarioId,
    usuarioNombre,
}: UnifiedChatProps) {
    const [mensajes, setMensajes] = useState<ExtendedMessage[]>([]);
    const [texto, setTexto] = useState("");
    const [conectado, setConectado] = useState(false);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const socketRef = useRef<any>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();

    // Cargar mensajes y conectar WebSocket
    useEffect(() => {
        getMensajesCurso(cursoId).then((msgs) => {
            setMensajes(msgs);
            marcarMensajesCursoComoLeidos(cursoId);
        });

        socketRef.current = createChatCursoSocket(
            cursoId,
            (msg: MensajeCursoDTO) => {
                setMensajes((prev) => [...prev, msg]);
            },
            () => {
                setConectado(true);
            },
            (data) => {
                // Typing indicator
                if (data.userId !== usuarioId) {
                    if (data.isTyping) {
                        setTypingUsers((prev) =>
                            prev.includes(data.userName) ? prev : [...prev, data.userName]
                        );
                    } else {
                        setTypingUsers((prev) => prev.filter((u) => u !== data.userName));
                    }
                }
            },
            (data) => {
                // Read receipts
                setMensajes((prev) =>
                    prev.map((msg) =>
                        data.messageIds.includes(msg.id) ? { ...msg, read: true } : msg
                    )
                );
            }
        );

        return () => {
            socketRef.current?.deactivate();
        };
    }, [cursoId, usuarioId]);

    // Auto-scroll
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [mensajes, typingUsers]);

    // Handle typing indicator
    const handleInputChange = useCallback(
        (value: string) => {
            setTexto(value);

            if (!socketRef.current || !usuarioNombre) return;

            // Send typing start
            sendTypingIndicator(
                socketRef.current,
                cursoId,
                usuarioId,
                usuarioNombre,
                true
            );

            // Clear previous timeout
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }

            // Send typing stop after 2 seconds of inactivity
            typingTimeoutRef.current = setTimeout(() => {
                sendTypingIndicator(
                    socketRef.current,
                    cursoId,
                    usuarioId,
                    usuarioNombre,
                    false
                );
            }, 2000);
        },
        [cursoId, usuarioId, usuarioNombre]
    );

    const enviar = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!texto.trim()) return;

        // Send typing stop
        if (socketRef.current && usuarioNombre) {
            sendTypingIndicator(
                socketRef.current,
                cursoId,
                usuarioId,
                usuarioNombre,
                false
            );
        }

        try {
            await enviarMensajeCurso(cursoId, texto);
            setTexto("");
        } catch (error) {
            console.error("Error enviando mensaje:", error);
        }
    };

    const handleEmojiSelect = (emoji: string) => {
        setTexto((prev) => prev + emoji);
    };

    return (
        <div className="flex flex-col h-full max-w-4xl mx-auto bg-white dark:bg-zinc-900 rounded-lg shadow-lg">
            {/* Header */}
            <div className="px-6 py-4 border-b dark:border-zinc-700 bg-gradient-to-r from-primary/5 to-primary/10">
                <h2 className="text-xl font-semibold">Chat del Curso</h2>
                <p className="text-sm text-muted-foreground">
                    {conectado ? (
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Conectado
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-gray-400 rounded-full" />
                            Conectando...
                        </span>
                    )}
                </p>
            </div>

            {/* Área de mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {mensajes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="text-6xl mb-4">💬</div>
                        <p className="text-muted-foreground text-sm">
                            No hay mensajes aún.
                        </p>
                        <p className="text-muted-foreground text-xs mt-2">
                            ¡Sé el primero en enviar un mensaje!
                        </p>
                    </div>
                ) : (
                    mensajes.map((m, index) => {
                        const isOwnMessage = m.autor.id === usuarioId;
                        const showAvatar =
                            index === 0 ||
                            mensajes[index - 1].autor.id !== m.autor.id;

                        return (
                            <div
                                key={m.id || `${m.autor.id}-${m.fechaEnvio}`}
                                className={`flex items-end gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300 ${isOwnMessage ? "justify-end" : "justify-start"
                                    }`}
                            >
                                {!isOwnMessage && (
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mb-1">
                                        {showAvatar && (
                                            <span className="text-sm font-medium">
                                                {m.autor.nombre?.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                )}

                                <div
                                    className={`flex flex-col max-w-[70%] ${isOwnMessage ? "items-end" : "items-start"
                                        }`}
                                >
                                    {showAvatar && !isOwnMessage && (
                                        <span className="text-xs text-muted-foreground mb-1 px-2">
                                            {m.autor.nombre}
                                        </span>
                                    )}
                                    <div
                                        className={`group relative px-4 py-2 rounded-2xl shadow-sm transition-all hover:shadow-md ${isOwnMessage
                                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                                : "bg-muted rounded-bl-sm"
                                            }`}
                                    >
                                        <p className="text-sm whitespace-pre-wrap break-words">
                                            {m.contenido}
                                        </p>
                                        <div
                                            className={`flex items-center gap-1 mt-1 text-[10px] ${isOwnMessage
                                                    ? "text-primary-foreground/70"
                                                    : "text-muted-foreground"
                                                }`}
                                        >
                                            <span>
                                                {formatDistanceToNow(new Date(m.fechaEnvio), {
                                                    addSuffix: true,
                                                    locale: es,
                                                })}
                                            </span>
                                            {isOwnMessage && (
                                                <span className="ml-1">
                                                    {m.read ? (
                                                        <CheckCheck className="w-3 h-3" />
                                                    ) : (
                                                        <Check className="w-3 h-3" />
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {isOwnMessage && (
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0 mb-1">
                                        {showAvatar && (
                                            <span className="text-sm font-medium text-primary-foreground">
                                                {m.autor.nombre?.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}

                <TypingIndicator typingUsers={typingUsers} />
                <div ref={scrollRef} />
            </div>

            {/* Input */}
            <form
                onSubmit={enviar}
                className="p-4 border-t dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50"
            >
                <div className="flex gap-2 items-end">
                    <EmojiPickerButton onEmojiSelect={handleEmojiSelect} />
                    <Input
                        value={texto}
                        onChange={(e) => handleInputChange(e.target.value)}
                        placeholder={
                            conectado ? "Escribe un mensaje..." : "Conectando..."
                        }
                        disabled={!conectado}
                        className="flex-1"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                enviar();
                            }
                        }}
                    />
                    <Button
                        type="submit"
                        disabled={!conectado || !texto.trim()}
                        size="icon"
                        className="transition-all hover:scale-105"
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </form>
        </div>
    );
}
