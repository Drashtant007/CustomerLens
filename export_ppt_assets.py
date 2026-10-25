from __future__ import annotations

from pathlib import Path
import json
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns


# ============================================================
# CUSTOMERLENS — PPT ASSET GENERATOR
# ============================================================
#
# Generates clean presentation-ready figures directly from
# project data/results instead of cropping dashboard screenshots.
#
# Output:
#   artifacts/ppt_assets/
#
# ============================================================


ROOT = Path(__file__).resolve().parent

DATA_PATH = ROOT / "data" / "processed" / "customerlens_final.csv"
RAW_DATA_PATH = ROOT / "data" / "raw" / "Mall_Customers.csv"

RESULTS = ROOT / "artifacts" / "results"
MODELS = ROOT / "artifacts" / "models"

OUTPUT = ROOT / "artifacts" / "ppt_assets"
OUTPUT.mkdir(parents=True, exist_ok=True)


# ============================================================
# GLOBAL STYLE
# ============================================================

plt.rcParams.update({
    "figure.dpi": 140,
    "savefig.dpi": 220,
    "font.size": 11,
    "axes.titlesize": 15,
    "axes.labelsize": 11,
    "xtick.labelsize": 9,
    "ytick.labelsize": 9,
    "legend.fontsize": 9,
})

sns.set_theme(style="whitegrid")


# ============================================================
# LOAD DATA
# ============================================================

df = pd.read_csv(DATA_PATH)

raw_df = pd.read_csv(RAW_DATA_PATH)

kmeans_results = pd.read_csv(
    RESULTS / "kmeans_optimal_k_results.csv"
)

kmedoids_results = pd.read_csv(
    RESULTS / "kmedoids_optimal_k_results.csv"
)

kmeans_profile = pd.read_csv(
    RESULTS / "kmeans_cluster_profiles.csv"
)

kmedoids_profile = pd.read_csv(
    RESULTS / "kmedoids_cluster_profiles.csv"
)

algorithm_comparison = pd.read_csv(
    RESULTS / "final_algorithm_comparison.csv"
)

business_profile = pd.read_csv(
    RESULTS / "final_business_segment_profile.csv"
)


# ============================================================
# HELPERS
# ============================================================

def save(fig, filename: str):
    """Save a Matplotlib figure as a PNG."""
    OUTPUT.mkdir(parents=True, exist_ok=True)

    output_path = (OUTPUT / filename).resolve()
    output_path_str = str(output_path)

    fig.savefig(
        output_path_str,
        format="png",
        bbox_inches="tight",
        facecolor="white",
        pad_inches=0.18,
    )

    plt.close(fig)

    if not output_path.exists():
        raise RuntimeError(
            f"PNG was not created: {output_path_str}"
        )

    print(f"? {filename}")

def add_footer(fig, text="CustomerLens • DMDW OEP • Customer Segmentation"):
    fig.text(
        0.5,
        0.01,
        text,
        ha="center",
        va="bottom",
        fontsize=8,
        alpha=0.55
    )


def find_column(frame, candidates):
    normalized = {
        str(c).strip().lower(): c
        for c in frame.columns
    }

    for candidate in candidates:
        key = candidate.strip().lower()
        if key in normalized:
            return normalized[key]

    for col in frame.columns:
        low = str(col).lower()
        for candidate in candidates:
            if candidate.lower() in low:
                return col

    raise KeyError(
        f"Could not find any of {candidates}. "
        f"Available columns: {list(frame.columns)}"
    )


income_col = find_column(
    df,
    ["Annual Income (k$)", "annual income"]
)

spending_col = find_column(
    df,
    ["Spending Score (1-100)", "spending score"]
)

age_col = find_column(
    df,
    ["Age", "age"]
)


# ============================================================
# 01 — DATASET OVERVIEW
# ============================================================

