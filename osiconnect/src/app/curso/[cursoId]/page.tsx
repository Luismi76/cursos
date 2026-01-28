import { redirect } from 'next/navigation';

export default function CursoPage({ params }: { params: { cursoId: string } }) {
    // Redirect to the temario (syllabus) page as the default view
    redirect(`/curso/${params.cursoId}/temario`);
}
