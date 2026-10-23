import {
  ArrowUpRight,
  BriefcaseBusiness,
  Lightbulb,
  Users,
  WalletCards,
} from "lucide-react"
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

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CustomerLensData } from "@/data/customerlens"

type BusinessInsightsProps = {
  data: CustomerLensData
}

const SEGMENT_COLORS = [
  "#6366f1",
  "#06b6d4",
  "#f59e0b",
  "#10b981",
  "#ec4899",
]

function getNumber(
  row: Record<string, unknown>,
  key: string,
): number {
  return Number(row[key] ?? 0)
}

function getString(
  row: Record<string, unknown>,
  key: string,
): string {
  return String(row[key] ?? "")
}

function getRecommendation(
  avgIncome: number,
  avgSpending: number,
): string {
  if (avgIncome >= 70 && avgSpending >= 60) {
    return "High-value segment. Prioritize premium offers, loyalty benefits, and personalized retention campaigns."
  }

  if (avgIncome >= 70 && avgSpending < 50) {
    return "Strong purchasing capacity but lower engagement. Use targeted offers and personalized recommendations to increase spending."
  }

  if (avgIncome < 50 && avgSpending >= 60) {
    return "Highly engaged despite lower income. Focus on affordable promotions, bundles, and value-oriented campaigns."
  }

  if (avgIncome < 50 && avgSpending < 50) {
    return "Lower-value segment. Use low-cost engagement campaigns and monitor whether targeted offers improve activity."
  }

  return "Balanced segment. Maintain broad engagement campaigns while testing targeted offers based on customer behavior."
}

export function BusinessInsights({
  data,
}: BusinessInsightsProps) {
  const segments = [...data.business_segments].sort(
    (a, b) =>
      getNumber(b, "Customers") -
      getNumber(a, "Customers"),
  )

  const totalCustomers = data.meta.customer_count

  const totalSegmentCustomers = segments.reduce(
    (sum, segment) =>
      sum + getNumber(segment, "Customers"),
    0,
  )

  const largestSegment = segments[0]

  const highestSpendingSegment = [...segments].sort(
    (a, b) =>
      getNumber(b, "Avg_Spending") -
      getNumber(a, "Avg_Spending"),
  )[0]

  const highestIncomeSegment = [...segments].sort(
    (a, b) =>
      getNumber(b, "Avg_Income") -
      getNumber(a, "Avg_Income"),
  )[0]

  const chartData = segments.map((segment) => ({
    name: getString(segment, "KMeans_Segment"),
    customers: getNumber(segment, "Customers"),
    percentage: getNumber(segment, "Percentage"),
  }))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            Business Intelligence
          </Badge>

          <Badge variant="outline">
            K-Means · K = {data.meta.optimal_k}
          </Badge>
        </div>

        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Business Insights
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
            Translate the discovered customer clusters into
            interpretable business segments and actionable
            marketing strategies.
          </p>
        </div>
      </div>

      {/* Important methodology note */}
      <Card className="border-indigo-500/20 bg-indigo-500/5">
        <CardContent className="flex gap-4 p-5">
          <div className="mt-0.5 rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
            <Lightbulb className="size-5" />
          </div>

          <div className="space-y-1">
            <p className="font-medium">
              How to interpret these segments
            </p>

            <p className="text-sm leading-6 text-muted-foreground">
              Segment names are descriptive analytical labels
              generated from the observed income and spending
              characteristics. They are not ground-truth customer
              categories.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Customers Analyzed
                </p>

                <p className="mt-2 text-3xl font-semibold">
                  {totalCustomers}
                </p>
              </div>

              <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-400">
                <Users className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Segments Found
                </p>

                <p className="mt-2 text-3xl font-semibold">
                  {segments.length}
                </p>
              </div>

              <div className="rounded-xl bg-cyan-500/10 p-2.5 text-cyan-400">
                <BriefcaseBusiness className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">
                  Largest Segment
                </p>

                <p className="mt-2 truncate text-lg font-semibold">
                  {getString(
                    largestSegment,
                    "KMeans_Segment",
                  )}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {getNumber(
                    largestSegment,
                    "Customers",
                  )}{" "}
                  customers ·{" "}
                  {getNumber(
                    largestSegment,
                    "Percentage",
                  ).toFixed(1)}
                  %
                </p>
              </div>

              <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400">
                <ArrowUpRight className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Highest Avg. Spending
                </p>

                <p className="mt-2 text-3xl font-semibold">
                  {getNumber(
                    highestSpendingSegment,
                    "Avg_Spending",
                  ).toFixed(1)}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Spending Score
                </p>
              </div>

              <div className="rounded-xl bg-amber-500/10 p-2.5 text-amber-400">
                <WalletCards className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segment distribution */}
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Customer Segment Distribution</CardTitle>

            <p className="text-sm text-muted-foreground">
              Number of customers discovered in each K-Means
              business segment.
            </p>
          </CardHeader>

          <CardContent>
            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{
                    top: 10,
                    right: 20,
                    left: 20,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    className="stroke-border/50"
                  />

                  <XAxis
                    type="number"
                    allowDecimals={false}
                  />

                  <YAxis
                    type="category"
                    dataKey="name"
                    width={155}
                    tick={{
                      fontSize: 11,
                    }}
                  />

                  <Tooltip
  cursor={false}
  contentStyle={{
    backgroundColor: "#080d1b",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    color: "#e2e8f0",
    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.35)",
  }}
  labelStyle={{
    color: "#cbd5e1",
    fontWeight: 500,
    marginBottom: "6px",
  }}
  itemStyle={{
    color: "#e2e8f0",
  }}