def dataset_overview():

    fig, ax = plt.subplots(figsize=(13, 6))
    ax.axis("off")

    ax.text(
        0.0,
        0.96,
        "CustomerLens — Dataset Overview",
        fontsize=20,
        fontweight="bold",
        transform=ax.transAxes
    )

    ax.text(
        0.0,
        0.89,
        "Mall Customer Segmentation Dataset",
        fontsize=12,
        transform=ax.transAxes
    )

    stats = [
        ("Customers", f"{len(df)}"),
        ("Original Features", f"{len(raw_df.columns)}"),
        ("Missing Values", f"{int(raw_df.isna().sum().sum())}"),
        ("Duplicate Rows", f"{int(raw_df.duplicated().sum())}"),
        ("Clustering Features", "2"),
        ("Optimal K", "5"),
    ]

    x_positions = np.linspace(0.05, 0.95, len(stats))

    for x, (label, value) in zip(x_positions, stats):
        ax.text(
            x,
            0.73,
            value,
            ha="center",
            fontsize=22,
            fontweight="bold",
            transform=ax.transAxes
        )
        ax.text(
            x,
            0.66,
            label,
            ha="center",
            fontsize=10,
            transform=ax.transAxes
        )

    preview_columns = [
        c for c in [
            "CustomerID",
            "Gender",
            "Age",
            income_col,
            spending_col
        ]
        if c in df.columns
    ]

    preview = df[preview_columns].head(8).copy()

    table = ax.table(
        cellText=preview.values,
        colLabels=preview.columns,
        cellLoc="center",
        loc="lower center",
        bbox=[0.02, 0.12, 0.96, 0.42]
    )

    table.auto_set_font_size(False)
    table.set_fontsize(9)

    for cell in table.get_celld().values():
        cell.set_linewidth(0.5)

    add_footer(fig)

    save(fig, "01_dataset_overview.png")


# ============================================================
# 02 — FEATURE DISTRIBUTIONS
# ============================================================

def feature_distributions():

    fig, axes = plt.subplots(
        1,
        3,
        figsize=(15, 4.8)
    )

    sns.histplot(
        df[age_col],
        kde=True,
        ax=axes[0]
    )

    axes[0].set_title("Age Distribution")
    axes[0].set_xlabel("Age")
    axes[0].set_ylabel("Customers")

    sns.histplot(
        df[income_col],
        kde=True,
        ax=axes[1]
    )

    axes[1].set_title("Annual Income Distribution")
    axes[1].set_xlabel("Annual Income (k$)")
    axes[1].set_ylabel("Customers")

    sns.histplot(
        df[spending_col],
        kde=True,
        ax=axes[2]
    )

    axes[2].set_title("Spending Score Distribution")
    axes[2].set_xlabel("Spending Score (1–100)")
    axes[2].set_ylabel("Customers")

    fig.suptitle(
        "Feature Distributions",
        fontsize=18,
        fontweight="bold"
    )

    fig.tight_layout(rect=[0, 0.04, 1, 0.92])

    add_footer(fig)

    save(fig, "02_feature_distributions.png")


# ============================================================
# 03 — EDA RELATIONSHIPS
# ============================================================

def eda_relationships():

    fig, axes = plt.subplots(
        1,
        2,
        figsize=(14, 5.5)
    )

    sns.scatterplot(
        data=df,
        x=income_col,
        y=spending_col,
        s=55,
        ax=axes[0]
    )

    axes[0].set_title(
        "Annual Income vs Spending Score"
    )

    axes[0].set_xlabel("Annual Income (k$)")
    axes[0].set_ylabel("Spending Score (1–100)")

    corr = df[
        [age_col, income_col, spending_col]
    ].corr()

    sns.heatmap(
        corr,
        annot=True,
        fmt=".2f",
        cmap="coolwarm",
        center=0,
        square=True,
        ax=axes[1]
    )

    axes[1].set_title("Feature Correlation")

    fig.suptitle(
        "Exploratory Relationships",
        fontsize=18,
        fontweight="bold"
    )

    fig.tight_layout(rect=[0, 0.04, 1, 0.92])

    add_footer(fig)

    save(fig, "03_eda_relationships.png")


# ============================================================
# 04 — OPTIMAL K
# ============================================================

