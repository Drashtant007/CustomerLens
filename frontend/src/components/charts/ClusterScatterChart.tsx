import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import type { Customer } from "@/data/customerlens"

type ClusterScatterChartProps = {
  customers: Customer[]
}

type ScatterPoint = Customer & {
  income: number
  spending: number
  cluster: number
}

const CLUSTER_COLORS = [
  "#818cf8",
  "#22d3ee",
  "#34d399",
  "#fbbf24",
  "#f472b6",
]

function getClusterColor(cluster: number) {
  return CLUSTER_COLORS[cluster % CLUSTER_COLORS.length]
}

function CustomerTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{
    payload: ScatterPoint
  }>
}) {
  if (!active || !payload?.length) {
    return null
  }

  const customer = payload[0].payload

  return (
    <div className="min-w-[230px] rounded-xl border border-white/10 bg-slate-950/95 p-4 shadow-2xl backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-500">Customer</div>

          <div className="mt-0.5 text-sm font-semibold text-white">
            #{customer.CustomerID}
          </div>
        </div>

        <span
          className="rounded-full px-2 py-1 text-[10px] font-medium"
          style={{
            backgroundColor: `${getClusterColor(customer.cluster)}18`,
            color: getClusterColor(customer.cluster),
          }}
        >
          Cluster {customer.cluster}
        </span>
      </div>

      <div className="my-3 h-px bg-white/[0.06]" />

      <div className="grid grid-cols-2 gap-x-5 gap-y-3">
        <TooltipValue
          label="Income"
          value={`$${customer.income}k`}
        />

        <TooltipValue
          label="Spending"
          value={customer.spending.toString()}
        />

        <TooltipValue
          label="Age"
          value={customer.Age.toString()}
        />

        <TooltipValue
          label="Gender"
          value={customer.Gender}
        />
      </div>

      <div className="mt-3 rounded-lg bg-white/[0.03] px-3 py-2">
        <div className="text-[10px] uppercase tracking-wider text-slate-600">
          Segment
        </div>

        <div className="mt-1 text-xs text-slate-300">
          {customer.KMeans_Segment}
        </div>
      </div>
    </div>
  )
}

function TooltipValue({
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

export function ClusterScatterChart({
  customers,
}: ClusterScatterChartProps) {
  const points: ScatterPoint[] = customers.map((customer) => ({
    ...customer,
    income: customer["Annual Income (k$)"],
    spending: customer["Spending Score (1-100)"],
    cluster: customer.KMeans_Cluster,
  }))

  const clusters = Array.from(
    new Set(points.map((point) => point.cluster)),
  ).sort((a, b) => a - b)

  return (
    <div className="w-full">
      <div className="h-[460px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart
            margin={{
              top: 20,
              right: 24,
              bottom: 20,
              left: 0,
            }}
          >
            <CartesianGrid
              stroke="rgba(255,255,255,0.055)"
              strokeDasharray="3 3"
            />

            <XAxis
              type="number"
              dataKey="income"
              name="Annual Income"
              tick={{
                fill: "#64748b",
                fontSize: 11,
              }}
              tickLine={false}
              axisLine={{
                stroke: "rgba(255,255,255,0.08)",
              }}
              label={{
                value: "Annual Income (k$)",
                position: "insideBottom",
                offset: -8,
                fill: "#64748b",
                fontSize: 11,
              }}
            />

            <YAxis
              type="number"
              dataKey="spending"
              name="Spending Score"
              domain={[0, 100]}
              tick={{
                fill: "#64748b",
                fontSize: 11,
              }}
              tickLine={false}
              axisLine={{
                stroke: "rgba(255,255,255,0.08)",
              }}
              label={{
                value: "Spending Score",
                angle: -90,
                position: "insideLeft",
                fill: "#64748b",
                fontSize: 11,
              }}
            />

            <Tooltip
              cursor={{
                stroke: "rgba(129,140,248,0.25)",
                strokeWidth: 1,
              }}
              content={<CustomerTooltip />}
            />

            {clusters.map((cluster) => {
              const clusterData = points.filter(
                (point) => point.cluster === cluster,
              )

              return (
                <Scatter
                  key={cluster}
                  name={`Cluster ${cluster}`}
                  data={clusterData}
                  fill={getClusterColor(cluster)}
                  fillOpacity={0.8}
                  line={{
                    stroke: getClusterColor(cluster),
                  }}
                  shape="circle"
                  animationDuration={700}
                  animationBegin={cluster * 100}
                />
              )
            })}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-white/[0.05] pt-4">
        {clusters.map((cluster) => {
          const count = points.filter(
            (point) => point.cluster === cluster,
          ).length

          return (
            <div
              key={cluster}
              className="flex items-center gap-2"
            >
              <span
                className="size-2.5 rounded-full"
                style={{
                  backgroundColor: getClusterColor(cluster),
                  boxShadow: `0 0 8px ${getClusterColor(cluster)}66`,
                }}
              />

              <span className="text-xs text-slate-500">
                Cluster {cluster}
              </span>

              <span className="text-[10px] text-slate-700">
                {count}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}