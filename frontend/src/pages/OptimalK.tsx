import {
  BarChart3,
  CheckCircle2,
  Info,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import type { ReactNode } from "react"

import type { CustomerLensData } from "@/data/customerlens"

type OptimalKProps = {
  data: CustomerLensData
}

function MetricTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{
    value: number
    name: string
  }>
  label?: number
}) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-xl">
      <div className="mb-3 text-xs font-semibold text-white">
        K = {label}
      </div>

      <div className="space-y-2">
        {payload.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between gap-8"
          >
            <span className="text-[11px] text-slate-500">
              {formatMetricName(item.name)}
            </span>

            <span className="text-xs font-medium text-slate-300">
              {Number(item.value).toFixed(4)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function formatMetricName(name: string) {
  switch (name) {
    case "silhouette":
      return "Silhouette"

    case "davies_bouldin":
      return "Davies-Bouldin"

    case "inertia":
      return "Inertia"

    case "medoid_cost":
      return "Medoid Cost"

    default:
      return name
  }
}

export function OptimalK({ data }: OptimalKProps) {
  const kMeans = [...data.kmeans_optimal_k].sort(
    (a, b) => a.k - b.k,
  )

  const kMedoids = [...data.kmedoids_optimal_k].sort(
    (a, b) => a.k - b.k,
  )

  const silhouetteData = kMeans.map((item, index) => ({
    k: item.k,
    kmeans: item.silhouette,
    kmedoids: kMedoids[index]?.silhouette ?? null,
  }))

  const daviesBouldinData = kMeans.map((item, index) => ({
    k: item.k,
    kmeans: item.davies_bouldin,
    kmedoids: kMedoids[index]?.davies_bouldin ?? null,
  }))

  const inertiaData = kMeans.map((item) => ({
    k: item.k,
    inertia: item.inertia,
  }))

  const medoidCostData = kMedoids.map((item) => ({
    k: item.k,
    medoid_cost: item.medoid_cost,
  }))

  const bestKMeansSilhouette = kMeans.reduce(
    (best, current) =>
      current.silhouette > best.silhouette ? current : best,
    kMeans[0],
  )

  const bestKMedoidsSilhouette = kMedoids.reduce(
    (best, current) =>
      current.silhouette > best.silhouette ? current : best,
    kMedoids[0],
  )

  return (
    <section className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-indigo-400/15 bg-indigo-500/10 px-2.5 py-1 text-[11px] font-medium text-indigo-300">
            Model Selection
          </span>

          <span className="text-xs text-slate-600">
            K = 2 through 10
          </span>
        </div>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
          Optimal K Analysis
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          Evaluate cluster quality across different values of K
          using silhouette score, Davies-Bouldin index, and
          algorithm-specific objective functions.
        </p>
      </div>

      {/* Decision banner */}
      <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.035] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10">
              <CheckCircle2 className="size-5 text-emerald-400" />
            </div>

            <div>
              <div className="text-sm font-semibold text-slate-200">
                Selected optimal K
              </div>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Both algorithms reach their strongest silhouette
                score at K = {data.meta.optimal_k}.
              </p>
            </div>
          </div>

          <div className="text-4xl font-semibold tracking-tight text-emerald-400">
            K = {data.meta.optimal_k}
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          icon={BarChart3}
          title="K-Means"
          value={`K = ${bestKMeansSilhouette.k}`}
          metric={`Silhouette ${bestKMeansSilhouette.silhouette.toFixed(4)}`}
          description="Best silhouette score"
        />

        <SummaryCard
          icon={BarChart3}
          title="K-Medoids"
          value={`K = ${bestKMedoidsSilhouette.k}`}
          metric={`Silhouette ${bestKMedoidsSilhouette.silhouette.toFixed(4)}`}
          description="Best silhouette score"
        />

        <SummaryCard
          icon={CheckCircle2}
          title="Final Selection"
          value={`K = ${data.meta.optimal_k}`}
          metric="Used by final models"
          description="Validated project configuration"
        />
      </div>

      {/* Silhouette */}
      <ChartCard
        title="Silhouette Score"
        description="Higher values indicate better-defined clusters."
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={silhouetteData}
            margin={{
              top: 15,
              right: 20,
              left: -10,
              bottom: 5,
            }}
          >
            <CartesianGrid
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="k"
              tick={{
                fill: "#64748b",
                fontSize: 11,
              }}
              tickLine={false}
              axisLine={{
                stroke: "rgba(255,255,255,0.08)",
              }}
            />

            <YAxis
              domain={[0, 0.65]}
              tick={{
                fill: "#64748b",
                fontSize: 11,
              }}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip content={<MetricTooltip />} />

            <Line
              type="monotone"
              dataKey="kmeans"
              name="silhouette"
              stroke="#818cf8"
              strokeWidth={2.5}
              dot={{
                r: 3,
                fill: "#818cf8",
              }}
              activeDot={{
                r: 6,
              }}
              animationDuration={900}
            />

            <Line
              type="monotone"
              dataKey="kmedoids"
              name="silhouette"
              stroke="#22d3ee"
              strokeWidth={2.5}
              dot={{
                r: 3,
                fill: "#22d3ee",
              }}
              activeDot={{
                r: 6,
              }}
              animationDuration={900}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Davies-Bouldin */}
      <ChartCard
        title="Davies-Bouldin Index"
        description="Lower values indicate better cluster separation."
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={daviesBouldinData}
            margin={{
              top: 15,
              right: 20,
              left: -10,
              bottom: 5,
            }}
          >
            <CartesianGrid
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="k"
              tick={{
                fill: "#64748b",
                fontSize: 11,
              }}
              tickLine={false}
              axisLine={{
                stroke: "rgba(255,255,255,0.08)",
              }}
            />

            <YAxis
              tick={{
                fill: "#64748b",
                fontSize: 11,
              }}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip content={<MetricTooltip />} />

            <Line
              type="monotone"
              dataKey="kmeans"
              name="davies_bouldin"
              stroke="#818cf8"
              strokeWidth={2.5}
              dot={{
                r: 3,
                fill: "#818cf8",
              }}
              activeDot={{
                r: 6,
              }}
              animationDuration={900}
            />

            <Line
              type="monotone"
              dataKey="kmedoids"
              name="davies_bouldin"
              stroke="#22d3ee"
              strokeWidth={2.5}
              dot={{
                r: 3,
                fill: "#22d3ee",
              }}
              activeDot={{
                r: 6,
              }}
              animationDuration={900}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Algorithm-specific objective charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard
          title="K-Means Inertia"
          description="Within-cluster sum of squared distances. Lower is better; use the elbow to identify diminishing returns."
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={inertiaData}
              margin={{
                top: 15,
                right: 20,
                left: -10,
                bottom: 5,
              }}
            >
              <CartesianGrid
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="k"
                tick={{
                  fill: "#64748b",
                  fontSize: 11,
                }}
                tickLine={false}
                axisLine={{
                  stroke: "rgba(255,255,255,0.08)",
                }}
              />

              <YAxis
                tick={{
                  fill: "#64748b",
                  fontSize: 11,
                }}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip content={<MetricTooltip />} />

              <Line
                type="monotone"
                dataKey="inertia"
                name="inertia"
                stroke="#818cf8"
                strokeWidth={2.5}
                dot={{
                  r: 3,
                  fill: "#818cf8",
                }}
                activeDot={{
                  r: 6,
                }}
                animationDuration={900}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="K-Medoids Medoid Cost"
          description="PAM objective cost across K. Lower values indicate lower total distance to selected medoids."
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={medoidCostData}
              margin={{
                top: 15,
                right: 20,
                left: -10,
                bottom: 5,
              }}
            >
              <CartesianGrid
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="k"
                tick={{
                  fill: "#64748b",
                  fontSize: 11,
                }}
                tickLine={false}
                axisLine={{
                  stroke: "rgba(255,255,255,0.08)",
                }}
              />

              <YAxis
                tick={{
                  fill: "#64748b",
                  fontSize: 11,
                }}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip content={<MetricTooltip />} />

              <Line
                type="monotone"
                dataKey="medoid_cost"
                name="medoid_cost"
                stroke="#22d3ee"
                strokeWidth={2.5}
                dot={{
                  r: 3,
                  fill: "#22d3ee",
                }}
                activeDot={{
                  r: 6,
                }}
                animationDuration={900}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Interpretation */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5">
        <div className="flex items-start gap-3">
          <Info className="mt-0.5 size-4 shrink-0 text-indigo-400" />

          <div>
            <h2 className="text-sm font-semibold text-slate-200">
              How to interpret the analysis
            </h2>

            <div className="mt-3 grid gap-4 md:grid-cols-3">
              <Interpretation
                icon={TrendingUp}
                title="Silhouette"
                text="Higher values indicate customers are more clearly separated into their assigned clusters."
              />

              <Interpretation
                icon={TrendingDown}
                title="Davies-Bouldin"
                text="Lower values indicate compact clusters with better separation from neighboring clusters."
              />

              <Interpretation
                icon={BarChart3}
                title="Objective curves"
                text="Inertia and medoid cost decrease as K increases, so the elbow helps identify diminishing returns."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5">
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-slate-200">
          {title}
        </h2>

        <p className="mt-1 text-xs leading-5 text-slate-600">
          {description}
        </p>
      </div>

      <div className="h-[330px] w-full">
        {children}
      </div>

      <div className="mt-4 flex items-center gap-5 border-t border-white/[0.05] pt-3">
        <Legend color="#818cf8" label="K-Means" />
        <Legend color="#22d3ee" label="K-Medoids" />
      </div>
    </div>
  )
}

