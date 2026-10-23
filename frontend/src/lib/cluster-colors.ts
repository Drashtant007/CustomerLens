export const CLUSTER_COLORS = [
  "#818cf8",
  "#22d3ee",
  "#34d399",
  "#fbbf24",
  "#f472b6",
]

export function getClusterColor(cluster: number) {
  return CLUSTER_COLORS[cluster % CLUSTER_COLORS.length]
}