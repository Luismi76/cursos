import {
  Dialog,
  DialogTrigger,
  DialogContent
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import Image from "next/image";


interface AvatarAmpliableProps {
  url?: string; // path relativo o URL completa
  alt?: string;
  size?: number;
  className?: string;
  nombre?: string;
  ampliable?: boolean; // nueva prop para controlar si se puede hacer clic para ampliar
}

const BASE_URL = process.env.NEXT_PUBLIC_URL || "";

export default function AvatarAmpliable({
  url,
  alt = "Avatar",
  size = 80,
  className = "",
  nombre = "",
  ampliable = true,
}: AvatarAmpliableProps) {
  const src = url && !url.startsWith("http") ? `${BASE_URL}${url}` : url;

  const fallback = nombre?.trim()
    ? nombre
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map(p => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
    : null;

  if (!src) {
    return (
      <div
        style={{ width: size, height: size }}
        className={cn(
          "rounded-full bg-gray-200 flex items-center justify-center text-muted-foreground border",
          className
        )}
      >
        {fallback ? (
          <span className="text-sm font-medium">{fallback}</span>
        ) : (
          <User className="w-5 h-5" />
        )}
      </div>
    );
  }

  if (!ampliable) {
    return (
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        className={cn(
          "rounded-full border border-muted object-cover",
          className
        )}
      />
    );

  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Image
          src={src}
          alt={alt}
          width={size}
          height={size}
          className={cn(
            "rounded-full border border-muted object-cover cursor-pointer hover:opacity-80 transition",
            className
          )}
        />

      </DialogTrigger>
      <DialogContent className="max-w-fit p-4">
        <div className="relative w-full h-[80vh]">
          <Image
            src={src}
            alt={alt + " ampliado"}
            fill
            className="object-contain rounded-lg"
          />
        </div>

      </DialogContent>
    </Dialog>
  );
}