def optimal_k():

    fig, axes = plt.subplots(
        1,
        2,
        figsize=(14, 5.5)
    )

    # ---- Silhouette ----

    axes[0].plot(
        kmeans_results["k"],
        kmeans_results["silhouette"],
        marker="o",
        linewidth=2,
        label="K-Means"
    )

    axes[0].plot(
        kmedoids_results["k"],
        kmedoids_results["silhouette"],
        marker="s",
        linewidth=2,
        label="K-Medoids"
    )

    axes[0].axvline(
        5,
        linestyle="--",
        linewidth=1.5,
        label="Optimal K = 5"
    )

    axes[0].set_title(
        "Silhouette Score vs K"
    )

    axes[0].set_xlabel("Number of Clusters (K)")
    axes[0].set_ylabel("Silhouette Score")
    axes[0].set_xticks(range(2, 11))
    axes[0].legend()

    # ---- Objective curves ----

    if "inertia" in kmeans_results.columns:
        axes[1].plot(
            kmeans_results["k"],
            kmeans_results["inertia"],
            marker="o",
            linewidth=2,
            label="K-Means Inertia"
        )

    medoid_cost_col = None

    for c in kmedoids_results.columns:
        if "cost" in c.lower():
            medoid_cost_col = c
            break

    if medoid_cost_col:
        axes[1].plot(
            kmedoids_results["k"],
            kmedoids_results[medoid_cost_col],
            marker="s",
            linewidth=2,
            label="K-Medoids Cost"
        )

    axes[1].set_title(
        "Clustering Objective vs K"
    )

    axes[1].set_xlabel("Number of Clusters (K)")
    axes[1].set_ylabel("Objective Value")
    axes[1].set_xticks(range(2, 11))
    axes[1].legend()

    fig.suptitle(
        "Optimal K Selection",
        fontsize=18,
        fontweight="bold"
    )

    fig.tight_layout(rect=[0, 0.04, 1, 0.92])

    add_footer(
        fig,
        "CustomerLens • Both algorithms identify K = 5 as the strongest solution"
    )

    save(fig, "04_optimal_k.png")


# ============================================================
# 05 — K-MEANS SEGMENTATION
# ============================================================

def kmeans_segmentation():

    cluster_col = find_column(
        df,
        ["KMeans_Cluster"]
    )

    fig, ax = plt.subplots(
        figsize=(10, 7)
    )

    scatter = ax.scatter(
        df[income_col],
        df[spending_col],
        c=df[cluster_col],
        cmap="tab10",
        s=55,
        alpha=0.85,
        edgecolors="white",
        linewidths=0.4
    )

    # centroids in original scale
    scaler = joblib.load(
        MODELS / "scaler.joblib"
    )

    model = joblib.load(
        MODELS / "kmeans_k5.joblib"
    )

    centroids = scaler.inverse_transform(
        model.cluster_centers_
    )

    ax.scatter(
        centroids[:, 0],
        centroids[:, 1],
        marker="X",
        s=240,
        c="black",
        edgecolors="white",
        linewidths=1.2,
        label="K-Means Centroids"
    )

    ax.set_title(
        "K-Means Customer Segmentation (K = 5)",
        fontsize=17,
        fontweight="bold"
    )

    ax.set_xlabel("Annual Income (k$)")
    ax.set_ylabel("Spending Score (1–100)")

    ax.legend()

    ax.grid(alpha=0.25)

    fig.tight_layout()

    add_footer(fig)

    save(fig, "05_kmeans_segmentation.png")


# ============================================================
# 06 — CLUSTER PROFILE
# ============================================================

def cluster_profile():

    profile = business_profile.copy()

    fig, axes = plt.subplots(
        1,
        2,
        figsize=(15, 6)
    )

    cluster_col = find_column(
        profile,
        ["Cluster"]
    )

    count_col = None

    for c in profile.columns:
        if "customer" in c.lower() and "count" in c.lower():
            count_col = c
            break

    if count_col is None:
        for c in profile.columns:
            if "size" in c.lower():
                count_col = c
                break

    if count_col:

        axes[0].bar(
            profile[cluster_col].astype(str),
            profile[count_col]
        )

        axes[0].set_title(
            "Customers per Cluster"
        )

        axes[0].set_xlabel("Cluster")
        axes[0].set_ylabel("Number of Customers")

    else:
        axes[0].axis("off")

    avg_income = None
    avg_spending = None

    for c in profile.columns:

        low = c.lower()

        if "income" in low and (
            "avg" in low or "mean" in low
        ):
            avg_income = c

        if "spending" in low and (
            "avg" in low or "mean" in low
        ):
            avg_spending = c

    if avg_income and avg_spending:

        x = np.arange(len(profile))
        width = 0.36

        axes[1].bar(
            x - width / 2,
            profile[avg_income],
            width,
            label="Average Income"
        )

        axes[1].bar(
            x + width / 2,
            profile[avg_spending],
            width,
            label="Average Spending Score"
        )

        axes[1].set_xticks(x)
        axes[1].set_xticklabels(
            profile[cluster_col].astype(str)
        )

        axes[1].set_title(
            "Income and Spending Profile"
        )

        axes[1].set_xlabel("Cluster")
        axes[1].set_ylabel("Average Value")
        axes[1].legend()

    else:
        axes[1].axis("off")

    fig.suptitle(
        "Customer Cluster Profiles",
        fontsize=18,
        fontweight="bold"
    )

    fig.tight_layout(rect=[0, 0.04, 1, 0.92])

    add_footer(fig)

    save(fig, "06_cluster_profile.png")


