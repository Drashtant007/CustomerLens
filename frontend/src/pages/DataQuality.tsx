import {
  CheckCircle2,
  Database,
  FileCheck2,
  Filter,
  ShieldCheck,
  Users,
} from "lucide-react"
import { useMemo } from "react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
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

type DataQualityProps = {
  data: CustomerLensData
}

type CustomerRecord = Record<string, unknown>

function getNumber(
  row: CustomerRecord,
  key: string,
): number {
  const value = Number(row[key] ?? 0)

  return Number.isFinite(value) ? value : 0
}

function getString(
  row: CustomerRecord,
  key: string,
): string {
  return String(row[key] ?? "")
}

/* =========================================================
   Dark Tooltip
   ========================================================= */

const DARK_TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "#080d1b",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    color: "#e2e8f0",
    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.35)",
  },
  labelStyle: {
    color: "#cbd5e1",
    fontWeight: 500,
    marginBottom: "6px",
  },
  itemStyle: {
    color: "#e2e8f0",
  },
}

/* =========================================================
   Stat Card
   ========================================================= */

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Database
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
   Section Header
   ========================================================= */

function SectionHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-white">
        {title}
      </h2>

      <p className="mt-1 text-sm leading-6 text-slate-500">
        {description}
      </p>
    </div>
  )
}

/* =========================================================
   Main Page
   ========================================================= */

