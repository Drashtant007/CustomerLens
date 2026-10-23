import {
  BarChart3,
  BrainCircuit,
  CircleGauge,
  GitCompareArrows,
  Lightbulb,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
} from "lucide-react"
import {
  lazy,
  Suspense,
  useState,
  type ComponentType,
} from "react"

import { ClusterProfileChart } from "@/components/charts/ClusterProfileChart"
import { ClusterScatterChart } from "@/components/charts/ClusterScatterChart"
import { DataError, DataLoading } from "@/components/layout/DataState"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { CustomerLensData } from "@/data/customerlens"
import { useCustomerLensData } from "@/hooks/use-customerlens-data"
import { CLUSTER_COLORS } from "@/lib/cluster-colors"
import { cn } from "@/lib/utils"

/* =========================================================
   LAZY-LOADED PAGES
   ========================================================= */

const OptimalK = lazy(() =>
  import("@/pages/OptimalK").then((module) => ({
    default: module.OptimalK,
  })),
)

const ClusterExplorer = lazy(() =>
  import("@/pages/ClusterExplorer").then((module) => ({
    default: module.ClusterExplorer,
  })),
)

const AlgorithmComparison = lazy(() =>
  import("@/pages/AlgorithmComparison").then((module) => ({
    default: module.AlgorithmComparison,
  })),
)

const BusinessInsights = lazy(() =>
  import("@/pages/BusinessInsights").then((module) => ({
    default: module.BusinessInsights,
  })),
)

const CustomerExplorer = lazy(() =>
  import("@/pages/CustomerExplorer").then((module) => ({
    default: module.CustomerExplorer,
  })),
)

const DataQuality = lazy(() =>
  import("@/pages/DataQuality").then((module) => ({
    default: module.DataQuality,
  })),
)

/* =========================================================
   NAVIGATION
   ========================================================= */

type NavItem = {
  id: string
  label: string
  icon: ComponentType<{ className?: string }>
}

const navigation: NavItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: CircleGauge,
  },
  {
    id: "data-quality",
    label: "Data Quality",
    icon: SlidersHorizontal,
  },
  {
    id: "optimal-k",
    label: "Optimal K",
    icon: BarChart3,
  },
  {
    id: "cluster-explorer",
    label: "Cluster Explorer",
    icon: Users,
  },
  {
    id: "comparison",
    label: "Algorithm Comparison",
    icon: GitCompareArrows,
  },
  {
    id: "insights",
    label: "Business Insights",
    icon: Lightbulb,
  },
  {
    id: "customer-explorer",
    label: "Customer Explorer",
    icon: Search,
  },
]

/* =========================================================
   APP SHELL
   ========================================================= */

export function AppShell() {
  const [activePage, setActivePage] =
    useState("overview")

  const {
    data,
    loading,
    error,
  } = useCustomerLensData()

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100">
      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-white/[0.06] bg-slate-950/80 backdrop-blur-xl lg:flex lg:flex-col">
        {/* Brand */}
        <div className="flex h-20 items-center gap-3 px-6">
          <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-500/15 ring-1 ring-indigo-400/20">
            <BrainCircuit className="size-5 text-indigo-400" />
          </div>

          <div>
            <div className="font-semibold tracking-tight">
              CustomerLens
            </div>

            <div className="text-[11px] text-slate-500">
              Analytics Platform
            </div>
          </div>
        </div>

        <Separator className="bg-white/[0.06]" />

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-5">
          <div className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
            Workspace
          </div>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const active =
                activePage === item.id

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    setActivePage(item.id)
                  }
                  className={cn(
                    "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
                    active
                      ? "bg-indigo-500/10 text-indigo-300 ring-1 ring-indigo-400/15"
                      : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200",
                  )}
                >
                  {active && (
                    <span className="absolute left-0 h-5 w-0.5 rounded-full bg-indigo-400" />
                  )}

                  <Icon
                    className={cn(
                      "size-[18px] transition-colors",
                      active
                        ? "text-indigo-400"
                        : "text-slate-600 group-hover:text-slate-300",
                    )}
                  />

                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Model Status */}
        <div className="border-t border-white/[0.06] p-4">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-cyan-400" />

              <span className="text-xs font-medium text-slate-300">
                Model Status
              </span>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]" />

              <span className="text-[11px] text-slate-500">
                {loading
                  ? "Loading models"
                  : "Models ready"}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* =====================================================
          MAIN APPLICATION
          ===================================================== */}

      <div className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 border-b border-white/[0.06] bg-[#030712]/80 backdrop-blur-xl">
          <div className="flex h-full items-center justify-between px-4 sm:px-6 lg:px-8">
            <div>
              <div className="text-sm font-medium text-slate-200">
                Customer Segmentation
              </div>

              <div className="hidden text-xs text-slate-600 sm:block">
                K-Means · K-Medoids · Analytics
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="size-9 border-white/[0.08] bg-white/[0.025] text-slate-400 hover:bg-white/[0.06] hover:text-white"
                aria-label="Search"
              >
                <Search className="size-4" />
              </Button>

              <div className="hidden h-7 w-px bg-white/[0.06] sm:block" />

              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.65)]" />

                <span className="hidden text-xs text-slate-500 sm:block">
                  {loading
                    ? "Loading data"
                    : "System ready"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="min-h-[calc(100vh-4rem)] px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-[1600px]">
            {loading ? (
              <DataLoading />
            ) : error || !data ? (
              <DataError
                message={
                  error ??
                  "CustomerLens data is unavailable."
                }
              />
            ) : (
              <Suspense
                fallback={<PageLoading />}
              >
                <DashboardRouter
                  activePage={activePage}
                  data={data}
                />
              </Suspense>
            )}

            {/* Footer */}
            {!loading && !error && data && (
              <footer className="mt-10 border-t border-white/5 py-6">
                <div className="flex flex-col gap-2 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                  <p>
                    CustomerLens · Customer
                    Segmentation Analytics
                  </p>

                  <p>
                    K-Means · K-Medoids (PAM) ·
                    Optimal K ={" "}
                    {data.meta.optimal_k}
                  </p>
                </div>
              </footer>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

/* =========================================================
   PAGE LOADING
   ========================================================= */

function PageLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.025] px-5 py-4">
        <div className="size-4 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-400" />

        <span className="text-sm text-slate-400">
          Loading analytics...
        </span>
      </div>
    </div>
  )
}