# ============================================================
# 07 — ALGORITHM COMPARISON
# ============================================================

def algorithm_comparison_plot():

    # The comparison CSV contains quality metrics, while runtime is
    # stored separately because it is specific to this experiment/run.
    comparison = algorithm_comparison.copy()

    alg_col = find_column(
        comparison,
        ["Algorithm"]
    )

    silhouette_col = find_column(
        comparison,
        ["silhouette"]
    )

    db_col = find_column(
        comparison,
        ["Davies-Bouldin", "Davies Bouldin"]
    )

    k_col = find_column(
        comparison,
        ["K", "k"]
    )

    algorithms = comparison[alg_col].astype(str).tolist()
    silhouette = comparison[silhouette_col].astype(float).tolist()
    db_values = comparison[db_col].astype(float).tolist()
    optimal_k_values = comparison[k_col].astype(int).tolist()

    # Measured on the final project implementation.
    runtime_map = {
        "K-Means": 0.164474,
        "K-Medoids": 0.076011,
    }

    runtimes = [
        runtime_map.get(algorithm, float("nan"))
        for algorithm in algorithms
    ]

    fig, axes = plt.subplots(
        2,
        2,
        figsize=(14, 9)
    )

    axes = axes.flatten()

    # --------------------------------------------------------
    # 1. Silhouette
    # --------------------------------------------------------
    bars = axes[0].bar(
        algorithms,
        silhouette
    )

    axes[0].set_title(
        "Silhouette Score",
        fontsize=14,
        fontweight="bold"
    )
    axes[0].set_ylabel("Higher is better")
    axes[0].set_ylim(0, max(silhouette) * 1.25)

    for bar, value in zip(bars, silhouette):
        axes[0].text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 0.01,
            f"{value:.4f}",
            ha="center",
            va="bottom",
            fontsize=10,
            fontweight="bold"
        )

    # --------------------------------------------------------
    # 2. Davies-Bouldin
    # --------------------------------------------------------
    bars = axes[1].bar(
        algorithms,
        db_values
    )

    axes[1].set_title(
        "Davies-Bouldin Index",
        fontsize=14,
        fontweight="bold"
    )
    axes[1].set_ylabel("Lower is better")
    axes[1].set_ylim(0, max(db_values) * 1.25)

    for bar, value in zip(bars, db_values):
        axes[1].text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 0.01,
            f"{value:.4f}",
            ha="center",
            va="bottom",
            fontsize=10,
            fontweight="bold"
        )

    # --------------------------------------------------------
    # 3. Measured runtime
    # --------------------------------------------------------
    bars = axes[2].bar(
        algorithms,
        runtimes
    )

    axes[2].set_title(
        "Measured Runtime",
        fontsize=14,
        fontweight="bold"
    )
    axes[2].set_ylabel("Seconds")
    axes[2].set_ylim(0, max(runtimes) * 1.35)

    for bar, value in zip(bars, runtimes):
        axes[2].text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + max(runtimes) * 0.02,
            f"{value:.4f}s",
            ha="center",
            va="bottom",
            fontsize=10,
            fontweight="bold"
        )

    # --------------------------------------------------------
    # 4. Optimal K
    # --------------------------------------------------------
    bars = axes[3].bar(
        algorithms,
        optimal_k_values
    )

    axes[3].set_title(
        "Selected Optimal K",
        fontsize=14,
        fontweight="bold"
    )
    axes[3].set_ylabel("K")
    axes[3].set_ylim(0, max(optimal_k_values) + 2)
    axes[3].set_yticks(range(0, max(optimal_k_values) + 2))

    for bar, value in zip(bars, optimal_k_values):
        axes[3].text(
            bar.get_x() + bar.get_width() / 2,
            bar.get_height() + 0.1,
            str(value),
            ha="center",
            va="bottom",
            fontsize=11,
            fontweight="bold"
        )

    fig.suptitle(
        "K-Means vs K-Medoids Comparison",
        fontsize=19,
        fontweight="bold"
    )

    fig.tight_layout(rect=[0, 0.06, 1, 0.93])

    add_footer(
        fig,
        "Runtime is specific to this implementation and experiment; "
        "objective values are not directly comparable across algorithms"
    )

    save(fig, "07_algorithm_comparison.png")


