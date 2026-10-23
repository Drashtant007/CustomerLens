import {
  Activity,
  CircleDollarSign,
  Target,
  Users,
} from "lucide-react"
import { useMemo, useState } from "react"
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CustomerLensData } from "@/data/customerlens"
import { CLUSTER_COLORS } from "@/lib/cluster-colors"

type ClusterExplorerProps = {
  data: CustomerLensData
}

type Customer = {
  CustomerID: number
  Gender: string
  Age: number
  "Annual Income (k$)": number
  "Spending Score (1-100)": number
  KMeans_Cluster: number
  KMedoids_Cluster: number
  KMeans_Segment: string
  KMedoids_Segment: string
}

type ClusterProfile = {
  KMeans_Cluster?: number
  KMedoids_Cluster?: number
  Customers: number
  Avg_Age: number
  Avg_Income: number
  Avg_Spending: number
  Percentage: number
  Segment_Type?: string
}

type Algorithm = "K-Means" | "K-Medoids"

function formatNumber(value: number, digits = 1) {
  return Number.isFinite(value) ? value.toFixed(digits) : "—"
}

function ClusterTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{
    payload?: Customer & {
      cluster: number
      segment: string
    }
  }>
}) {
  if (!active || !payload?.length || !payload[0]?.payload) {
    return null
  }

  const customer = payload[0].payload

  return (
    <div className="min-w-56 rounded-xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl backdrop-blur">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
        Customer #{customer.CustomerID}
      </p>

      <div className="mt-3 space-y-2">
        <div className="flex justify-between gap-6 text-sm">
          <span className="text-slate-500">Cluster</span>
          <span className="font-semibold text-white">
            {customer.cluster + 1}
          </span>
        </div>

        <div className="flex justify-between gap-6 text-sm">
          <span className="text-slate-500">Age</span>
          <span className="text-slate-200">{customer.Age}</span>
        </div>

        <div className="flex justify-between gap-6 text-sm">
          <span className="text-slate-500">Income</span>
          <span className="text-slate-200">
            ${customer["Annual Income (k$)"]}k
          </span>
        </div>

        <div className="flex justify-between gap-6 text-sm">
          <span className="text-slate-500">Spending</span>
          <span className="text-slate-200">
            {customer["Spending Score (1-100)"]}
          </span>
        </div>

        <div className="border-t border-white/10 pt-2">
          <p className="text-xs leading-5 text-indigo-300">
            {customer.segment}
          </p>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Users
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

        <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
          {value}
        </p>

        <p className="mt-2 text-sm text-slate-500">{detail}</p>
      </CardContent>
    </Card>
  )
}