/* =========================================================
   PAGE ROUTER
   ========================================================= */

function DashboardRouter({
  activePage,
  data,
}: {
  activePage: string
  data: CustomerLensData
}) {
  switch (activePage) {
    case "overview":
      return <OverviewPage data={data} />

    case "data-quality":
      return <DataQuality data={data} />

    case "optimal-k":
      return <OptimalK data={data} />

    case "cluster-explorer":
      return (
        <ClusterExplorer data={data} />
      )

    case "comparison":
      return (
        <AlgorithmComparison data={data} />
      )

    case "insights":
      return (
        <BusinessInsights data={data} />
      )

    case "customer-explorer":
      return (
        <CustomerExplorer data={data} />
      )

    default:
      return <OverviewPage data={data} />
  }
}

/* =========================================================
   OVERVIEW
   ========================================================= */

function OverviewPage({
  data,
}: {
  data: CustomerLensData
}) {
  const kMeans =
    data.algorithm_comparison.find(
      (item) =>
        item.Algorithm === "K-Means",
    )

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-indigo-400/15 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-medium text-indigo-300">
            CustomerLens
          </span>

          <span className="text-xs text-slate-600">
            Analytics Overview
          </span>
        </div>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          Customer Segmentation
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Explore customer segments generated
          using K-Means and K-Medoids clustering
          with validated optimal-K analysis.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Customers"
          value={data.meta.customer_count.toString()}
          description="Records analyzed"
        />

        <MetricCard
          label="Optimal K"
          value={data.meta.optimal_k.toString()}
          description="Selected cluster count"
        />

        <MetricCard
          label="K-Means Silhouette"
          value={
            kMeans?.Silhouette.toFixed(4) ??
            "—"
          }
          description="Higher is better"
        />

        <MetricCard
          label="Davies-Bouldin"
          value={
            kMeans?.[
              "Davies-Bouldin"
            ].toFixed(4) ?? "—"
          }
          description="Lower is better"
        />
      </div>

      {/* Scatter Plot */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-200">
              Customer Segmentation Map
            </h2>

            <p className="mt-1 text-xs text-slate-600">
              Annual Income vs Spending Score ·
              K-Means · K=
              {data.meta.optimal_k}
            </p>
          </div>

          <span className="w-fit rounded-lg border border-indigo-400/10 bg-indigo-400/[0.05] px-2.5 py-1 text-[10px] text-indigo-300">
            {data.customers.length} customers
          </span>
        </div>

        <ClusterScatterChart
          customers={data.customers}
        />
      </div>

      {/* Distribution + Profiles */}
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-slate-200">
              Cluster Distribution
            </h2>

            <p className="mt-1 text-xs text-slate-600">
              Customer count across the five
              K-Means clusters
            </p>
          </div>

          <ClusterProfileChart
            profiles={data.kmeans_profiles}
          />
        </div>

        <ClusterProfileSummary
          profiles={data.kmeans_profiles}
        />
      </div>

      {/* Dataset Information */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-200">
                Dataset
              </h2>

              <p className="mt-1 text-xs text-slate-600">
                Current CustomerLens analysis
                source
              </p>
            </div>

            <span className="rounded-lg border border-emerald-400/10 bg-emerald-400/[0.05] px-2.5 py-1 text-[11px] text-emerald-400">
              Validated
            </span>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <InfoRow
              label="Dataset"
              value={data.meta.dataset}
            />

            <InfoRow
              label="Customers"
              value={data.meta.customer_count.toString()}
            />

            <InfoRow
              label="Optimal K"
              value={data.meta.optimal_k.toString()}
            />

            <InfoRow
              label="Algorithms"
              value={data.meta.algorithms.join(
                " · ",
              )}
            />
          </div>
        </div>

        {/* Features */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5">
          <h2 className="text-sm font-semibold text-slate-200">
            Clustering Features
          </h2>

          <p className="mt-1 text-xs text-slate-600">
            Features used for segmentation
          </p>

          <div className="mt-5 space-y-2">
            {data.meta.cluster_features.map(
              (feature) => (
                <div
                  key={feature}
                  className="rounded-xl border border-white/[0.05] bg-white/[0.02] px-3 py-2.5 text-xs text-slate-400"
                >
                  {feature}
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Pipeline Status */}
      <div className="rounded-2xl border border-indigo-400/10 bg-indigo-500/[0.035] p-5">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10">
            <Sparkles className="size-4 text-indigo-400" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-200">
              Analytics pipeline connected
            </h2>

            <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
              This dashboard is reading the
              validated Python clustering artifacts
              from the exported CustomerLens
              dataset. Interactive charts and
              individual analytics pages use this
              same source of truth.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

/* =========================================================
   CLUSTER PROFILE SUMMARY
   ========================================================= */

function ClusterProfileSummary({
  profiles,
}: {
  profiles: CustomerLensData["kmeans_profiles"]
}) {
  const sortedProfiles = [...profiles].sort(
    (a, b) =>
      a.KMeans_Cluster -
      b.KMeans_Cluster,
  )

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-slate-200">
          Cluster Profiles
        </h2>

        <p className="mt-1 text-xs text-slate-600">
          Average customer characteristics
        </p>
      </div>

      <div className="space-y-3">
        {sortedProfiles.map((profile) => (
          <div
            key={profile.KMeans_Cluster}
            className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 transition-colors hover:border-white/[0.09]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{
                    backgroundColor:
                      CLUSTER_COLORS[
                        profile.KMeans_Cluster %
                          CLUSTER_COLORS.length
                      ],
                  }}
                />

                <span className="text-xs font-medium text-slate-300">
                  Cluster{" "}
                  {profile.KMeans_Cluster}
                </span>
              </div>

              <span className="text-[10px] text-slate-600">
                {profile.Percentage}%
              </span>
            </div>

            <div className="mt-2 text-[11px] leading-4 text-slate-500">
              {profile.Segment_Type}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <MiniMetric
                label="Income"
                value={`$${profile.Avg_Income}k`}
              />

              <MiniMetric
                label="Spending"
                value={profile.Avg_Spending.toString()}
              />

              <MiniMetric
                label="Age"
                value={profile.Avg_Age.toString()}
              />

              <MiniMetric
                label="Customers"
                value={profile.Customers.toString()}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* =========================================================
   REUSABLE UI
   ========================================================= */

function MetricCard({
  label,
  value,
  description,
}: {
  label: string
  value: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5 transition-colors hover:border-indigo-400/15">
      <div className="text-xs font-medium text-slate-500">
        {label}
      </div>

      <div className="mt-3 text-3xl font-semibold tracking-tight text-white">
        {value}
      </div>

      <div className="mt-2 text-[11px] text-slate-600">
        {description}
      </div>
    </div>
  )
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-600">
        {label}
      </div>

      <div className="mt-1 text-sm text-slate-300">
        {value}
      </div>
    </div>
  )
}

function MiniMetric({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-lg bg-white/[0.025] px-2.5 py-2">
      <div className="text-[9px] uppercase tracking-wider text-slate-700">
        {label}
      </div>

      <div className="mt-0.5 text-[11px] font-medium text-slate-400">
        {value}
      </div>
    </div>
  )
}