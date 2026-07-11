import { Skeleton } from "@/components/ui/skeleton"

export default function WeatherLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center">
          <Skeleton className="h-6 w-32" />
        </div>
      </div>

      {/* Page Header Skeleton */}
      <section className="w-full py-8 md:py-12">
        <div className="container px-4 md:px-6">
          <div className="space-y-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-6 w-full max-w-2xl" />
          </div>
        </div>
      </section>

      {/* Explorer Skeleton: project explorer + event table/map stand-ins */}
      <section className="w-full py-8">
        <div className="container px-4 md:px-6 space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </section>
    </div>
  )
}