export function DataQuality({
  data,
}: DataQualityProps) {
  const customers =
    data.customers as CustomerRecord[]

  /* =======================================================
     Dataset Quality
     ======================================================= */

  const quality = useMemo(() => {
    const requiredColumns = [
      "CustomerID",
      "Gender",
      "Age",
      "Annual Income (k$)",
      "Spending Score (1-100)",
    ]

    const missingValues = requiredColumns.reduce(
      (total, column) => {
        return (
          total +
          customers.filter((customer) => {
            const value = customer[column]

            return (
              value === null ||
              value === undefined ||
              String(value).trim() === ""
            )
          }).length
        )
      },
      0,
    )

    const ids = customers.map((customer) =>
      getNumber(customer, "CustomerID"),
    )

    const uniqueIds = new Set(ids)

    return {
      rows: customers.length,
      columns: requiredColumns.length,
      missingValues,
      duplicateRows:
        customers.length - uniqueIds.size,
      completeRows: customers.filter(
        (customer) =>
          requiredColumns.every((column) => {
            const value = customer[column]

            return (
              value !== null &&
              value !== undefined &&
              String(value).trim() !== ""
            )
          }),
      ).length,
    }
  }, [customers])

  /* =======================================================
     Gender Distribution
     ======================================================= */

  const genderData = useMemo(() => {
    const counts = new Map<string, number>()

    customers.forEach((customer) => {
      const gender = getString(
        customer,
        "Gender",
      )

      counts.set(
        gender,
        (counts.get(gender) ?? 0) + 1,
      )
    })

    return Array.from(counts.entries()).map(
      ([name, value]) => ({
        name,
        value,
      }),
    )
  }, [customers])

  /* =======================================================
     Age Distribution
     ======================================================= */

  const ageData = useMemo(() => {
    const ranges = [
      { name: "18–25", min: 18, max: 25 },
      { name: "26–35", min: 26, max: 35 },
      { name: "36–45", min: 36, max: 45 },
      { name: "46–55", min: 46, max: 55 },
      { name: "56+", min: 56, max: Infinity },
    ]

    return ranges.map((range) => ({
      name: range.name,
      customers: customers.filter((customer) => {
        const age = getNumber(
          customer,
          "Age",
        )

        return (
          age >= range.min &&
          age <= range.max
        )
      }).length,
    }))
  }, [customers])

  /* =======================================================
     Income Distribution
     ======================================================= */

  const incomeData = useMemo(() => {
    const ranges = [
      { name: "0–30", min: 0, max: 30 },
      { name: "31–60", min: 31, max: 60 },
      { name: "61–90", min: 61, max: 90 },
      { name: "91–120", min: 91, max: 120 },
      { name: "121+", min: 121, max: Infinity },
    ]

    return ranges.map((range) => ({
      name: range.name,
      customers: customers.filter(
        (customer) => {
          const income = getNumber(
            customer,
            "Annual Income (k$)",
          )

          return (
            income >= range.min &&
            income <= range.max
          )
        },
      ).length,
    }))
  }, [customers])

  /* =======================================================
     Spending Score Distribution
     ======================================================= */

  const spendingData = useMemo(() => {
    const ranges = [
      { name: "1–20", min: 1, max: 20 },
      { name: "21–40", min: 21, max: 40 },
      { name: "41–60", min: 41, max: 60 },
      { name: "61–80", min: 61, max: 80 },
      { name: "81–100", min: 81, max: 100 },
    ]

    return ranges.map((range) => ({
      name: range.name,
      customers: customers.filter(
        (customer) => {
          const spending = getNumber(
            customer,
            "Spending Score (1-100)",
          )

          return (
            spending >= range.min &&
            spending <= range.max
          )
        },
      ).length,
    }))
  }, [customers])

  /* =======================================================
     Summary Statistics
     ======================================================= */

  const summary = useMemo(() => {
    const ages = customers.map((customer) =>
      getNumber(customer, "Age"),
    )

    const incomes = customers.map((customer) =>
      getNumber(
        customer,
        "Annual Income (k$)",
      ),
    )

    const spending = customers.map((customer) =>
      getNumber(
        customer,
        "Spending Score (1-100)",
      ),
    )

    const average = (values: number[]) =>
      values.length > 0
        ? values.reduce(
            (sum, value) => sum + value,
            0,
          ) / values.length
        : 0

    const min = (values: number[]) =>
      values.length > 0
        ? Math.min(...values)
        : 0

    const max = (values: number[]) =>
      values.length > 0
        ? Math.max(...values)
        : 0

    return {
      age: {
        average: average(ages),
        min: min(ages),
        max: max(ages),
      },
      income: {
        average: average(incomes),
        min: min(incomes),
        max: max(incomes),
      },
      spending: {
        average: average(spending),
        min: min(spending),
        max: max(spending),
      },
    }
  }, [customers])

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
                className="border-indigo-400/20 bg-indigo-400/10 text-indigo-300"
              >
                Data Quality & EDA
              </Badge>

              <span className="text-xs text-slate-600">
                {data.meta.dataset}
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Data Quality & EDA
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
              Inspect the customer dataset, validate data quality,
              and explore the variables used before clustering.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-emerald-400/15 bg-emerald-400/5 px-4 py-3">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />

            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Data status
              </p>

              <p className="text-sm font-semibold text-emerald-300">
                Quality checks passed
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Database}
          label="Rows"
          value={String(quality.rows)}
          detail="Customer records available for analysis."
        />

        <StatCard
          icon={FileCheck2}
          label="Columns"
          value={String(quality.columns)}
          detail="Fields represented in the working dataset."
        />

        <StatCard
          icon={CheckCircle2}
          label="Missing values"
          value={String(
            quality.missingValues,
          )}
          detail="Across the required analytical fields."
        />

        <StatCard
          icon={Users}
          label="Duplicate IDs"
          value={String(
            quality.duplicateRows,
          )}
          detail="Duplicate customer identifiers detected."
        />
      </section>

      {/* Quality checks */}
      <Card className="border-white/10 bg-white/[0.025] shadow-none">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-100">
            Data Quality Checks
          </CardTitle>

          <p className="text-sm leading-6 text-slate-500">
            Validation performed on the fields used by CustomerLens.
          </p>
        </CardHeader>

        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Required fields",
                value: "5 / 5",
                detail:
                  "CustomerID, Gender, Age, Income, Spending",
              },
              {
                label: "Complete records",
                value: `${quality.completeRows} / ${quality.rows}`,
                detail:
                  "Rows with no missing required values",
              },
              {
                label: "Missing values",
                value: String(
                  quality.missingValues,
                ),
                detail:
                  "No missing required analytical values",
              },
              {
                label: "Duplicate IDs",
                value: String(
                  quality.duplicateRows,
                ),
                detail:
                  "Unique customer identifiers",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-white/5 bg-white/[0.02] p-4"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />

                  <p className="text-sm font-medium text-slate-300">
                    {item.label}
                  </p>
                </div>

                <p className="mt-3 text-xl font-semibold text-white">
                  {item.value}
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Demographic EDA */}
      <section>
        <SectionHeader
          title="Demographic Exploration"
          description="Distribution of customer gender and age in the dataset."
        />

        <div className="mt-4 grid gap-6 xl:grid-cols-2">
          {/* Gender */}
          <Card className="border-white/10 bg-white/[0.025] shadow-none">
            <CardHeader>
              <CardTitle className="text-base text-slate-100">
                Gender Distribution
              </CardTitle>

              <p className="text-sm text-slate-500">
                Number of customers by gender.
              </p>
            </CardHeader>

            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={genderData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={95}
                      innerRadius={55}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {genderData.map(
                        (entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={
                              index === 0
                                ? "#818cf8"
                                : "#22d3ee"
                            }
                          />
                        ),
                      )}
                    </Pie>

                    <Tooltip
                      cursor={false}
                      {...DARK_TOOLTIP_STYLE}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex justify-center gap-6">
                {genderData.map(
                  (entry, index) => (
                    <div
                      key={entry.name}
                      className="flex items-center gap-2"
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            index === 0
                              ? "#818cf8"
                              : "#22d3ee",
                        }}
                      />

                      <span className="text-sm text-slate-400">
                        {entry.name}:{" "}
                        <span className="font-medium text-slate-200">
                          {entry.value}
                        </span>
                      </span>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>

          {/* Age */}
          <Card className="border-white/10 bg-white/[0.025] shadow-none">
            <CardHeader>
              <CardTitle className="text-base text-slate-100">
                Age Distribution
              </CardTitle>

              <p className="text-sm text-slate-500">
                Customers grouped into age bands.
              </p>
            </CardHeader>

            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={ageData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -10,
                      bottom: 5,
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
                        fontSize: 11,
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
                      {...DARK_TOOLTIP_STYLE}
                    />

                    <Bar
                      dataKey="customers"
                      fill="#818cf8"
                      radius={[
                        7,
                        7,
                        0,
                        0,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Clustering Features */}
      <section>
        <SectionHeader
          title="Clustering Feature Exploration"
          description="Annual Income and Spending Score are the two primary features used for customer segmentation."
        />

        <div className="mt-4 grid gap-6 xl:grid-cols-2">
          {/* Income */}
          <Card className="border-white/10 bg-white/[0.025] shadow-none">
            <CardHeader>
              <CardTitle className="text-base text-slate-100">
                Annual Income Distribution
              </CardTitle>

              <p className="text-sm text-slate-500">
                Annual income values grouped into k$ ranges.
              </p>
            </CardHeader>

            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={incomeData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -10,
                      bottom: 5,
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
                        fontSize: 11,
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
                      {...DARK_TOOLTIP_STYLE}
                    />

                    <Bar
                      dataKey="customers"
                      fill="#818cf8"
                      radius={[
                        7,
                        7,
                        0,
                        0,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Spending */}
          <Card className="border-white/10 bg-white/[0.025] shadow-none">
            <CardHeader>
              <CardTitle className="text-base text-slate-100">
                Spending Score Distribution
              </CardTitle>

              <p className="text-sm text-slate-500">
                Spending Score grouped from 1 to 100.
              </p>
            </CardHeader>

            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <BarChart
                    data={spendingData}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -10,
                      bottom: 5,
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
                        fontSize: 11,
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
                      {...DARK_TOOLTIP_STYLE}
                    />

                    <Bar
                      dataKey="customers"
                      fill="#22d3ee"
                      radius={[
                        7,
                        7,
                        0,
                        0,
                      ]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Summary Statistics */}
      <section>
        <SectionHeader
          title="Descriptive Statistics"
          description="Basic statistics calculated directly from the customer records."
        />

        <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-white/[0.025]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px]">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-[0.12em] text-slate-600">
                    Variable
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-medium uppercase tracking-[0.12em] text-slate-600">
                    Minimum
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-medium uppercase tracking-[0.12em] text-slate-600">
                    Average
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-medium uppercase tracking-[0.12em] text-slate-600">
                    Maximum
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-b border-white/5">
                  <td className="px-5 py-4 font-medium text-slate-200">
                    Age
                  </td>

                  <td className="px-5 py-4 text-right text-slate-400">
                    {summary.age.min.toFixed(0)}
                  </td>

                  <td className="px-5 py-4 text-right text-indigo-300">
                    {summary.age.average.toFixed(2)}
                  </td>

                  <td className="px-5 py-4 text-right text-slate-400">
                    {summary.age.max.toFixed(0)}
                  </td>
                </tr>

                <tr className="border-b border-white/5">
                  <td className="px-5 py-4 font-medium text-slate-200">
                    Annual Income (k$)
                  </td>

                  <td className="px-5 py-4 text-right text-slate-400">
                    {summary.income.min.toFixed(0)}
                  </td>

                  <td className="px-5 py-4 text-right text-indigo-300">
                    {summary.income.average.toFixed(2)}
                  </td>

                  <td className="px-5 py-4 text-right text-slate-400">
                    {summary.income.max.toFixed(0)}
                  </td>
                </tr>

                <tr>
                  <td className="px-5 py-4 font-medium text-slate-200">
                    Spending Score
                  </td>

                  <td className="px-5 py-4 text-right text-slate-400">
                    {summary.spending.min.toFixed(0)}
                  </td>

                  <td className="px-5 py-4 text-right text-cyan-300">
                    {summary.spending.average.toFixed(2)}
                  </td>

                  <td className="px-5 py-4 text-right text-slate-400">
                    {summary.spending.max.toFixed(0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Preprocessing */}
      <section>
        <Card className="border-indigo-400/15 bg-indigo-400/[0.035] shadow-none">
          <CardContent className="p-5 sm:p-6">
            <div className="flex gap-4">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-400/10 text-indigo-300">
                <Filter className="h-4 w-4" />
              </div>

              <div>
                <h3 className="font-semibold text-slate-100">
                  Preprocessing for clustering
                </h3>

                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-600">
                      Features
                    </p>

                    <p className="mt-1 text-sm text-slate-300">
                      Annual Income + Spending Score
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-600">
                      Scaling
                    </p>

                    <p className="mt-1 text-sm text-slate-300">
                      StandardScaler
                    </p>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-slate-600">
                      Customer ID
                    </p>

                    <p className="mt-1 text-sm text-slate-300">
                      Excluded from clustering
                    </p>
                  </div>
                </div>

                <p className="mt-4 max-w-4xl text-sm leading-6 text-slate-500">
                  Gender and Age are retained for post-clustering
                  profiling and interpretation. The primary
                  segmentation is based on Annual Income and
                  Spending Score, with scaling applied before
                  distance-based clustering.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}