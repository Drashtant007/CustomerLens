import { AlertCircle, LoaderCircle } from "lucide-react"

export function DataLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <LoaderCircle className="mx-auto size-7 animate-spin text-indigo-400" />

        <p className="mt-4 text-sm text-slate-400">
          Loading CustomerLens analytics…
        </p>

        <p className="mt-1 text-xs text-slate-600">
          Preparing clustering results
        </p>
      </div>
    </div>
  )
}

export function DataError({ message }: { message: string }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md rounded-2xl border border-red-400/10 bg-red-400/[0.04] p-6 text-center">
        <AlertCircle className="mx-auto size-7 text-red-400" />

        <h2 className="mt-4 text-sm font-semibold text-white">
          Unable to load analytics
        </h2>

        <p className="mt-2 text-xs leading-5 text-slate-500">
          {message}
        </p>
      </div>
    </div>
  )
}