export type Customer = {
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

export type AlgorithmComparison = {
  Algorithm: string
  K: number
  Silhouette: number
  "Davies-Bouldin": number
  Objective: number
}

export type KMeansOptimalK = {
  k: number
  inertia: number
  silhouette: number
  davies_bouldin: number
}

export type KMedoidsOptimalK = {
  k: number
  medoid_cost: number
  silhouette: number
  davies_bouldin: number
}

export type ClusterProfile = {
  KMeans_Cluster: number
  Customers: number
  Avg_Age: number
  Median_Age: number
  Avg_Income: number
  Median_Income: number
  Avg_Spending: number
  Median_Spending: number
  Percentage: number
  Segment_Type: string
}

export type BusinessSegment = {
  KMeans_Cluster: number
  KMeans_Segment: string
  Customers: number
  Avg_Age: number
  Avg_Income: number
  Avg_Spending: number
  Percentage: number
}

export type CustomerLensData = {
  meta: {
    project: string
    dataset: string
    customer_count: number
    optimal_k: number
    cluster_features: string[]
    algorithms: string[]
  }

  customers: Customer[]

  algorithm_comparison: AlgorithmComparison[]

  kmeans_optimal_k: KMeansOptimalK[]

  kmedoids_optimal_k: KMedoidsOptimalK[]

  kmeans_profiles: ClusterProfile[]

  kmedoids_profiles: ClusterProfile[]

  business_segments: BusinessSegment[]
}

let cachedData: CustomerLensData | null = null

export async function loadCustomerLensData(): Promise<CustomerLensData> {
  if (cachedData) {
    return cachedData
  }

  const response = await fetch("/data/customerlens.json")

  if (!response.ok) {
    throw new Error(
      `Failed to load CustomerLens data: ${response.status}`,
    )
  }

  const data = (await response.json()) as CustomerLensData

  cachedData = data

  return data
}