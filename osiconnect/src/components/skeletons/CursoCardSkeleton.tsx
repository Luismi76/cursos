import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function CursoCardSkeleton() {
    return (
        <Card className="h-full">
            <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-20 w-full" />
            </CardContent>
            <CardFooter>
                <Skeleton className="h-10 w-28" />
            </CardFooter>
        </Card>
    )
}
