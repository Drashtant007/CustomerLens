import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { ClusterProfile } from "@/data/customerlens"

type ClusterProfileChartProps = {
  profiles: ClusterProfile[]
}

import {
  getClusterColor,
} from "@/lib/cluster-colors"

function ProfileTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{
    payload: ClusterProfile
  }>
}) {
  if (!active || !payload?.length) {
    return null
  }

  const profile = payload[0].payload

  return (
    <div className="min-w-[240px] rounded-xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <span
          className="size-2.5 rounded-full"
          style={{
            backgroundColor: getClusterColor(
              profile.KMeans_Cluster,
            ),
          }}
        />

        <span className="text-sm font-semibold text-white">
          Cluster {profile.KMeans_Cluster}
        </span>
      </div>

      <p className="mt-2 text-xs leading-5 text-slate-500">
        {profile.Segment_Type}
      </p>

      <div className="my-3 h-px bg-white/[0.06]" />

      <div className="grid grid-cols-2 gap-x-5 gap-y-3">
        <Metric
          label="Customers"
          value={profile.Customers.toString()}
        />

        <Metric
          label="Share"
          value={`${profile.Percentage}%`}
        />

        <Metric
          label="Avg. Income"
          value={`$${profile.Avg_Income}k`}
        />

        <Metric
          label="Avg. Spending"
          value={profile.Avg_Spending.toString()}
        />

        <Metric
          label="Avg. Age"
          value={profile.Avg_Age.toString()}
        />

        <Metric
          label="Median Age"
          value={profile.Median_Age.toString()}
        />
      </div>
    </div>
  )
}

function Metric({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <div className="text-[10px] text-slate-600">
        {label}
      </div>

      <div className="mt-0.5 text-xs font-medium text-slate-300">
        {value}
      </div>
    </div>
  )
}

export function ClusterProfileChart({
  profiles,
}: ClusterProfileChartProps) {
  const sortedProfiles = [...profiles].sort(
    (a, b) => a.KMeans_Cluster - b.KMeans_Cluster,
  )

  return (
    <div className="w-full">
      <div className="h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sortedProfiles}
            margin={{
              top: 10,
              right: 10,
              bottom: 10,
              left: -15,
            }}
          >
            <CartesianGrid
              stroke="rgba(255,255,255,0.05)"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="KMeans_Cluster"
              tick={{
                fill: "#64748b",
                fontSize: 11,
              }}
              tickLine={false}
              axisLine={{
                stroke: "rgba(255,255,255,0.08)",
              }}
              tickFormatter={(value) => `Cluster ${value}`}
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
              cursor={{
                fill: "rgba(255,255,255,0.025)",
              }}
              content={<ProfileTooltip />}
            />

            <Bar
              dataKey="Customers"
              name="Customers"
              radius={[8, 8, 0, 0]}
              animationDuration={800}
            >
              {sortedProfiles.map((profile) => (
                <Cell
                  key={profile.KMeans_Cluster}
                  fill={getClusterColor(
                    profile.KMeans_Cluster,
                  )}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}