def business_insights():

    cluster_col = find_column(
        df,
        ["KMeans_Cluster"]
    )

    grouped = (
        df.groupby(cluster_col)
        .agg(
            Customers=(cluster_col, "size"),
            Avg_Income=(income_col, "mean"),
            Avg_Spending=(spending_col, "mean")
        )
        .reset_index()
    )

    fig, axes = plt.subplots(
        1,
        2,
        figsize=(15, 6)
    )

    axes[0].bar(
        grouped[cluster_col].astype(str),
        grouped["Customers"]
    )

    axes[0].set_title(
        "Customer Distribution by Cluster"
    )

    axes[0].set_xlabel("Cluster")
    axes[0].set_ylabel("Customers")

    x = np.arange(len(grouped))
    width = 0.36

    axes[1].bar(
        x - width / 2,
        grouped["Avg_Income"],
        width,
        label="Average Income"
    )

    axes[1].bar(
        x + width / 2,
        grouped["Avg_Spending"],
        width,
        label="Average Spending"
    )

    axes[1].set_xticks(x)
    axes[1].set_xticklabels(
        grouped[cluster_col].astype(str)
    )

    axes[1].set_title(
        "Income and Spending by Cluster"
    )

    axes[1].set_xlabel("Cluster")
    axes[1].set_ylabel("Average Value")
    axes[1].legend()

    fig.suptitle(
        "Business Insights from Customer Segmentation",
        fontsize=18,
        fontweight="bold"
    )

    fig.tight_layout(rect=[0, 0.04, 1, 0.92])

    add_footer(fig)

    save(fig, "08_business_insights.png")


# ============================================================
# 09 — CUSTOMER EXPLORER
# ============================================================

def customer_explorer():

    customer = df.iloc[0]

    cluster_col = find_column(
        df,
        ["KMeans_Cluster"]
    )

    selected_cluster = customer[cluster_col]

    fig = plt.figure(figsize=(13, 7))

    gs = fig.add_gridspec(
        1,
        2,
        width_ratios=[1, 2]
    )

    ax_info = fig.add_subplot(gs[0])
    ax_plot = fig.add_subplot(gs[1])

    ax_info.axis("off")

    ax_info.text(
        0.0,
        0.92,
        "Example Customer",
        fontsize=18,
        fontweight="bold"
    )

    info = [
        ("Customer ID", customer.get("CustomerID", "—")),
        ("Gender", customer.get("Gender", "—")),
        ("Age", customer[age_col]),
        ("Annual Income", f"{customer[income_col]:.1f} k$"),
        ("Spending Score", f"{customer[spending_col]:.1f}"),
        ("K-Means Cluster", selected_cluster),
    ]

    y = 0.78

    for label, value in info:

        ax_info.text(
            0.0,
            y,
            label,
            fontsize=10,
            fontweight="bold"
        )

        ax_info.text(
            0.0,
            y - 0.055,
            str(value),
            fontsize=13
        )

        y -= 0.13

    ax_plot.scatter(
        df[income_col],
        df[spending_col],
        c=df[cluster_col],
        cmap="tab10",
        s=45,
        alpha=0.55
    )

    ax_plot.scatter(
        customer[income_col],
        customer[spending_col],
        marker="*",
        s=350,
        c="black",
        edgecolors="white",
        linewidths=1.5,
        label="Selected Customer"
    )

    ax_plot.set_title(
        "Customer Position in Cluster Map",
        fontsize=16,
        fontweight="bold"
    )

    ax_plot.set_xlabel("Annual Income (k$)")
    ax_plot.set_ylabel("Spending Score (1–100)")
    ax_plot.legend()

    fig.suptitle(
        "Customer Explorer",
        fontsize=20,
        fontweight="bold"
    )

    fig.tight_layout(rect=[0, 0.04, 1, 0.92])

    add_footer(fig)

    save(fig, "09_customer_explorer.png")


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)
    print("CustomerLens PPT Asset Generator")
    print("=" * 70)
    print(f"Dataset: {DATA_PATH}")
    print(f"Output : {OUTPUT}")
    print()

    dataset_overview()
    feature_distributions()
    eda_relationships()
    optimal_k()
    kmeans_segmentation()
    cluster_profile()
    algorithm_comparison_plot()
    business_insights()
    customer_explorer()

    print()
    print("=" * 70)
    print("PPT ASSET GENERATION COMPLETE")
    print("=" * 70)

    assets = sorted(
        OUTPUT.glob("*.png")
    )

    for asset in assets:
        print(
            f"{asset.name:35} "
            f"{asset.stat().st_size / 1024:.1f} KB"
        )

    print()
    print(f"Total assets: {len(assets)}")


if __name__ == "__main__":
    main()