/>

                  <Bar
                    dataKey="customers"
                    radius={[0, 6, 6, 0]}
                  >
                    {chartData.map((_, index) => (
                      <Cell
                        key={`segment-${index}`}
                        fill={
                          SEGMENT_COLORS[
                            index % SEGMENT_COLORS.length
                          ]
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Segment Overview</CardTitle>

            <p className="text-sm text-muted-foreground">
              Relative size and behavioral characteristics.
            </p>
          </CardHeader>

          <CardContent className="space-y-3">
            {segments.map((segment, index) => {
              const customers = getNumber(
                segment,
                "Customers",
              )

              const percentage = getNumber(
                segment,
                "Percentage",
              )

              return (
                <div
                  key={`${getString(
                    segment,
                    "KMeans_Cluster",
                  )}-${index}`}
                  className="rounded-xl border border-border/60 bg-muted/20 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              SEGMENT_COLORS[
                                index %
                                  SEGMENT_COLORS.length
                              ],
                          }}
                        />

                        <p className="truncate text-sm font-medium">
                          {getString(
                            segment,
                            "KMeans_Segment",
                          )}
                        </p>
                      </div>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Cluster{" "}
                        {getNumber(
                          segment,
                          "KMeans_Cluster",
                        )}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold">
                        {customers}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        {percentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(
                          percentage,
                          100,
                        )}%`,
                        backgroundColor:
                          SEGMENT_COLORS[
                            index %
                              SEGMENT_COLORS.length
                          ],
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Detailed segment cards */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">
            Segment Profiles & Recommendations
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Business interpretation derived from the cluster
            statistics.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {segments.map((segment, index) => {
            const avgIncome = getNumber(
              segment,
              "Avg_Income",
            )

            const avgSpending = getNumber(
              segment,
              "Avg_Spending",
            )

            const avgAge = getNumber(
              segment,
              "Avg_Age",
            )

            const customers = getNumber(
              segment,
              "Customers",
            )

            const percentage = getNumber(
              segment,
              "Percentage",
            )

            return (
              <Card
                key={`profile-${getNumber(
                  segment,
                  "KMeans_Cluster",
                )}`}
                className="overflow-hidden"
              >
                <div
                  className="h-1"
                  style={{
                    backgroundColor:
                      SEGMENT_COLORS[
                        index % SEGMENT_COLORS.length
                      ],
                  }}
                />

                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <Badge variant="outline">
                          Cluster{" "}
                          {getNumber(
                            segment,
                            "KMeans_Cluster",
                          )}
                        </Badge>

                        <Badge variant="secondary">
                          {percentage.toFixed(1)}% of customers
                        </Badge>
                      </div>

                      <CardTitle className="text-lg">
                        {getString(
                          segment,
                          "KMeans_Segment",
                        )}
                      </CardTitle>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-semibold">
                        {customers}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        customers
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">
                        Avg. Age
                      </p>

                      <p className="mt-1 text-lg font-semibold">
                        {avgAge.toFixed(1)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">
                        Avg. Income
                      </p>

                      <p className="mt-1 text-lg font-semibold">
                        {avgIncome.toFixed(1)}
                      </p>

                      <p className="text-[10px] text-muted-foreground">
                        k$
                      </p>
                    </div>

                    <div className="rounded-xl bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground">
                        Avg. Spending
                      </p>

                      <p className="mt-1 text-lg font-semibold">
                        {avgSpending.toFixed(1)}
                      </p>

                      <p className="text-[10px] text-muted-foreground">
                        score
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                    <div className="flex gap-3">
                      <div className="mt-0.5 rounded-lg bg-indigo-500/10 p-2 text-indigo-400">
                        <Lightbulb className="size-4" />
                      </div>

                      <div>
                        <p className="text-sm font-medium">
                          Recommended Strategy
                        </p>

                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {getRecommendation(
                            avgIncome,
                            avgSpending,
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Data integrity note */}
      <Card className="border-border/60">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-muted p-2">
              <BriefcaseBusiness className="size-4" />
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium">
                Analytical interpretation
              </p>

              <p className="text-sm leading-6 text-muted-foreground">
                These recommendations are derived from the
                observed cluster characteristics in the
                CustomerLens dataset. They should be treated as
                decision-support insights rather than predictions
                of individual customer behavior.
              </p>

              <p className="text-xs text-muted-foreground">
                Segment coverage:{" "}
                {totalSegmentCustomers} /{" "}
                {totalCustomers} customers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground">
        Highest average income segment:{" "}
        <span className="font-medium text-foreground">
          {getString(
            highestIncomeSegment,
            "KMeans_Segment",
          )}
        </span>
      </div>
    </div>
  )
}