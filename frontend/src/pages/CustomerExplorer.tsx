import {
  CheckCircle2,
  Filter,
  GitCompareArrows,
  Search,
  UserRound,
  X,
} from "lucide-react"
import { useMemo, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import type { CustomerLensData } from "@/data/customerlens"

type CustomerExplorerProps = {
  data: CustomerLensData
}

type CustomerRecord = Record<string, unknown>

function getString(
  row: CustomerRecord,
  key: string,
): string {
  return String(row[key] ?? "")
}

function getNumber(
  row: CustomerRecord,
  key: string,
): number {
  const value = Number(row[key] ?? 0)

  return Number.isFinite(value) ? value : 0
}

function getClusterColor(cluster: number): string {
  const colors = [
    "#818cf8",
    "#22d3ee",
    "#34d399",
    "#f59e0b",
    "#f472b6",
  ]

  return colors[cluster % colors.length]
}

function getAgreement(
  customer: CustomerRecord,
): boolean {
  return (
    getNumber(customer, "KMeans_Cluster") ===
    getNumber(customer, "KMedoids_Cluster")
  )
}

export function CustomerExplorer({
  data,
}: CustomerExplorerProps) {
  const customers =
    data.customers as CustomerRecord[]

  const [search, setSearch] = useState("")
  const [gender, setGender] = useState("All")
  const [cluster, setCluster] = useState("All")
  const [segment, setSegment] = useState("All")
  const [selectedId, setSelectedId] = useState<number | null>(
    customers.length > 0
      ? getNumber(customers[0], "CustomerID")
      : null,
  )

  /* =========================================================
     Filter Options
     ========================================================= */

  const genders = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          customers
            .map((customer) =>
              getString(customer, "Gender"),
            )
            .filter(Boolean),
        ),
      ),
    ]
  }, [customers])

  const clusters = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          customers
            .map((customer) =>
              getNumber(customer, "KMeans_Cluster"),
            ),
        ),
      ).sort((a, b) => Number(a) - Number(b)),
    ].map(String)
  }, [customers])

  const segments = useMemo(() => {
    return [
      "All",
      ...Array.from(
        new Set(
          customers
            .map((customer) =>
              getString(customer, "KMeans_Segment"),
            )
            .filter(Boolean),
        ),
      ),
    ]
  }, [customers])

  /* =========================================================
     Filter Customers
     ========================================================= */

  const filteredCustomers = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase()

    return customers.filter((customer) => {
      const customerId = getString(
        customer,
        "CustomerID",
      )

      const customerGender = getString(
        customer,
        "Gender",
      )

      const customerCluster = getString(
        customer,
        "KMeans_Cluster",
      )

      const customerSegment = getString(
        customer,
        "KMeans_Segment",
      )

      const matchesSearch =
        !normalizedSearch ||
        customerId
          .toLowerCase()
          .includes(normalizedSearch) ||
        customerGender
          .toLowerCase()
          .includes(normalizedSearch) ||
        customerSegment
          .toLowerCase()
          .includes(normalizedSearch)

      const matchesGender =
        gender === "All" ||
        customerGender === gender

      const matchesCluster =
        cluster === "All" ||
        customerCluster === cluster

      const matchesSegment =
        segment === "All" ||
        customerSegment === segment

      return (
        matchesSearch &&
        matchesGender &&
        matchesCluster &&
        matchesSegment
      )
    })
  }, [
    customers,
    search,
    gender,
    cluster,
    segment,
  ])

  /* =========================================================
     Selected Customer
     ========================================================= */

  const selectedCustomer = useMemo(() => {
    if (selectedId === null) {
      return filteredCustomers[0] ?? null
    }

    return (
      customers.find(
        (customer) =>
          getNumber(customer, "CustomerID") ===
          selectedId,
      ) ??
      filteredCustomers[0] ??
      null
    )
  }, [
    customers,
    filteredCustomers,
    selectedId,
  ])

  /* =========================================================
     Dataset Ranges
     ========================================================= */

  const incomeValues = customers.map((customer) =>
    getNumber(customer, "Annual Income (k$)"),
  )

  const spendingValues = customers.map((customer) =>
    getNumber(
      customer,
      "Spending Score (1-100)",
    ),
  )

  const minIncome = Math.min(...incomeValues)
  const maxIncome = Math.max(...incomeValues)

  const minSpending = Math.min(...spendingValues)
  const maxSpending = Math.max(...spendingValues)

  /* =========================================================
     Selection Helpers
     ========================================================= */

  function selectCustomer(customer: CustomerRecord) {
    setSelectedId(
      getNumber(customer, "CustomerID"),
    )
  }

  function clearFilters() {
    setSearch("")
    setGender("All")
    setCluster("All")
    setSegment("All")
  }

  const hasFilters =
    search.trim() !== "" ||
    gender !== "All" ||
    cluster !== "All" ||
    segment !== "All"

  /* =========================================================
     Selected Customer Metrics
     ========================================================= */

  const selectedIncome = selectedCustomer
    ? getNumber(
        selectedCustomer,
        "Annual Income (k$)",
      )
    : 0

  const selectedSpending = selectedCustomer
    ? getNumber(
        selectedCustomer,
        "Spending Score (1-100)",
      )
    : 0

  const incomeRange =
    maxIncome - minIncome || 1

  const spendingRange =
    maxSpending - minSpending || 1

  const incomePosition =
    ((selectedIncome - minIncome) /
      incomeRange) *
    100

  const spendingPosition =
    ((selectedSpending - minSpending) /
      spendingRange) *
    100

  /* =========================================================
     Render
     ========================================================= */

  return (
    <div className="space-y-6">
      {/* Header */}
      <section>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
              >
                Customer Analytics
              </Badge>

              <span className="text-xs text-slate-600">
                {data.meta.customer_count} customers
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Customer Explorer
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400 sm:text-base">
              Explore individual customer records and inspect
              their K-Means and K-Medoids cluster assignments.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-cyan-400/15 bg-cyan-400/5 px-4 py-3">
            <UserRound className="h-5 w-5 text-cyan-400" />

            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">
                Filtered customers
              </p>

              <p className="text-xl font-semibold text-white">
                {filteredCustomers.length}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <Card className="border-white/10 bg-white/[0.025] shadow-none">
        <CardContent className="p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-indigo-400" />

              <p className="text-sm font-medium text-slate-200">
                Explore customers
              </p>
            </div>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="w-fit text-slate-400 hover:text-white"
              >
                <X className="mr-1.5 h-4 w-4" />
                Clear filters
              </Button>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

              <Input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search ID, gender, segment..."
                className="border-white/10 bg-white/[0.025] pl-9 text-slate-200 placeholder:text-slate-600"
              />
            </div>

            {/* Gender */}
            <select
              value={gender}
              onChange={(event) =>
                setGender(event.target.value)
              }
              className="h-9 rounded-md border border-white/10 bg-[#080d1b] px-3 text-sm text-slate-300 outline-none transition focus:border-indigo-500/50"
            >
              {genders.map((option) => (
                <option
                  key={option}
                  value={option}
                >
                  Gender: {option}
                </option>
              ))}
            </select>

            {/* Cluster */}
            <select
              value={cluster}
              onChange={(event) =>
                setCluster(event.target.value)
              }
              className="h-9 rounded-md border border-white/10 bg-[#080d1b] px-3 text-sm text-slate-300 outline-none transition focus:border-indigo-500/50"
            >
              {clusters.map((option) => (
                <option
                  key={option}
                  value={option}
                >
                  K-Means Cluster: {option}
                </option>
              ))}
            </select>

            {/* Segment */}
            <select
              value={segment}
              onChange={(event) =>
                setSegment(event.target.value)
              }
              className="h-9 rounded-md border border-white/10 bg-[#080d1b] px-3 text-sm text-slate-300 outline-none transition focus:border-indigo-500/50"
            >
              {segments.map((option) => (
                <option
                  key={option}
                  value={option}
                >
                  Segment: {option}
                </option>
              ))}
            </select>
          </div>

          <p className="mt-3 text-xs text-slate-600">
            Showing {filteredCustomers.length} of{" "}
            {customers.length} customers.
          </p>
        </CardContent>
      </Card>

      {/* Main Explorer */}
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        {/* Customer List */}
        <Card className="border-white/10 bg-white/[0.025] shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-100">
              Customer Records
            </CardTitle>

            <p className="text-sm leading-6 text-slate-500">
              Select a customer to inspect their segmentation
              profile.
            </p>
          </CardHeader>

          <CardContent>
            <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
              {filteredCustomers.length === 0 ? (
                <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
                  <Search className="mx-auto h-6 w-6 text-slate-600" />

                  <p className="mt-3 text-sm font-medium text-slate-300">
                    No customers found
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    Try changing the search or filters.
                  </p>
                </div>
              ) : (
                filteredCustomers.map((customer) => {
                  const id = getNumber(
                    customer,
                    "CustomerID",
                  )

                  const customerCluster =
                    getNumber(
                      customer,
                      "KMeans_Cluster",
                    )

                  const isSelected =
                    id === selectedId

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() =>
                        selectCustomer(customer)
                      }
                      className={[
                        "w-full rounded-xl border p-3 text-left transition",
                        isSelected
                          ? "border-indigo-400/30 bg-indigo-500/[0.08]"
                          : "border-white/5 bg-white/[0.015] hover:border-white/10 hover:bg-white/[0.03]",
                      ].join(" ")}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-semibold"
                          style={{
                            backgroundColor: `${getClusterColor(
                              customerCluster,
                            )}18`,
                            color:
                              getClusterColor(
                                customerCluster,
                              ),
                          }}
                        >
                          {id}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-slate-200">
                              Customer #{id}
                            </p>

                            <span className="text-xs text-slate-600">
                              Cluster{" "}
                              {customerCluster}
                            </span>
                          </div>

                          <p className="mt-1 truncate text-xs text-slate-500">
                            {getString(
                              customer,
                              "Gender",
                            )}{" "}
                            · Age{" "}
                            {getNumber(
                              customer,
                              "Age",
                            )}{" "}
                            ·{" "}
                            {getString(
                              customer,
                              "KMeans_Segment",
                            )}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Selected Customer */}
        <Card className="border-white/10 bg-white/[0.025] shadow-none">
          {selectedCustomer ? (
            <>
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
                        <UserRound className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-[0.14em] text-slate-600">
                          Selected Customer
                        </p>

                        <CardTitle className="text-xl text-white">
                          Customer #
                          {getNumber(
                            selectedCustomer,
                            "CustomerID",
                          )}
                        </CardTitle>
                      </div>
                    </div>

                    <p className="text-sm text-slate-500">
                      Individual segmentation profile
                    </p>
                  </div>

                  {getAgreement(
                    selectedCustomer,
                  ) ? (
                    <Badge className="border-emerald-400/20 bg-emerald-400/10 text-emerald-300">
                      <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
                      Algorithms agree
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="border-amber-400/20 bg-amber-400/10 text-amber-300"
                    >
                      Assignment differs
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Demographics */}
                <div>
                  <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-slate-600">
                    Customer Profile
                  </p>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                      <p className="text-xs text-slate-600">
                        Gender
                      </p>

                      <p className="mt-1 font-semibold text-slate-200">
                        {getString(
                          selectedCustomer,
                          "Gender",
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                      <p className="text-xs text-slate-600">
                        Age
                      </p>

                      <p className="mt-1 font-semibold text-slate-200">
                        {getNumber(
                          selectedCustomer,
                          "Age",
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                      <p className="text-xs text-slate-600">
                        Customer ID
                      </p>

                      <p className="mt-1 font-semibold text-slate-200">
                        {getNumber(
                          selectedCustomer,
                          "CustomerID",
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Financial / behavior metrics */}
                <div>
                  <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-slate-600">
                    Clustering Features
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-indigo-400/10 bg-indigo-400/[0.03] p-4">
                      <p className="text-xs text-slate-500">
                        Annual Income
                      </p>

                      <p className="mt-1 text-2xl font-semibold text-indigo-300">
                        {selectedIncome.toFixed(0)}
                        <span className="ml-1 text-sm font-normal text-slate-600">
                          k$
                        </span>
                      </p>
                    </div>

                    <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/[0.03] p-4">
                      <p className="text-xs text-slate-500">
                        Spending Score
                      </p>

                      <p className="mt-1 text-2xl font-semibold text-cyan-300">
                        {selectedSpending.toFixed(0)}
                        <span className="ml-1 text-sm font-normal text-slate-600">
                          / 100
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Relative position */}
                <div>
                  <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-slate-600">
                    Relative Dataset Position
                  </p>

                  <div className="space-y-4">
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm text-slate-400">
                          Income position
                        </span>

                        <span className="text-xs text-slate-600">
                          {incomePosition.toFixed(0)}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-900">
                        <div
                          className="h-full rounded-full bg-indigo-400 transition-all"
                          style={{
                            width: `${Math.min(
                              Math.max(
                                incomePosition,
                                0,
                              ),
                              100,
                            )}%`,
                          }}
                        />
                      </div>

                      <div className="mt-1 flex justify-between text-[10px] text-slate-700">
                        <span>
                          {minIncome}k$
                        </span>

                        <span>
                          {maxIncome}k$
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm text-slate-400">
                          Spending position
                        </span>

                        <span className="text-xs text-slate-600">
                          {spendingPosition.toFixed(0)}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-900">
                        <div
                          className="h-full rounded-full bg-cyan-400 transition-all"
                          style={{
                            width: `${Math.min(
                              Math.max(
                                spendingPosition,
                                0,
                              ),
                              100,
                            )}%`,
                          }}
                        />
                      </div>

                      <div className="mt-1 flex justify-between text-[10px] text-slate-700">
                        <span>
                          {minSpending}
                        </span>

                        <span>
                          {maxSpending}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Algorithm assignments */}
                <div>
                  <p className="mb-3 text-xs font-medium uppercase tracking-[0.14em] text-slate-600">
                    Cluster Assignments
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-indigo-400/15 bg-indigo-400/[0.035] p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-300">
                          K-Means
                        </p>

                        <span
                          className="size-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              getClusterColor(
                                getNumber(
                                  selectedCustomer,
                                  "KMeans_Cluster",
                                ),
                              ),
                          }}
                        />
                      </div>

                      <p className="mt-3 text-2xl font-semibold text-indigo-300">
                        Cluster{" "}
                        {getNumber(
                          selectedCustomer,
                          "KMeans_Cluster",
                        )}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {getString(
                          selectedCustomer,
                          "KMeans_Segment",
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl border border-cyan-400/15 bg-cyan-400/[0.035] p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-300">
                          K-Medoids
                        </p>

                        <span
                          className="size-2.5 rounded-full"
                          style={{
                            backgroundColor:
                              getClusterColor(
                                getNumber(
                                  selectedCustomer,
                                  "KMedoids_Cluster",
                                ),
                              ),
                          }}
                        />
                      </div>

                      <p className="mt-3 text-2xl font-semibold text-cyan-300">
                        Cluster{" "}
                        {getNumber(
                          selectedCustomer,
                          "KMedoids_Cluster",
                        )}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {getString(
                          selectedCustomer,
                          "KMedoids_Segment",
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Agreement */}
                <div
                  className={
                    getAgreement(selectedCustomer)
                      ? "rounded-xl border border-emerald-400/15 bg-emerald-400/[0.035] p-4"
                      : "rounded-xl border border-amber-400/15 bg-amber-400/[0.035] p-4"
                  }
                >
                  <div className="flex gap-3">
                    {getAgreement(
                      selectedCustomer,
                    ) ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                    ) : (
                      <GitCompareArrows className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                    )}

                    <div>
                      <p
                        className={
                          getAgreement(
                            selectedCustomer,
                          )
                            ? "font-medium text-emerald-300"
                            : "font-medium text-amber-300"
                        }
                      >
                        {getAgreement(
                          selectedCustomer,
                        )
                          ? "Both algorithms assign this customer to the same cluster."
                          : "The two algorithms assign this customer differently."}
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        This comparison describes clustering
                        agreement. It is not a prediction of
                        future customer behavior.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Segment */}
                <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-600">
                    Analytical Segment
                  </p>

                  <p className="mt-2 text-lg font-semibold text-white">
                    {getString(
                      selectedCustomer,
                      "KMeans_Segment",
                    )}
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-500">
                    This label is a descriptive interpretation
                    of the customer's observed clustering
                    characteristics and is not ground truth.
                  </p>
                </div>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex min-h-[500px] flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300">
                <UserRound className="h-6 w-6" />
              </div>

              <p className="mt-4 font-medium text-slate-300">
                Select a customer
              </p>

              <p className="mt-1 max-w-sm text-sm text-slate-600">
                Choose a customer from the records list to
                inspect their clustering profile.
              </p>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Methodology note */}
      <Card className="border-amber-400/15 bg-amber-400/[0.035] shadow-none">
        <CardContent className="p-5 sm:p-6">
          <div className="flex gap-4">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-amber-300">
              <GitCompareArrows className="h-4 w-4" />
            </div>

            <div>
              <h3 className="font-semibold text-slate-100">
                Important interpretation note
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                CustomerLens performs unsupervised customer
                segmentation. The cluster assignments shown here
                describe the grouping produced by the selected
                algorithms using Annual Income and Spending Score.
                They should not be interpreted as supervised
                predictions or guaranteed future behavior.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}