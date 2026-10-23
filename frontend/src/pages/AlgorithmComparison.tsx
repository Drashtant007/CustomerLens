import {
  Activity,
  CheckCircle2,
  Gauge,
  GitCompareArrows,
  Info,
  Target,
} from "lucide-react"
import type { ReactNode } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { CustomerLensData } from "@/data/customerlens"

type AlgorithmComparisonProps = {
  data: CustomerLensData
}

type AlgorithmResult = {
  Algorithm: string
  K: number
  Silhouette: number
  "Davies-Bouldin": number
  Objective: number
}

const ALGORITHM_COLORS = {
  "K-Means": "#818cf8",
  "K-Medoids (PAM)": "#22d3ee",
}

function format(value: unknown, digits = 4) {
  const parsed = Number(value)

  return Number.isFinite(parsed)
    ? parsed.toFixed(digits)
    : "—"
}

function formatPercent(value: unknown) {
  const parsed = Number(value)

  return Number.isFinite(parsed)
    ? `${(parsed * 100).toFixed(1)}%`
    : "—"
}

/* =========================================================
   Metric Card
   ========================================================= */

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Gauge
  label: string
  value: string
  detail: string
}) {
  return (
    <Card className="border-white/10 bg-white/[0.025] shadow-none">
      <CardContent className="p-5">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
          <Icon className="h-5 w-5" />
        </div>

        <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
          {label}
        </p>

        <p className="mt-2 text-2xl font-semibold text-white">
          {value}
        </p>

        <p className="mt-2 text-sm leading-5 text-slate-500">
          {detail}
        </p>
      </CardContent>
    </Card>
  )
}

/* =========================================================
   Comparison Chart
   ========================================================= */

function ComparisonChart({
  title,
  description,
  data,
  dataKey,
  formatter,
}: {
  title: string
  description: string
  data: Array<{
    name: string
    value: number
  }>
  dataKey: string
  formatter?: (value: number) => string
}) {
  return (
    <Card className="border-white/10 bg-white/[0.025] shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-slate-100">
          {title}
        </CardTitle>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </CardHeader>

      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 32,
                right: 20,
                left: 0,
                bottom: 8,
              }}
            >
              <CartesianGrid
                stroke="rgba(148,163,184,0.10)"
                vertical={false}
              />

              <XAxis
                dataKey="name"
                tick={{
                  fill: "#94a3b8",
                  fontSize: 12,
                }}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                tick={{
                  fill: "#64748b",
                  fontSize: 11,
                }}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip
                cursor={false}
                contentStyle={{
                  backgroundColor: "#080d1b",
                  border: "1px solid #1e293b",
                  borderRadius: "12px",
                  color: "#e2e8f0",
                  boxShadow:
                    "0 12px 30px rgba(0, 0, 0, 0.35)",
                }}
                labelStyle={{
                  color: "#94a3b8",
                  marginBottom: "4px",
                }}
                itemStyle={{
                  color: "#e2e8f0",
                }}
              />

              <Bar
                dataKey={dataKey}
                radius={[8, 8, 0, 0]}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={
                      ALGORITHM_COLORS[
                        entry.name as keyof typeof ALGORITHM_COLORS
                      ]
                    }
                  />
                ))}

                <LabelList
                  dataKey={dataKey}
                  position="top"
                  fill="#cbd5e1"
                  fontSize={11}
                  formatter={(value) =>
                    formatter
                      ? formatter(Number(value))
                      : Number(value).toFixed(4)
                  }
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

/* =========================================================
   Result Row
   ========================================================= */

function ResultRow({
  label,
  kmeans,
  kmedoids,
  explanation,
}: {
  label: string
  kmeans: string
  kmedoids: string
  explanation: string
}) {
  return (
    <div className="grid gap-3 border-b border-white/5 py-4 last:border-0 md:grid-cols-[1.2fr_0.8fr_0.8fr_2fr] md:items-center">
      <div>
        <p className="font-medium text-slate-200">
          {label}
        </p>
      </div>

      <div>
        <p className="text-xs text-slate-600 md:hidden">
          K-Means
        </p>

        <p className="font-semibold text-indigo-300">
          {kmeans}
        </p>
      </div>

      <div>
        <p className="text-xs text-slate-600 md:hidden">
          K-Medoids
        </p>

        <p className="font-semibold text-cyan-300">
          {kmedoids}
        </p>
      </div>

      <p className="text-sm leading-5 text-slate-500">
        {explanation}
      </p>
    </div>
  )
}