export function ClusterExplorer({ data }: ClusterExplorerProps) {
  const [algorithm, setAlgorithm] = useState<Algorithm>("K-Means")
  const [selectedCluster, setSelectedCluster] = useState<number | null>(null)

  const customers = data.customers as Customer[]

  const clusterKey =
    algorithm === "K-Means" ? "KMeans_Cluster" : "KMedoids_Cluster"

  const segmentKey =
    algorithm === "K-Means" ? "KMeans_Segment" : "KMedoids_Segment"

  const profiles =
    algorithm === "K-Means"
      ? (data.kmeans_profiles as ClusterProfile[])
      : (data.kmedoids_profiles as ClusterProfile[])

  const points = useMemo(() => {
    return customers.map((customer) => ({
      ...customer,
      cluster: Number(customer[clusterKey as keyof Customer]),
      segment: String(customer[segmentKey as keyof Customer]),
    }))
  }, [customers, clusterKey, segmentKey])

  const selectedProfile = profiles.find((profile) => {
    const cluster =
      algorithm === "K-Means"
        ? profile.KMeans_Cluster
        : profile.KMedoids_Cluster

    return cluster === selectedCluster
  })

  const selectedPoints =
    selectedCluster === null
      ? points
      : points.filter((customer) => customer.cluster === selectedCluster)

  const scatterData = Array.from({ length: data.meta.optimal_k }, (_, index) => {
    return {
      cluster: index,
      data: points.filter((customer) => customer.cluster === index),
    }
  })

  const getProfileCluster = (profile: ClusterProfile) =>
    algorithm === "K-Means"
      ? profile.KMeans_Cluster
      : profile.KMedoids_Cluster

  return (
    <div className="space-y-6">
      {/* Header */}
      <section>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
              >
                Cluster Analysis
              </Badge>

              <span className="text-xs text-slate-600">
                {data.meta.customer_count} customers
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Cluster Explorer
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
              Explore how customers are grouped using Annual Income and
              Spending Score at the selected optimal K.
            </p>
          </div>

          {/* Algorithm switch */}
          <div className="flex w-fit rounded-xl border border-white/10 bg-white/[0.025] p-1">
            <Button
              variant={algorithm === "K-Means" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setAlgorithm("K-Means")
                setSelectedCluster(null)
              }}
            >
              K-Means
            </Button>

            <Button
              variant={algorithm === "K-Medoids" ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setAlgorithm("K-Medoids")
                setSelectedCluster(null)
              }}
            >
              K-Medoids
            </Button>
          </div>
        </div>
      </section>

      {/* Overview metrics */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Users}
          label="Customers"
          value={String(
            selectedCluster === null
              ? customers.length
              : selectedPoints.length,
          )}
          detail={
            selectedCluster === null
              ? "All customers in the dataset."
              : `Customers in Cluster ${selectedCluster + 1}.`
          }
        />

        <MetricCard
          icon={Target}
          label="Clusters"
          value={String(data.meta.optimal_k)}
          detail="Selected optimal number of customer groups."
        />

        <MetricCard
          icon={CircleDollarSign}
          label="Avg. income"
          value={
            selectedCluster !== null && selectedProfile
              ? `$${formatNumber(selectedProfile.Avg_Income)}k`
              : "All"
          }
          detail={
            selectedCluster !== null
              ? "Average annual income of selected cluster."
              : "Select a cluster to inspect its profile."
          }
        />

        <MetricCard
          icon={Activity}
          label="Avg. spending"
          value={
            selectedCluster !== null && selectedProfile
              ? formatNumber(selectedProfile.Avg_Spending)
              : "All"
          }
          detail={
            selectedCluster !== null
              ? "Average spending score of selected cluster."
              : "Select a cluster to inspect its profile."
          }
        />
      </section>

      {/* Main scatter plot */}
      <Card className="border-white/10 bg-white/[0.025] shadow-none">
        <CardHeader className="pb-2">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle className="text-base font-semibold text-slate-100">
                Income vs Spending Score
              </CardTitle>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Each point represents one customer. Colors indicate the
                assigned {algorithm} cluster.
              </p>
            </div>

            <Badge
              variant="outline"
              className="w-fit border-white/10 bg-white/[0.03] text-slate-300"
            >
              K = {data.meta.optimal_k}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="h-[460px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{
                  top: 20,
                  right: 24,
                  bottom: 24,
                  left: 8,
                }}
              >
                <CartesianGrid
                  stroke="rgba(148,163,184,0.10)"
                  vertical={false}
                />

                <XAxis
                  type="number"
                  dataKey="Annual Income (k$)"
                  name="Annual Income"
                  domain={[0, "auto"]}
                  tick={{
                    fill: "#64748b",
                    fontSize: 12,
                  }}
                  tickLine={false}
                  axisLine={false}
                  label={{
                    value: "Annual Income (k$)",
                    position: "insideBottom",
                    offset: -12,
                    fill: "#64748b",
                    fontSize: 12,
                  }}
                />

                <YAxis
                  type="number"
                  dataKey="Spending Score (1-100)"
                  name="Spending Score"
                  domain={[0, 100]}
                  tick={{
                    fill: "#64748b",
                    fontSize: 12,
                  }}
                  tickLine={false}
                  axisLine={false}
                  label={{
                    value: "Spending Score",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#64748b",
                    fontSize: 12,
                  }}
                />

                <Tooltip
                  cursor={{
                    strokeDasharray: "4 4",
                    stroke: "rgba(148,163,184,0.35)",
                  }}
                  content={<ClusterTooltip />}
                />

                {scatterData.map((cluster) => {
                  const isDimmed =
                    selectedCluster !== null &&
                    selectedCluster !== cluster.cluster

                  return (
                    <Scatter
                      key={cluster.cluster}
                      name={`Cluster ${cluster.cluster + 1}`}
                      data={cluster.data}
                      fill={
                        CLUSTER_COLORS[
                          cluster.cluster % CLUSTER_COLORS.length
                        ]
                      }
                      fillOpacity={isDimmed ? 0.12 : 0.82}
                      line={
                        selectedCluster === cluster.cluster
                          ? {
                              stroke:
                                CLUSTER_COLORS[
                                  cluster.cluster % CLUSTER_COLORS.length
                                ],
                              strokeWidth: 2,
                            }
                          : undefined
                      }
                      shape="circle"
                    />
                  )
                })}
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Cluster legend */}
          <div className="mt-4 flex flex-wrap gap-2">
            {profiles.map((profile) => {
              const cluster = getProfileCluster(profile)

              if (cluster === undefined) {
                return null
              }

              const active = selectedCluster === cluster

              return (
                <button
                  key={cluster}
                  type="button"
                  onClick={() =>
                    setSelectedCluster(active ? null : cluster)
                  }
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs transition ${
                    active
                      ? "border-white/20 bg-white/10 text-white"
                      : "border-white/5 bg-white/[0.02] text-slate-400 hover:bg-white/[0.05]"
                  }`}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        CLUSTER_COLORS[
                          cluster % CLUSTER_COLORS.length
                        ],
                    }}
                  />

                  Cluster {cluster + 1}

                  <span className="text-slate-600">
                    {profile.Customers}
                  </span>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Selected cluster */}
      {selectedCluster !== null && selectedProfile && (
        <Card className="border-indigo-400/15 bg-indigo-500/[0.04] shadow-none">
          <CardContent className="p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <Badge
                  variant="outline"
                  className="border-indigo-400/20 bg-indigo-500/10 text-indigo-300"
                >
                  Selected Cluster
                </Badge>

                <h2 className="mt-3 text-2xl font-semibold text-white">
                  Cluster {selectedCluster + 1}
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  {selectedProfile.Segment_Type ??
                    "Customer segment profile"}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCluster(null)}
              >
                Clear selection
              </Button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              <MiniStat
                label="Customers"
                value={String(selectedProfile.Customers)}
              />

              <MiniStat
                label="Share"
                value={`${formatNumber(selectedProfile.Percentage)}%`}
              />

              <MiniStat
                label="Avg. Age"
                value={formatNumber(selectedProfile.Avg_Age)}
              />

              <MiniStat
                label="Avg. Income"
                value={`$${formatNumber(selectedProfile.Avg_Income)}k`}
              />

              <MiniStat
                label="Avg. Spending"
                value={formatNumber(selectedProfile.Avg_Spending)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cluster profiles */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            Cluster Profiles
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Statistical summary of the {algorithm} customer segments.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {profiles.map((profile) => {
            const cluster = getProfileCluster(profile)

            if (cluster === undefined) {
              return null
            }

            const active = selectedCluster === cluster

            return (
              <button
                key={cluster}
                type="button"
                onClick={() =>
                  setSelectedCluster(active ? null : cluster)
                }
                className="text-left"
              >
                <Card
                  className={`h-full border-white/10 bg-white/[0.025] shadow-none transition ${
                    active
                      ? "border-indigo-400/30 bg-indigo-500/[0.05]"
                      : "hover:border-white/20 hover:bg-white/[0.04]"
                  }`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor:
                              CLUSTER_COLORS[
                                cluster % CLUSTER_COLORS.length
                              ],
                          }}
                        />

                        <div>
                          <p className="font-semibold text-white">
                            Cluster {cluster + 1}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {profile.Customers} customers
                          </p>
                        </div>
                      </div>

                      <span className="text-xs text-slate-500">
                        {formatNumber(profile.Percentage)}%
                      </span>
                    </div>

                    <p className="mt-5 min-h-10 text-sm leading-5 text-slate-400">
                      {profile.Segment_Type ?? "Customer segment"}
                    </p>

                    <div className="mt-5 grid grid-cols-3 gap-3">
                      <MiniStat
                        label="Age"
                        value={formatNumber(profile.Avg_Age)}
                      />

                      <MiniStat
                        label="Income"
                        value={`$${formatNumber(profile.Avg_Income)}k`}
                      />

                      <MiniStat
                        label="Spend"
                        value={formatNumber(profile.Avg_Spending)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function MiniStat({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/10 p-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-600">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-200">
        {value}
      </p>
    </div>
  )
}