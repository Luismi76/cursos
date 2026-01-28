"use client";

import { use } from "react";
import { CourseMobileHeader } from "@/components/layout/CourseMobileHeader";

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{ cursoId: string }>;
}

export default function CourseLayout({ children, params }: LayoutProps) {
    const { cursoId } = use(params);

    return (
        <div className="flex flex-col min-h-full">
            <CourseMobileHeader cursoId={cursoId} />
            <div className="flex-1">
                {children}
            </div>
        </div>
    );
}