/* =========================================================
   Interpretation Card
   ========================================================= */

function InterpretationCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof CheckCircle2
  title: string
  children: ReactNode
}) {
  return (
    <Card className="border-white/10 bg-white/[0.025] shadow-none">
      <CardContent className="p-5">
        <div className="flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <Icon className="h-4 w-4" />
          </div>

          <div>
            <h3 className="font-semibold text-slate-100">
              {title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {children}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/* =========================================================
   Main Page
   ========================================================= */

export function AlgorithmComparison({
  data,
}: AlgorithmComparisonProps) {
  const results =
    data.algorithm_comparison as AlgorithmResult[]

  const kmeans = results.find(
    (item) => item.Algorithm === "K-Means",
  )

  const kmedoids = results.find(
    (item) => item.Algorithm === "K-Medoids (PAM)",
  )

  if (!kmeans || !kmedoids) {
    return (
      <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-6 text-sm text-red-300">
        Algorithm comparison data is unavailable.
      </div>
    )
  }

  /* =======================================================
     Chart Data
     ======================================================= */

  const silhouetteData = [
    {
      name: "K-Means",
      value: Number(kmeans.Silhouette),
    },
    {
      name: "K-Medoids (PAM)",
      value: Number(kmedoids.Silhouette),
    },
  ]

  const dbData = [
    {
      name: "K-Means",
      value: Number(kmeans["Davies-Bouldin"]),
    },
    {
      name: "K-Medoids (PAM)",
      value: Number(kmedoids["Davies-Bouldin"]),
    },
  ]

  /*
   * These runtime values are the measured benchmark values
   * from the project experiments.
   *
   * They are displayed as measured implementation runtime,
   * not as a general algorithm performance claim.
   */
  const runtimeData = [
    {
      name: "K-Means",
      value: 0.164474,
    },
    {
      name: "K-Medoids (PAM)",
      value: 0.076011,
    },
  ]

  /* =======================================================
     Comparison Winners
     ======================================================= */

  const ari = 0.9597

  const silhouetteWinner =
    Number(kmedoids.Silhouette) >
    Number(kmeans.Silhouette)
      ? "K-Medoids"
      : "K-Means"

  const dbWinner =
    Number(kmedoids["Davies-Bouldin"]) <
    Number(kmeans["Davies-Bouldin"])
      ? "K-Medoids"
      : "K-Means"

  /* =======================================================
     Render
     ======================================================= */

  return (
    <div className="space-y-6">
      {/* Header */}
      <section>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-violet-400/20 bg-violet-400/10 text-violet-300"
              >
                Model Comparison
              </Badge>

              <span className="text-xs text-slate-600">
                K = {data.meta.optimal_k}
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Algorithm Comparison
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
              Compare the final K-Means and K-Medoids results
              using cluster-quality metrics and the measured
              project runtime.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/5 px-4 py-3">
            <GitCompareArrows className="h-5 w-5 text-emerald-400" />

            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Partition agreement
              </p>

              <p className="text-xl font-semibold text-white">
                ARI {ari.toFixed(4)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Key metrics */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Target}
          label="K-Means silhouette"
          value={format(kmeans.Silhouette)}
          detail="Higher is better."
        />

        <MetricCard
          icon={Target}
          label="K-Medoids silhouette"
          value={format(kmedoids.Silhouette)}
          detail="Higher is better."
        />

        <MetricCard
          icon={Activity}
          label="K-Medoids DB"
          value={format(kmedoids["Davies-Bouldin"])}
          detail="Lower is better."
        />

        <MetricCard
          icon={GitCompareArrows}
          label="ARI"
          value={formatPercent(ari)}
          detail="Agreement between the two customer partitions."
        />
      </section>

      {/* Comparison charts */}
      <section className="grid gap-6 xl:grid-cols-2">
        <ComparisonChart
          title="Silhouette Score"
          description="Higher values indicate better-defined and better-separated clusters."
          data={silhouetteData}
          dataKey="value"
        />

        <ComparisonChart
          title="Davies–Bouldin Index"
          description="Lower values indicate better separation relative to within-cluster spread."
          data={dbData}
          dataKey="value"
        />
      </section>

      {/* Runtime */}
      <ComparisonChart
        title="Measured Runtime"
        description="Execution time recorded during the project's final clustering run. This is specific to the current implementation and environment."
        data={runtimeData}
        dataKey="value"
        formatter={(value) => `${value.toFixed(3)} s`}
      />

      {/* Detailed table */}
      <Card className="border-white/10 bg-white/[0.025] shadow-none">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-100">
            Final Results
          </CardTitle>

          <p className="text-sm leading-6 text-slate-500">
            Side-by-side values at the selected optimal K.
          </p>
        </CardHeader>

        <CardContent>
          <div className="hidden border-b border-white/5 pb-3 md:grid md:grid-cols-[1.2fr_0.8fr_0.8fr_2fr]">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-600">
              Metric
            </p>

            <p className="text-xs font-medium uppercase tracking-[0.12em] text-indigo-400">
              K-Means
            </p>

            <p className="text-xs font-medium uppercase tracking-[0.12em] text-cyan-400">
              K-Medoids
            </p>

            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-600">
              Interpretation
            </p>
          </div>

          <ResultRow
            label="K"
            kmeans={String(kmeans.K)}
            kmedoids={String(kmedoids.K)}
            explanation="Both algorithms use the same selected number of clusters."
          />

          <ResultRow
            label="Silhouette"
            kmeans={format(kmeans.Silhouette)}
            kmedoids={format(kmedoids.Silhouette)}
            explanation={`${silhouetteWinner} has the slightly higher silhouette score. Higher is better.`}
          />

          <ResultRow
            label="Davies–Bouldin"
            kmeans={format(kmeans["Davies-Bouldin"])}
            kmedoids={format(kmedoids["Davies-Bouldin"])}
            explanation={`${dbWinner} has the lower DB index. Lower is better.`}
          />

          <ResultRow
            label="Objective"
            kmeans={format(kmeans.Objective)}
            kmedoids={format(kmedoids.Objective)}
            explanation="These objectives are algorithm-specific and should not be interpreted as directly comparable scores."
          />

          <ResultRow
            label="Runtime"
            kmeans="0.164 s"
            kmedoids="0.076 s"
            explanation="Measured execution time from the project's final implementation run."
          />

          <ResultRow
            label="ARI"
            kmeans="0.9597"
            kmedoids="0.9597"
            explanation="Adjusted Rand Index measures agreement between the two resulting partitions; it is not classification accuracy."
          />
        </CardContent>
      </Card>

      {/* Interpretation */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            What the results tell us
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Interpretation of the measured experiment results.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <InterpretationCard
            icon={CheckCircle2}
            title="Both methods produce strong clusters"
          >
            The silhouette scores are very close, with K-Means
            at {format(kmeans.Silhouette)} and K-Medoids at{" "}
            {format(kmedoids.Silhouette)}. Both methods therefore
            provide a similar clustering quality on this dataset.
          </InterpretationCard>

          <InterpretationCard
            icon={Gauge}
            title="K-Medoids has a slight metric advantage"
          >
            K-Medoids has the slightly higher silhouette score
            and the lower Davies–Bouldin index in the final
            experiment. The differences are small, so the result
            should not be presented as a dramatic superiority
            claim.
          </InterpretationCard>

          <InterpretationCard
            icon={GitCompareArrows}
            title="The partitions strongly agree"
          >
            The ARI of 0.9597 indicates very high agreement
            between the K-Means and K-Medoids customer
            assignments. This supports the stability of the
            discovered customer segmentation.
          </InterpretationCard>
        </div>
      </section>

      {/* Methodology note */}
      <Card className="border-amber-400/15 bg-amber-400/[0.035] shadow-none">
        <CardContent className="p-5 sm:p-6">
          <div className="flex gap-4">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-amber-300">
              <Info className="h-4 w-4" />
            </div>

            <div>
              <h3 className="font-semibold text-slate-100">
                Important interpretation note
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                K-Means inertia and K-Medoids PAM cost represent
                different optimization objectives. They are shown
                for transparency, but their raw objective values
                should not be used to claim that one algorithm is
                numerically better than the other. Silhouette,
                Davies–Bouldin, cluster profiles, and partition
                agreement are more appropriate for cross-algorithm
                comparison.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}