function Legend({
  color,
  label,
}: {
  color: string
  label: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="size-2 rounded-full"
        style={{ backgroundColor: color }}
      />

      <span className="text-[11px] text-slate-500">
        {label}
      </span>
    </div>
  )
}

function SummaryCard({
  icon: Icon,
  title,
  value,
  metric,
  description,
}: {
  icon: typeof BarChart3
  title: string
  value: string
  metric: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-5">
      <div className="flex items-center gap-2">
        <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10">
          <Icon className="size-4 text-indigo-400" />
        </div>

        <span className="text-xs font-medium text-slate-500">
          {title}
        </span>
      </div>

      <div className="mt-4 text-2xl font-semibold tracking-tight text-white">
        {value}
      </div>

      <div className="mt-1 text-xs text-indigo-300">
        {metric}
      </div>

      <div className="mt-2 text-[11px] text-slate-600">
        {description}
      </div>
    </div>
  )
}

function Interpretation({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof TrendingUp
  title: string
  text: string
}) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
      <div className="flex items-center gap-2">
        <Icon className="size-4 text-slate-500" />

        <span className="text-xs font-medium text-slate-300">
          {title}
        </span>
      </div>

      <p className="mt-2 text-[11px] leading-5 text-slate-600">
        {text}
      </p>
    </div>
  )
}