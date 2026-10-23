from __future__ import annotations

import json
from pathlib import Path

import pandas as pd


ROOT = Path(__file__).resolve().parent
FRONTEND_DATA = ROOT / "frontend" / "public" / "data"

RESULTS = ROOT / "artifacts" / "results"
PROCESSED = ROOT / "data" / "processed"


def read_csv(path: Path):
    if not path.exists():
        print(f"[WARN] Missing: {path}")
        return []

    print(f"[OK] Reading: {path.relative_to(ROOT)}")

    df = pd.read_csv(path)

    # Convert through JSON so NumPy/Pandas scalar types become
    # normal JSON-compatible values.
    return json.loads(df.to_json(orient="records"))


def main():
    FRONTEND_DATA.mkdir(parents=True, exist_ok=True)

    payload = {
        "meta": {
            "project": "CustomerLens",
            "dataset": "Mall Customer Segmentation Data",
            "customer_count": 200,
            "optimal_k": 5,
            "cluster_features": [
                "Annual Income (k$)",
                "Spending Score (1-100)",
            ],
            "algorithms": [
                "K-Means",
                "K-Medoids",
            ],
        },

        "customers": read_csv(
            PROCESSED / "final_customer_segmentation.csv"
        ),

        "algorithm_comparison": read_csv(
            RESULTS / "final_algorithm_comparison.csv"
        ),

        "kmeans_optimal_k": read_csv(
            RESULTS / "kmeans_optimal_k_results.csv"
        ),

        "kmedoids_optimal_k": read_csv(
            RESULTS / "kmedoids_optimal_k_results.csv"
        ),

        "kmeans_profiles": read_csv(
            RESULTS / "kmeans_cluster_profiles.csv"
        ),

        "kmedoids_profiles": read_csv(
            RESULTS / "kmedoids_cluster_profiles.csv"
        ),

        "business_segments": read_csv(
            RESULTS / "final_business_segment_profile.csv"
        ),
    }

    output = FRONTEND_DATA / "customerlens.json"

    output.write_text(
        json.dumps(payload, indent=2),
        encoding="utf-8",
    )

    print()
    print(f"[DONE] Frontend data exported to:")
    print(output)

    print()
    print("Sections:")

    for key, value in payload.items():
        if isinstance(value, list):
            print(f"  {key}: {len(value)} records")
        else:
            print(f"  {key}: metadata")


if __name__ == "__main__":
    main()