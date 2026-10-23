import streamlit as st
import pandas as pd
import numpy as np
import joblib
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path


# ============================================================
# CUSTOMERLENS
# Customer Segmentation Analytics Dashboard
# ============================================================

st.set_page_config(
    page_title="CustomerLens",
    page_icon="🎯",
    layout="wide",
    initial_sidebar_state="expanded"
)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

DATA_PATH = (
    BASE_DIR
    / "data"
    / "processed"
    / "customerlens_final.csv"
)

MODELS_PATH = (
    BASE_DIR
    / "artifacts"
    / "models"
)

RESULTS_PATH = (
    BASE_DIR
    / "artifacts"
    / "results"
)


# ============================================================
# LOAD DATA
# ============================================================

@st.cache_data
def load_data():

    df = pd.read_csv(DATA_PATH)

    return df


# ============================================================
# LOAD MODELS
# ============================================================

@st.cache_resource
def load_models():

    scaler = joblib.load(
        MODELS_PATH / "scaler.joblib"
    )

    kmeans = joblib.load(
        MODELS_PATH / "kmeans_k5.joblib"
    )

    kmedoids = joblib.load(
        MODELS_PATH / "kmedoids_pam_k5.joblib"
    )

    config = joblib.load(
        MODELS_PATH / "feature_config.joblib"
    )

    return scaler, kmeans, kmedoids, config


# ============================================================
# LOAD OPTIMAL-K RESULTS
# ============================================================

@st.cache_data
def load_optimal_k_results():

    kmeans_results = pd.read_csv(
        RESULTS_PATH / "kmeans_optimal_k_results.csv"
    )

    kmedoids_results = pd.read_csv(
        RESULTS_PATH / "kmedoids_optimal_k_results.csv"
    )

    return kmeans_results, kmedoids_results


# ============================================================
# LOAD EVERYTHING
# ============================================================

df = load_data()

scaler, kmeans_model, kmedoids_model, config = load_models()

kmeans_results, kmedoids_results = load_optimal_k_results()

CLUSTER_FEATURES = config["cluster_features"]

OPTIMAL_K = config["optimal_k"]

st.sidebar.info(
    f"""
    **Model Configuration**

    Optimal K: **{OPTIMAL_K}**

    Clustering Features:
    - Annual Income (k$)
    - Spending Score (1-100)

    Scaling:
    StandardScaler
    """
)


# ============================================================
# SIDEBAR
# ============================================================

st.sidebar.title("🎯 CustomerLens")

st.sidebar.caption(
    "Customer Segmentation & Clustering Analytics"
)

st.sidebar.divider()

page = st.sidebar.radio(
    "Navigation",
    [
        "🏠 Overview",
        "📊 Data Quality & EDA",
        "📐 Optimal K",
        "🎯 Cluster Explorer",
        "⚖️ Algorithm Comparison",
        "💡 Business Insights",
        "🔮 Customer Explorer"
    ]
)

# =========================================================
# SIDEBAR PROJECT INFORMATION & DOWNLOADS
# =========================================================

st.sidebar.divider()

st.sidebar.subheader("📦 Project Files")

# ---------------------------------------------------------
# Prepare downloadable datasets
# ---------------------------------------------------------

processed_csv = df.to_csv(index=False).encode("utf-8")

st.sidebar.download_button(
    label="⬇️ Processed Dataset",
    data=processed_csv,
    file_name="customerlens_processed_dataset.csv",
    mime="text/csv",
    use_container_width=True
)

# ---------------------------------------------------------
# K-Means results
# ---------------------------------------------------------

kmeans_download = kmeans_results.to_csv(index=False).encode("utf-8")

st.sidebar.download_button(
    label="⬇️ K-Means K Results",
    data=kmeans_download,
    file_name="kmeans_optimal_k_results.csv",
    mime="text/csv",
    use_container_width=True
)

# ---------------------------------------------------------
# K-Medoids results
# ---------------------------------------------------------

kmedoids_download = kmedoids_results.to_csv(index=False).encode("utf-8")

st.sidebar.download_button(
    label="⬇️ K-Medoids K Results",
    data=kmedoids_download,
    file_name="kmedoids_optimal_k_results.csv",
    mime="text/csv",
    use_container_width=True
)

st.sidebar.divider()

# ---------------------------------------------------------
# Project information
# ---------------------------------------------------------

st.sidebar.caption(
    """
    **CustomerLens**

    Customer Segmentation using:

    • K-Means Clustering  
    • K-Medoids (PAM)  
    • Elbow / Bend-in-Knee Method  
    • Silhouette Analysis  
    • Davies-Bouldin Index  

    **Primary Features**

    Annual Income (k$)  
    Spending Score (1-100)
    """
)


# ============================================================
# HEADER
# ============================================================

st.title("🎯 CustomerLens")

st.caption(
    "Customer Segmentation using K-Means and K-Medoids Clustering"
)

st.divider()


# ============================================================
# OVERVIEW
# ============================================================

if page == "🏠 Overview":

    st.header("Customer Segmentation Overview")

    col1, col2, col3, col4 = st.columns(4)

    with col1:

        st.metric(
            "Total Customers",
            len(df)
        )

    with col2:

        st.metric(
            "Features",
            len(CLUSTER_FEATURES)
        )

    with col3:

        st.metric(
            "Optimal K",
            OPTIMAL_K
        )

    with col4:

        st.metric(
            "Algorithms",
            "2"
        )

    st.subheader("Project Objective")

    st.write(
        """
        CustomerLens identifies meaningful customer segments based on
        Annual Income and Spending Score using two partitioning clustering
        techniques: K-Means and K-Medoids.
        """
    )

    st.subheader("Clustering Features")

    feature_df = pd.DataFrame({
        "Feature": [
            "Annual Income (k$)",
            "Spending Score (1-100)"
        ],
        "Role": [
            "Clustering feature",
            "Clustering feature"
        ]
    })

    st.dataframe(
        feature_df,
        use_container_width=True,
        hide_index=True
    )

    st.subheader("Methodology")

    st.markdown(
        """
        **1. Data preprocessing**  
        Dataset quality was examined for missing values,
        duplicates and statistical characteristics.

        **2. Feature selection**  
        Annual Income and Spending Score were selected for clustering.

        **3. Standardization**  
        Features were standardized using StandardScaler.

        **4. Optimal K selection**  
        K values from 2 to 10 were evaluated.

        **5. Clustering**  
        K-Means and K-Medoids (PAM) were implemented.

        **6. Evaluation**  
        Silhouette Score and Davies-Bouldin Index were used.

        **7. Customer profiling**  
        Resulting clusters were interpreted using income,
        spending and demographic characteristics.
        """
    )


# ============================================================
# DATA QUALITY & EDA
# ============================================================

elif page == "📊 Data Quality & EDA":

    st.header(
        "📊 Data Quality & Exploratory Data Analysis"
    )

    st.write(
        """
        This section examines the quality, structure and statistical
        characteristics of the customer dataset before clustering.
        """
    )

    # --------------------------------------------------------
    # DATASET OVERVIEW
    # --------------------------------------------------------

    st.subheader("Dataset Overview")

    col1, col2, col3, col4 = st.columns(4)

    with col1:

        st.metric(
            "Rows",
            df.shape[0]
        )

    with col2:

        st.metric(
            "Columns",
            df.shape[1]
        )

    with col3:

        st.metric(
            "Missing Values",
            int(df.isnull().sum().sum())
        )

    with col4:

        st.metric(
            "Duplicate Rows",
            int(df.duplicated().sum())
        )

    # --------------------------------------------------------
    # DATA PREVIEW
    # --------------------------------------------------------

    st.subheader("Dataset Preview")

    st.dataframe(
        df.head(10),
        use_container_width=True,
        hide_index=True
    )

    # --------------------------------------------------------
    # DATA TYPES
    # --------------------------------------------------------

    st.subheader("Column Information")

    column_info = pd.DataFrame({
        "Column": df.columns,
        "Data Type": [
            str(dtype)
            for dtype in df.dtypes
        ],
        "Missing Values": [
            int(df[col].isnull().sum())
            for col in df.columns
        ],
        "Unique Values": [
            int(df[col].nunique())
            for col in df.columns
        ]
    })

    st.dataframe(
        column_info,
        use_container_width=True,
        hide_index=True
    )

    # --------------------------------------------------------
    # MISSING VALUES
    # --------------------------------------------------------

    st.subheader("Missing Value Analysis")

    missing_df = pd.DataFrame({
        "Column": df.columns,
        "Missing Count": [
            int(df[col].isnull().sum())
            for col in df.columns
        ]
    })

    if missing_df["Missing Count"].sum() == 0:

        st.success(
            "✓ No missing values were found in the dataset."
        )

    else:

        st.dataframe(
            missing_df,
            use_container_width=True,
            hide_index=True
        )

    # --------------------------------------------------------
    # DUPLICATES
    # --------------------------------------------------------

    st.subheader("Duplicate Record Analysis")

    duplicate_count = int(
        df.duplicated().sum()
    )

    if duplicate_count == 0:

        st.success(
            "✓ No duplicate rows were found."
        )

    else:

        st.warning(
            f"{duplicate_count} duplicate rows were found."
        )

    # --------------------------------------------------------
    # STATISTICAL SUMMARY
    # --------------------------------------------------------

    st.subheader("Statistical Summary")

    numeric_columns = [
        "Age",
        "Annual Income (k$)",
        "Spending Score (1-100)"
    ]

    summary = (
        df[numeric_columns]
        .describe()
        .T
        .round(2)
    )

    st.dataframe(
        summary,
        use_container_width=True
    )

    # --------------------------------------------------------
    # DISTRIBUTIONS
    # --------------------------------------------------------

    st.subheader("Feature Distributions")

    col1, col2 = st.columns(2)

    with col1:

        fig, ax = plt.subplots(
            figsize=(7, 5)
        )

        sns.histplot(
            data=df,
            x="Age",
            kde=True,
            ax=ax
        )

        ax.set_title(
            "Age Distribution"
        )

        ax.set_xlabel(
            "Age"
        )

        ax.set_ylabel(
            "Number of Customers"
        )

        st.pyplot(
            fig,
            use_container_width=True
        )

        plt.close(fig)

    with col2:

        fig, ax = plt.subplots(
            figsize=(7, 5)
        )

        sns.histplot(
            data=df,
            x="Annual Income (k$)",
            kde=True,
            ax=ax
        )

        ax.set_title(
            "Annual Income Distribution"
        )

        ax.set_xlabel(
            "Annual Income (k$)"
        )

        ax.set_ylabel(
            "Number of Customers"
        )

        st.pyplot(
            fig,
            use_container_width=True
        )

        plt.close(fig)

    fig, ax = plt.subplots(
        figsize=(9, 5)
    )

    sns.histplot(
        data=df,
        x="Spending Score (1-100)",
        kde=True,
        ax=ax
    )

    ax.set_title(
        "Spending Score Distribution"
    )

    ax.set_xlabel(
        "Spending Score (1-100)"
    )

    ax.set_ylabel(
        "Number of Customers"
    )

    st.pyplot(
        fig,
        use_container_width=True
    )

    plt.close(fig)

    # --------------------------------------------------------
    # GENDER DISTRIBUTION
    # --------------------------------------------------------

    st.subheader("Gender Distribution")

    gender_counts = (
        df["Gender"]
        .value_counts()
        .reset_index()
    )

    gender_counts.columns = [
        "Gender",
        "Customers"
    ]

    col1, col2 = st.columns(2)

    with col1:

        fig, ax = plt.subplots(
            figsize=(7, 5)
        )

        sns.barplot(
            data=gender_counts,
            x="Gender",
            y="Customers",
            ax=ax
        )

        ax.set_title(
            "Customers by Gender"
        )

        st.pyplot(
            fig,
            use_container_width=True
        )

        plt.close(fig)

    with col2:

        st.dataframe(
            gender_counts,
            use_container_width=True,
            hide_index=True
        )

    # --------------------------------------------------------
    # REQUIRED INCOME VS SPENDING VISUALIZATION
    # --------------------------------------------------------

    st.subheader(
        "Annual Income vs Spending Score"
    )

    st.write(
        """
        This visualization shows the two attributes used as the primary
        clustering features in CustomerLens.
        """
    )

    fig, ax = plt.subplots(
        figsize=(10, 7)
    )

    sns.scatterplot(
        data=df,
        x="Annual Income (k$)",
        y="Spending Score (1-100)",
        s=90,
        ax=ax
    )

    ax.set_title(
        "Annual Income vs Spending Score"
    )

    ax.set_xlabel(
        "Annual Income (k$)"
    )

    ax.set_ylabel(
        "Spending Score (1-100)"
    )

    st.pyplot(
        fig,
        use_container_width=True
    )

    plt.close(fig)

    # --------------------------------------------------------
    # CORRELATION
    # --------------------------------------------------------

    st.subheader(
        "Feature Correlation"
    )

    correlation_columns = [
        "Age",
        "Annual Income (k$)",
        "Spending Score (1-100)"
    ]

    correlation_matrix = (
        df[correlation_columns]
        .corr()
    )

    fig, ax = plt.subplots(
        figsize=(8, 6)
    )

    sns.heatmap(
        correlation_matrix,
        annot=True,
        fmt=".2f",
        cmap="coolwarm",
        ax=ax
    )

    ax.set_title(
        "Correlation Matrix"
    )

    st.pyplot(
        fig,
        use_container_width=True
    )

    plt.close(fig)

    # --------------------------------------------------------
    # OUTLIER VIEW
    # --------------------------------------------------------

    st.subheader(
        "Outlier Inspection"
    )

    fig, ax = plt.subplots(
        figsize=(10, 6)
    )

    sns.boxplot(
        data=df[
            [
                "Age",
                "Annual Income (k$)",
                "Spending Score (1-100)"
            ]
        ],
        ax=ax
    )

    ax.set_title(
        "Distribution and Potential Outliers"
    )

    ax.set_ylabel(
        "Value"
    )

    st.pyplot(
        fig,
        use_container_width=True
    )

    plt.close(fig)

    st.info(
        """
        Outliers were inspected rather than automatically removed.
        Since clustering is intended to discover customer groups,
        unusual observations may contain meaningful segmentation
        information.
        """
    )


# ============================================================
# OPTIMAL K ANALYSIS
# ============================================================

elif page == "📐 Optimal K":

    st.header(
        "📐 Optimal Number of Clusters"
    )

    st.write(
        """
        The optimal number of clusters was determined by evaluating
        multiple values of K from 2 to 10. Elbow analysis was combined
        with Silhouette Score and Davies-Bouldin Index to support the
        final selection.
        """
    )

    # --------------------------------------------------------
    # FINAL DECISION
    # --------------------------------------------------------

    st.success(
        f"🎯 Selected Optimal K = {OPTIMAL_K}"
    )

    st.markdown(
        f"""
        **Why K = {OPTIMAL_K}?**

        The clustering experiments evaluated multiple values of K.
        The final selection is supported by the elbow/cost analysis
        together with Silhouette Score and Davies-Bouldin Index.
        """
    )

    # --------------------------------------------------------
    # K-MEANS RESULTS
    # --------------------------------------------------------

    st.subheader(
        "K-Means Evaluation"
    )

    col1, col2 = st.columns(2)

    with col1:

        fig, ax = plt.subplots(
            figsize=(8, 5)
        )

        ax.plot(
            kmeans_results["k"],
            kmeans_results["inertia"],
            marker="o"
        )

        ax.axvline(
            OPTIMAL_K,
            linestyle="--",
            label=f"Selected K = {OPTIMAL_K}"
        )

        ax.set_title(
            "K-Means Elbow Method"
        )

        ax.set_xlabel(
            "Number of Clusters (K)"
        )

        ax.set_ylabel(
            "Within-Cluster Sum of Squares (Inertia)"
        )

        ax.legend()

        ax.grid(
            alpha=0.25
        )

        st.pyplot(
            fig,
            use_container_width=True
        )

        plt.close(fig)

    with col2:

        fig, ax = plt.subplots(
            figsize=(8, 5)
        )

        ax.plot(
            kmeans_results["k"],
            kmeans_results["silhouette"],
            marker="o"
        )

        ax.axvline(
            OPTIMAL_K,
            linestyle="--",
            label=f"Selected K = {OPTIMAL_K}"
        )

        ax.set_title(
            "K-Means Silhouette Score"
        )

        ax.set_xlabel(
            "Number of Clusters (K)"
        )

        ax.set_ylabel(
            "Silhouette Score"
        )

        ax.legend()

        ax.grid(
            alpha=0.25
        )

        st.pyplot(
            fig,
            use_container_width=True
        )

        plt.close(fig)

    # --------------------------------------------------------
    # K-MEANS DAVIES-BOULDIN
    # --------------------------------------------------------

    fig, ax = plt.subplots(
        figsize=(9, 5)
    )

    ax.plot(
        kmeans_results["k"],
        kmeans_results["davies_bouldin"],
        marker="o"
    )

    ax.axvline(
        OPTIMAL_K,
        linestyle="--",
        label=f"Selected K = {OPTIMAL_K}"
    )

    ax.set_title(
        "K-Means Davies-Bouldin Index"
    )

    ax.set_xlabel(
        "Number of Clusters (K)"
    )

    ax.set_ylabel(
        "Davies-Bouldin Index"
    )

    ax.legend()

    ax.grid(
        alpha=0.25
    )

    st.pyplot(
        fig,
        use_container_width=True
    )

    plt.close(fig)

    # --------------------------------------------------------
    # K-MEDOIDS RESULTS
    # --------------------------------------------------------

    st.subheader(
        "K-Medoids Evaluation"
    )

    col1, col2 = st.columns(2)

    with col1:

        fig, ax = plt.subplots(
            figsize=(8, 5)
        )

        ax.plot(
            kmedoids_results["k"],
            kmedoids_results["medoid_cost"],
            marker="o"
        )

        ax.axvline(
            OPTIMAL_K,
            linestyle="--",
            label=f"Selected K = {OPTIMAL_K}"
        )

        ax.set_title(
            "K-Medoids Cost Curve"
        )

        ax.set_xlabel(
            "Number of Clusters (K)"
        )

        ax.set_ylabel(
            "Medoid Cost"
        )

        ax.legend()

        ax.grid(
            alpha=0.25
        )

        st.pyplot(
            fig,
            use_container_width=True
        )

        plt.close(fig)

    with col2:

        fig, ax = plt.subplots(
            figsize=(8, 5)
        )

        ax.plot(
            kmedoids_results["k"],
            kmedoids_results["silhouette"],
            marker="o"
        )

        ax.axvline(
            OPTIMAL_K,
            linestyle="--",
            label=f"Selected K = {OPTIMAL_K}"
        )

        ax.set_title(
            "K-Medoids Silhouette Score"
        )

        ax.set_xlabel(
            "Number of Clusters (K)"
        )

        ax.set_ylabel(
            "Silhouette Score"
        )

        ax.legend()

        ax.grid(
            alpha=0.25
        )

        st.pyplot(
            fig,
            use_container_width=True
        )

        plt.close(fig)

    # --------------------------------------------------------
    # K-MEDOIDS DAVIES-BOULDIN
    # --------------------------------------------------------

    fig, ax = plt.subplots(
        figsize=(9, 5)
    )

    ax.plot(
        kmedoids_results["k"],
        kmedoids_results["davies_bouldin"],
        marker="o"
    )

    ax.axvline(
        OPTIMAL_K,
        linestyle="--",
        label=f"Selected K = {OPTIMAL_K}"
    )

    ax.set_title(
        "K-Medoids Davies-Bouldin Index"
    )

    ax.set_xlabel(
        "Number of Clusters (K)"
    )

    ax.set_ylabel(
        "Davies-Bouldin Index"
    )

    ax.legend()

    ax.grid(
        alpha=0.25
    )

    st.pyplot(
        fig,
        use_container_width=True
    )

    plt.close(fig)

    # --------------------------------------------------------
    # RESULTS TABLE
    # --------------------------------------------------------

    st.subheader(
        "K-Means Optimal-K Results"
    )

    st.dataframe(
        kmeans_results.round(4),
        use_container_width=True,
        hide_index=True
    )

    st.subheader(
        "K-Medoids Optimal-K Results"
    )

    st.dataframe(
        kmedoids_results.round(4),
        use_container_width=True,
        hide_index=True
    )

    # --------------------------------------------------------
    # INTERPRETATION
    # --------------------------------------------------------

    st.subheader(
        "Interpretation"
    )

    st.info(
        """
        The elbow/cost curves show diminishing improvement as
        additional clusters are introduced.

        Silhouette Score measures how similar a customer is to its
        own cluster compared with other clusters. Higher values are
        generally better.

        Davies-Bouldin Index evaluates cluster compactness and
        separation. Lower values are generally better.

        These measures are used together with the elbow/cost analysis
        to support the final selection of the number of clusters.
        """
    )


# ============================================================
# CLUSTER EXPLORER
# ============================================================

elif page == "🎯 Cluster Explorer":

    st.title("🎯 Cluster Explorer")
    st.markdown(
        "Explore individual customer segments produced by K-Means and "
        "K-Medoids clustering."
    )

    # ---------------------------------------------------------
    # Prepare clustering data
    # ---------------------------------------------------------

    cluster_features = config["cluster_features"]

    X_original = df[cluster_features].copy()
    X_scaled = scaler.transform(X_original)

    # ---------------------------------------------------------
    # K-Means assignments
    # ---------------------------------------------------------

    kmeans_labels = kmeans_model.predict(X_scaled)

    # ---------------------------------------------------------
    # K-Medoids assignments
    # ---------------------------------------------------------

    medoid_points_scaled = np.asarray(
        kmedoids_model["medoid_points_scaled"]
    )

    distances = np.linalg.norm(
        X_scaled[:, np.newaxis, :] -
        medoid_points_scaled[np.newaxis, :, :],
        axis=2
    )

    kmedoids_labels = np.argmin(distances, axis=1)

    # ---------------------------------------------------------
    # Add assignments to working dataframe
    # ---------------------------------------------------------

    explorer_df = df.copy()

    explorer_df["KMeans_Cluster"] = kmeans_labels
    explorer_df["KMedoids_Cluster"] = kmedoids_labels

    # ---------------------------------------------------------
    # Sidebar controls
    # ---------------------------------------------------------

    st.sidebar.markdown("---")
    st.sidebar.subheader("Cluster Explorer Controls")

    algorithm = st.sidebar.radio(
        "Select Algorithm",
        ["K-Means", "K-Medoids"]
    )

    if algorithm == "K-Means":
        cluster_column = "KMeans_Cluster"
        selected_labels = kmeans_labels
        representative_scaled = kmeans_model.cluster_centers_

    else:
        cluster_column = "KMedoids_Cluster"
        selected_labels = kmedoids_labels
        representative_scaled = medoid_points_scaled

    number_of_clusters = len(np.unique(selected_labels))

    selected_cluster = st.sidebar.selectbox(
        "Select Cluster",
        list(range(number_of_clusters))
    )

    # ---------------------------------------------------------
    # Cluster statistics
    # ---------------------------------------------------------

    selected_data = explorer_df[
        explorer_df[cluster_column] == selected_cluster
    ].copy()

    cluster_size = len(selected_data)

    avg_income = selected_data[
        "Annual Income (k$)"
    ].mean()

    avg_spending = selected_data[
        "Spending Score (1-100)"
    ].mean()

    avg_age = selected_data["Age"].mean()

    # ---------------------------------------------------------
    # Metrics
    # ---------------------------------------------------------

    st.subheader(
        f"{algorithm} — Cluster {selected_cluster}"
    )

    col1, col2, col3, col4 = st.columns(4)

    col1.metric(
        "Customers",
        cluster_size
    )

    col2.metric(
        "Avg. Income",
        f"${avg_income:.1f}k"
    )

    col3.metric(
        "Avg. Spending Score",
        f"{avg_spending:.1f}"
    )

    col4.metric(
        "Avg. Age",
        f"{avg_age:.1f}"
    )

    st.markdown("---")

    # ---------------------------------------------------------
    # Main visualization
    # ---------------------------------------------------------

    fig, ax = plt.subplots(figsize=(10, 6))

    sns.scatterplot(
        data=explorer_df,
        x="Annual Income (k$)",
        y="Spending Score (1-100)",
        hue=cluster_column,
        palette="tab10",
        s=80,
        alpha=0.75,
        ax=ax
    )

    # Highlight selected cluster
    ax.scatter(
        selected_data["Annual Income (k$)"],
        selected_data["Spending Score (1-100)"],
        s=180,
        facecolors="none",
        edgecolors="black",
        linewidths=2,
        label=f"Selected Cluster {selected_cluster}"
    )

    # ---------------------------------------------------------
    # Representative point
    # ---------------------------------------------------------

    representative_original = scaler.inverse_transform(
        representative_scaled
    )

    rep_income = representative_original[
        selected_cluster, 0
    ]

    rep_spending = representative_original[
        selected_cluster, 1
    ]

    if algorithm == "K-Means":

        ax.scatter(
            rep_income,
            rep_spending,
            marker="X",
            s=250,
            color="black",
            label="Centroid"
        )

    else:

        ax.scatter(
            rep_income,
            rep_spending,
            marker="D",
            s=220,
            color="black",
            label="Medoid"
        )

    ax.set_title(
        f"{algorithm}: Annual Income vs Spending Score",
        fontsize=15
    )

    ax.set_xlabel(
        "Annual Income (k$)",
        fontsize=12
    )

    ax.set_ylabel(
        "Spending Score (1-100)",
        fontsize=12
    )

    ax.legend(
        title="Cluster",
        bbox_to_anchor=(1.05, 1),
        loc="upper left"
    )

    ax.grid(alpha=0.25)

    st.pyplot(fig)

    # ---------------------------------------------------------
    # Cluster interpretation
    # ---------------------------------------------------------

    st.subheader("📌 Cluster Profile")

    income_mean = explorer_df[
        "Annual Income (k$)"
    ].mean()

    spending_mean = explorer_df[
        "Spending Score (1-100)"
    ].mean()

    if avg_income >= income_mean and avg_spending >= spending_mean:

        profile = "High-Income / High-Spending Customers"
        description = (
            "Customers in this cluster have above-average income "
            "and above-average spending scores. They may represent "
            "valuable customers for premium products, loyalty "
            "programs, and personalized offers."
        )

    elif avg_income >= income_mean and avg_spending < spending_mean:

        profile = "High-Income / Low-Spending Customers"
        description = (
            "Customers have relatively high income but lower "
            "spending scores. Targeted promotions and personalized "
            "recommendations may help improve engagement."
        )

    elif avg_income < income_mean and avg_spending >= spending_mean:

        profile = "Lower-Income / High-Spending Customers"
        description = (
            "Customers have below-average income but relatively "
            "high spending scores. Value-oriented products, "
            "discount campaigns, and loyalty incentives may be "
            "relevant."
        )

    else:

        profile = "Lower-Income / Lower-Spending Customers"
        description = (
            "Customers have below-average income and spending "
            "scores. Cost-sensitive offers and broad promotional "
            "campaigns may be more appropriate."
        )

    st.markdown(f"### {profile}")
    st.write(description)

    # ---------------------------------------------------------
    # Detailed statistics
    # ---------------------------------------------------------

    st.subheader("📊 Detailed Cluster Statistics")

    statistics = selected_data[
        [
            "Age",
            "Annual Income (k$)",
            "Spending Score (1-100)"
        ]
    ].describe().T

    statistics = statistics.round(2)

    st.dataframe(
        statistics,
        use_container_width=True
    )

    # ---------------------------------------------------------
    # Customer records
    # ---------------------------------------------------------

    st.subheader("👥 Customers in Selected Cluster")

    display_columns = [
        "CustomerID",
        "Gender",
        "Age",
        "Annual Income (k$)",
        "Spending Score (1-100)"
    ]

    st.dataframe(
        selected_data[display_columns].sort_values(
            by="Spending Score (1-100)",
            ascending=False
        ),
        use_container_width=True,
        hide_index=True
    )

# ============================================================
# ALGORITHM COMPARISON
# ============================================================

elif page == "⚖️ Algorithm Comparison":

    st.header("⚖️ K-Means vs K-Medoids")

    st.write(
        """
        This section compares the final K-Means and K-Medoids clustering
        solutions using internal clustering quality measures, execution
        time, and agreement between the resulting partitions.
        """
    )

    # --------------------------------------------------------
    # PREPARE FINAL CLUSTER ASSIGNMENTS
    # --------------------------------------------------------

    cluster_features = config["cluster_features"]

    X_original = df[cluster_features].copy()
    X_scaled = scaler.transform(X_original)

    # K-Means labels
    kmeans_labels = kmeans_model.predict(X_scaled)

    # K-Medoids labels
    medoid_points_scaled = np.asarray(
        kmedoids_model["medoid_points_scaled"]
    )

    medoid_distances = np.linalg.norm(
        X_scaled[:, np.newaxis, :] -
        medoid_points_scaled[np.newaxis, :, :],
        axis=2
    )

    kmedoids_labels = np.argmin(
        medoid_distances,
        axis=1
    )

    # --------------------------------------------------------
    # METRICS
    # --------------------------------------------------------

    from sklearn.metrics import (
        silhouette_score,
        davies_bouldin_score,
        adjusted_rand_score
    )

    kmeans_silhouette = silhouette_score(
        X_scaled,
        kmeans_labels
    )

    kmedoids_silhouette = silhouette_score(
        X_scaled,
        kmedoids_labels
    )

    kmeans_db = davies_bouldin_score(
        X_scaled,
        kmeans_labels
    )

    kmedoids_db = davies_bouldin_score(
        X_scaled,
        kmedoids_labels
    )

    ari_score = adjusted_rand_score(
        kmeans_labels,
        kmedoids_labels
    )

    # --------------------------------------------------------
    # RUNTIME
    # --------------------------------------------------------
    #
    # Runtime values are taken from the completed experiments
    # for this dataset/run.
    #
    # K-Means      = 0.164474 seconds
    # K-Medoids    = 0.076011 seconds
    #
    # These values are dataset/run specific and should NOT be
    # interpreted as a universal algorithm speed comparison.
    # --------------------------------------------------------

    kmeans_runtime = 0.164474
    kmedoids_runtime = 0.076011

    # --------------------------------------------------------
    # SUMMARY METRICS
    # --------------------------------------------------------

    st.subheader("📊 Final Model Metrics")

    col1, col2, col3, col4 = st.columns(4)

    with col1:

        st.metric(
            "K-Means Silhouette",
            f"{kmeans_silhouette:.4f}"
        )

    with col2:

        st.metric(
            "K-Medoids Silhouette",
            f"{kmedoids_silhouette:.4f}"
        )

    with col3:

        st.metric(
            "K-Means DB Index",
            f"{kmeans_db:.4f}"
        )

    with col4:

        st.metric(
            "K-Medoids DB Index",
            f"{kmedoids_db:.4f}"
        )

    st.markdown("---")

    # --------------------------------------------------------
    # COMPARISON TABLE
    # --------------------------------------------------------

    st.subheader("📋 Algorithm Comparison Table")

    comparison_df = pd.DataFrame(
        {
            "Metric": [
                "Optimal K",
                "Silhouette Score",
                "Davies-Bouldin Index",
                "Runtime (seconds)"
            ],
            "K-Means": [
                OPTIMAL_K,
                round(kmeans_silhouette, 4),
                round(kmeans_db, 4),
                kmeans_runtime
            ],
            "K-Medoids": [
                OPTIMAL_K,
                round(kmedoids_silhouette, 4),
                round(kmedoids_db, 4),
                kmedoids_runtime
            ],
            "Preferred Direction": [
                "Same",
                "Higher",
                "Lower",
                "Lower*"
            ]
        }
    )

    st.dataframe(
        comparison_df,
        use_container_width=True,
        hide_index=True
    )

    st.caption(
        "*Runtime is specific to this implementation, hardware, dataset, "
        "and experimental run. It should not be interpreted as a universal "
        "speed ranking between the algorithms."
    )

    # --------------------------------------------------------
    # SILHOUETTE COMPARISON
    # --------------------------------------------------------

    st.subheader("📈 Silhouette Score Comparison")

    silhouette_df = pd.DataFrame(
        {
            "Algorithm": [
                "K-Means",
                "K-Medoids"
            ],
            "Silhouette Score": [
                kmeans_silhouette,
                kmedoids_silhouette
            ]
        }
    )

    fig, ax = plt.subplots(
        figsize=(9, 5)
    )

    sns.barplot(
        data=silhouette_df,
        x="Algorithm",
        y="Silhouette Score",
        ax=ax
    )

    ax.set_title(
        "Silhouette Score Comparison"
    )

    ax.set_ylabel(
        "Silhouette Score"
    )

    ax.set_xlabel(
        "Algorithm"
    )

    ax.set_ylim(
        0,
        max(
            silhouette_df["Silhouette Score"].max() + 0.1,
            1.0
        )
    )

    ax.grid(
        axis="y",
        alpha=0.25
    )

    st.pyplot(
        fig,
        use_container_width=True
    )

    plt.close(fig)

    st.info(
        """
        **Silhouette Score:** Higher values generally indicate that
        observations are better matched to their own cluster and
        separated from other clusters.
        """
    )

    # --------------------------------------------------------
    # DAVIES-BOULDIN COMPARISON
    # --------------------------------------------------------

    st.subheader("📉 Davies-Bouldin Index Comparison")

    db_df = pd.DataFrame(
        {
            "Algorithm": [
                "K-Means",
                "K-Medoids"
            ],
            "Davies-Bouldin Index": [
                kmeans_db,
                kmedoids_db
            ]
        }
    )

    fig, ax = plt.subplots(
        figsize=(9, 5)
    )

    sns.barplot(
        data=db_df,
        x="Algorithm",
        y="Davies-Bouldin Index",
        ax=ax
    )

    ax.set_title(
        "Davies-Bouldin Index Comparison"
    )

    ax.set_ylabel(
        "Davies-Bouldin Index"
    )

    ax.set_xlabel(
        "Algorithm"
    )

    ax.grid(
        axis="y",
        alpha=0.25
    )

    st.pyplot(
        fig,
        use_container_width=True
    )

    plt.close(fig)

    st.info(
        """
        **Davies-Bouldin Index:** Lower values generally indicate
        better cluster compactness and separation.
        """
    )

    # --------------------------------------------------------
    # RUNTIME COMPARISON
    # --------------------------------------------------------

    st.subheader("⏱️ Runtime Comparison")

    runtime_df = pd.DataFrame(
        {
            "Algorithm": [
                "K-Means",
                "K-Medoids"
            ],
            "Runtime (seconds)": [
                kmeans_runtime,
                kmedoids_runtime
            ]
        }
    )

    fig, ax = plt.subplots(
        figsize=(9, 5)
    )

    sns.barplot(
        data=runtime_df,
        x="Algorithm",
        y="Runtime (seconds)",
        ax=ax
    )

    ax.set_title(
        "Measured Runtime for This Experiment"
    )

    ax.set_ylabel(
        "Runtime (seconds)"
    )

    ax.set_xlabel(
        "Algorithm"
    )

    ax.grid(
        axis="y",
        alpha=0.25
    )

    st.pyplot(
        fig,
        use_container_width=True
    )

    plt.close(fig)

    # --------------------------------------------------------
    # ARI
    # --------------------------------------------------------

    st.subheader("🔗 Agreement Between Algorithms")

    st.metric(
        "Adjusted Rand Index (ARI)",
        f"{ari_score:.4f}"
    )

    st.write(
        """
        The Adjusted Rand Index measures the agreement between the
        customer partitions produced by K-Means and K-Medoids.
        A value closer to 1 indicates stronger agreement between
        the two clustering assignments.
        """
    )

    # --------------------------------------------------------
    # CLUSTER SIZE COMPARISON
    # --------------------------------------------------------

    st.subheader("👥 Cluster Size Comparison")

    kmeans_sizes = (
        pd.Series(kmeans_labels)
        .value_counts()
        .sort_index()
    )

    kmedoids_sizes = (
        pd.Series(kmedoids_labels)
        .value_counts()
        .sort_index()
    )

    cluster_size_df = pd.DataFrame(
        {
            "Cluster": range(OPTIMAL_K),
            "K-Means": [
                int(kmeans_sizes.get(i, 0))
                for i in range(OPTIMAL_K)
            ],
            "K-Medoids": [
                int(kmedoids_sizes.get(i, 0))
                for i in range(OPTIMAL_K)
            ]
        }
    )

    st.dataframe(
        cluster_size_df,
        use_container_width=True,
        hide_index=True
    )

    fig, ax = plt.subplots(
        figsize=(10, 5)
    )

    x = np.arange(OPTIMAL_K)
    width = 0.35

    ax.bar(
        x - width / 2,
        cluster_size_df["K-Means"],
        width,
        label="K-Means"
    )

    ax.bar(
        x + width / 2,
        cluster_size_df["K-Medoids"],
        width,
        label="K-Medoids"
    )

    ax.set_title(
        "Cluster Size Distribution"
    )

    ax.set_xlabel(
        "Cluster"
    )

    ax.set_ylabel(
        "Number of Customers"
    )

    ax.set_xticks(x)
    ax.set_xticklabels(
        cluster_size_df["Cluster"]
    )

    ax.legend()

    ax.grid(
        axis="y",
        alpha=0.25
    )

    st.pyplot(
        fig,
        use_container_width=True
    )

    plt.close(fig)

    # --------------------------------------------------------
    # AUTOMATIC INTERPRETATION
    # --------------------------------------------------------

    st.subheader("🧠 Interpretation")

    if kmedoids_silhouette > kmeans_silhouette:
        silhouette_statement = (
            "K-Medoids achieved a slightly higher Silhouette Score "
            "in this experiment."
        )
    elif kmeans_silhouette > kmedoids_silhouette:
        silhouette_statement = (
            "K-Means achieved a slightly higher Silhouette Score "
            "in this experiment."
        )
    else:
        silhouette_statement = (
            "Both algorithms produced the same Silhouette Score "
            "in this experiment."
        )

    if kmedoids_db < kmeans_db:
        db_statement = (
            "K-Medoids produced a lower Davies-Bouldin Index, "
            "which indicates better compactness/separation according "
            "to this metric."
        )
    elif kmeans_db < kmedoids_db:
        db_statement = (
            "K-Means produced a lower Davies-Bouldin Index, "
            "which indicates better compactness/separation according "
            "to this metric."
        )
    else:
        db_statement = (
            "Both algorithms produced the same Davies-Bouldin Index."
        )

    st.markdown(
        f"""
        **Silhouette:** {silhouette_statement}

        **Davies-Bouldin:** {db_statement}

        **Agreement:** The two algorithms produced an ARI of
        **{ari_score:.4f}**, indicating strong agreement between
        their customer partitions.

        **Runtime:** In this particular experiment, K-Means took
        **{kmeans_runtime:.6f} seconds**, while K-Medoids took
        **{kmedoids_runtime:.6f} seconds**. Runtime depends on the
        implementation, hardware, dataset size and experimental setup.

        **Important:** These results should be interpreted as the
        outcome of this specific experiment rather than as a universal
        statement that one algorithm is always better than the other.
        """
    )

    # --------------------------------------------------------
    # VIVA NOTE
    # --------------------------------------------------------

    with st.expander("🎓 Viva: Why use both K-Means and K-Medoids?"):

        st.markdown(
            """
            **K-Means** represents each cluster using the mean/centroid
            of its observations. It is computationally efficient and
            widely used for numerical clustering.

            **K-Medoids** represents each cluster using an actual data
            point called a medoid. This makes the representative
            customer an existing observation rather than an artificial
            mean point.

            Comparing both methods allows us to determine whether the
            customer segmentation is reasonably consistent across
            different clustering approaches.

            For this project, K-Medoids was implemented using the
            PAM-style approach.
            """
        )

# ============================================================
# BUSINESS INSIGHTS
# ============================================================

elif page == "💡 Business Insights":

    st.header("💡 Business Insights")

    st.write(
        """
        This section converts the clustering results into interpretable
        customer segments using Annual Income, Spending Score and
        demographic characteristics.
        """
    )

    # --------------------------------------------------------
    # PREPARE DATA
    # --------------------------------------------------------

    cluster_features = config["cluster_features"]

    X_original = df[cluster_features].copy()
    X_scaled = scaler.transform(X_original)

    # --------------------------------------------------------
    # K-MEANS
    # --------------------------------------------------------

    kmeans_labels = kmeans_model.predict(X_scaled)

    # --------------------------------------------------------
    # K-MEDOIDS
    # --------------------------------------------------------

    medoid_points_scaled = np.asarray(
        kmedoids_model["medoid_points_scaled"]
    )

    medoid_distances = np.linalg.norm(
        X_scaled[:, np.newaxis, :] -
        medoid_points_scaled[np.newaxis, :, :],
        axis=2
    )

    kmedoids_labels = np.argmin(
        medoid_distances,
        axis=1
    )

    # --------------------------------------------------------
    # SELECT ALGORITHM
    # --------------------------------------------------------

    algorithm = st.radio(
        "Select clustering algorithm for profiling:",
        ["K-Means", "K-Medoids"],
        horizontal=True
    )

    if algorithm == "K-Means":

        labels = kmeans_labels
        cluster_column = "KMeans_Cluster"

    else:

        labels = kmedoids_labels
        cluster_column = "KMedoids_Cluster"

    insights_df = df.copy()

    insights_df[cluster_column] = labels

    # --------------------------------------------------------
    # OVERALL BENCHMARKS
    # --------------------------------------------------------

    overall_income = insights_df[
        "Annual Income (k$)"
    ].mean()

    overall_spending = insights_df[
        "Spending Score (1-100)"
    ].mean()

    overall_age = insights_df[
        "Age"
    ].mean()

    # --------------------------------------------------------
    # CLUSTER PROFILE
    # --------------------------------------------------------

    profile = (
        insights_df
        .groupby(cluster_column)
        .agg(
            Customers=("CustomerID", "count"),
            Average_Age=("Age", "mean"),
            Average_Income=("Annual Income (k$)", "mean"),
            Average_Spending=(
                "Spending Score (1-100)",
                "mean"
            )
        )
        .reset_index()
    )

    profile["Customer_Percentage"] = (
        profile["Customers"] /
        len(insights_df) *
        100
    )

    profile = profile.round(
        {
            "Average_Age": 2,
            "Average_Income": 2,
            "Average_Spending": 2,
            "Customer_Percentage": 2
        }
    )

    # --------------------------------------------------------
    # SEGMENT NAMING
    # --------------------------------------------------------
    #
    # Names are generated from each cluster's position relative
    # to the dataset-wide average.
    # --------------------------------------------------------

    def assign_segment_name(
        income,
        spending,
        overall_income,
        overall_spending
    ):

        high_income = income >= overall_income
        high_spending = spending >= overall_spending

        if high_income and high_spending:

            return "High-Value Customers"

        elif high_income and not high_spending:

            return "High-Income / Low-Spending Customers"

        elif not high_income and high_spending:

            return "Budget-Conscious High-Spending Customers"

        else:

            return "Low-Income / Low-Spending Customers"

    profile["Segment"] = profile.apply(
        lambda row: assign_segment_name(
            row["Average_Income"],
            row["Average_Spending"],
            overall_income,
            overall_spending
        ),
        axis=1
    )

    # --------------------------------------------------------
    # PAGE METRICS
    # --------------------------------------------------------

    st.subheader("📊 Overall Customer Benchmarks")

    col1, col2, col3 = st.columns(3)

    col1.metric(
        "Average Income",
        f"${overall_income:.2f}k"
    )

    col2.metric(
        "Average Spending Score",
        f"{overall_spending:.2f}"
    )

    col3.metric(
        "Average Age",
        f"{overall_age:.2f}"
    )

    # --------------------------------------------------------
    # PROFILE TABLE
    # --------------------------------------------------------

    st.subheader(
        f"📋 {algorithm} Customer Segment Profile"
    )

    profile_display = profile[
        [
            cluster_column,
            "Segment",
            "Customers",
            "Customer_Percentage",
            "Average_Age",
            "Average_Income",
            "Average_Spending"
        ]
    ].copy()

    profile_display.columns = [
        "Cluster",
        "Segment",
        "Customers",
        "Customer %",
        "Average Age",
        "Average Income (k$)",
        "Average Spending Score"
    ]

    st.dataframe(
        profile_display,
        use_container_width=True,
        hide_index=True
    )

    # --------------------------------------------------------
    # CLUSTER SIZE
    # --------------------------------------------------------

    st.subheader("👥 Customer Distribution by Cluster")

    fig, ax = plt.subplots(
        figsize=(10, 5)
    )

    sns.barplot(
        data=profile,
        x=cluster_column,
        y="Customers",
        ax=ax
    )

    ax.set_title(
        f"{algorithm} — Customers per Cluster"
    )

    ax.set_xlabel(
        "Cluster"
    )

    ax.set_ylabel(
        "Number of Customers"
    )

    ax.grid(
        axis="y",
        alpha=0.25
    )

    st.pyplot(
        fig,
        use_container_width=True
    )

    plt.close(fig)

    # --------------------------------------------------------
    # INCOME VS SPENDING PROFILE
    # --------------------------------------------------------

    st.subheader(
        "💰 Income and Spending Profile"
    )

    fig, ax = plt.subplots(
        figsize=(10, 6)
    )

    sns.scatterplot(
        data=insights_df,
        x="Annual Income (k$)",
        y="Spending Score (1-100)",
        hue=cluster_column,
        palette="tab10",
        s=90,
        alpha=0.75,
        ax=ax
    )

    # Overall average lines

    ax.axvline(
        overall_income,
        linestyle="--",
        label="Average Income"
    )

    ax.axhline(
        overall_spending,
        linestyle="--",
        label="Average Spending"
    )

    ax.set_title(
        f"{algorithm} — Customer Segmentation"
    )

    ax.set_xlabel(
        "Annual Income (k$)"
    )

    ax.set_ylabel(
        "Spending Score (1-100)"
    )

    ax.legend(
        bbox_to_anchor=(1.05, 1),
        loc="upper left"
    )

    ax.grid(
        alpha=0.25
    )

    st.pyplot(
        fig,
        use_container_width=True
    )

    plt.close(fig)

    # --------------------------------------------------------
    # SEGMENT DETAILS
    # --------------------------------------------------------

    st.subheader("🔎 Segment Details")

    for _, row in profile.iterrows():

        cluster_id = int(row[cluster_column])
        segment = row["Segment"]

        with st.expander(
            f"Cluster {cluster_id} — {segment}"
        ):

            c1, c2, c3, c4 = st.columns(4)

            c1.metric(
                "Customers",
                int(row["Customers"])
            )

            c2.metric(
                "Avg. Income",
                f"${row['Average_Income']:.1f}k"
            )

            c3.metric(
                "Avg. Spending",
                f"{row['Average_Spending']:.1f}"
            )

            c4.metric(
                "Avg. Age",
                f"{row['Average_Age']:.1f}"
            )

            income = row["Average_Income"]
            spending = row["Average_Spending"]

            # ------------------------------------------------
            # Interpretation
            # ------------------------------------------------

            if (
                income >= overall_income
                and spending >= overall_spending
            ):

                st.success(
                    """
                    **Interpretation:** This group has both
                    above-average income and above-average spending.
                    These customers may be suitable for premium
                    offerings, loyalty programs and personalized
                    campaigns.
                    """
                )

            elif (
                income >= overall_income
                and spending < overall_spending
            ):

                st.warning(
                    """
                    **Interpretation:** Customers have relatively
                    high income but below-average spending scores.
                    This group may benefit from personalized
                    recommendations, engagement campaigns and
                    targeted promotions.
                    """
                )

            elif (
                income < overall_income
                and spending >= overall_spending
            ):

                st.info(
                    """
                    **Interpretation:** Customers have relatively
                    lower income but above-average spending scores.
                    Value-oriented products, offers and loyalty
                    incentives may be relevant.
                    """
                )

            else:

                st.info(
                    """
                    **Interpretation:** Customers have both
                    below-average income and spending scores.
                    Broad promotions and value-focused offerings
                    may be more appropriate.
                    """
                )

    # --------------------------------------------------------
    # GENDER DISTRIBUTION BY CLUSTER
    # --------------------------------------------------------

    st.subheader("⚥ Gender Distribution Across Clusters")

    gender_cluster = pd.crosstab(
        insights_df[cluster_column],
        insights_df["Gender"]
    )

    st.dataframe(
        gender_cluster,
        use_container_width=True
    )

    # --------------------------------------------------------
    # AGE PROFILE
    # --------------------------------------------------------

    st.subheader("🎂 Age Profile by Cluster")

    age_profile = (
        insights_df
        .groupby(cluster_column)["Age"]
        .agg(
            Average_Age="mean",
            Minimum_Age="min",
            Maximum_Age="max"
        )
        .round(2)
        .reset_index()
    )

    st.dataframe(
        age_profile,
        use_container_width=True,
        hide_index=True
    )

    # --------------------------------------------------------
    # BUSINESS TAKEAWAYS
    # --------------------------------------------------------

    st.subheader("💡 Key Business Takeaways")

    highest_spending_cluster = int(
        profile.loc[
            profile["Average_Spending"].idxmax(),
            cluster_column
        ]
    )

    highest_income_cluster = int(
        profile.loc[
            profile["Average_Income"].idxmax(),
            cluster_column
        ]
    )

    largest_cluster = int(
        profile.loc[
            profile["Customers"].idxmax(),
            cluster_column
        ]
    )

    st.markdown(
        f"""
        - **Highest average spending:** Cluster
          **{highest_spending_cluster}**.

        - **Highest average income:** Cluster
          **{highest_income_cluster}**.

        - **Largest customer segment:** Cluster
          **{largest_cluster}**.

        - The segmentation can help identify groups that differ
          in purchasing behaviour and income characteristics.

        - These results describe **associations in the dataset**.
          They should not be interpreted as proof that income causes
          spending behaviour.
        """
    )

    # --------------------------------------------------------
    # METHODOLOGY NOTE
    # --------------------------------------------------------

    st.info(
        """
        **Methodology note:** Cluster names are descriptive labels
        generated from each cluster's average income and spending
        relative to the overall dataset averages. They are not
        ground-truth customer categories.
        """
    )

    # --------------------------------------------------------
    # VIVA NOTE
    # --------------------------------------------------------

    with st.expander(
        "🎓 Viva: How are the customer segments interpreted?"
    ):

        st.markdown(
            """
            The clustering algorithm does not automatically know
            business meanings such as "High-Value Customer".

            First, the algorithm assigns customers to clusters based
            on similarity in the selected numerical features.

            After clustering, we calculate the average income and
            spending score of each cluster.

            We then compare those averages with the overall dataset
            averages and assign descriptive names such as:

            - High-Value Customers
            - High-Income / Low-Spending Customers
            - Budget-Conscious High-Spending Customers
            - Low-Income / Low-Spending Customers

            Therefore, the segment names are an interpretation of
            the clustering results rather than labels supplied by
            the original dataset.
            """
        )

# ============================================================
# CUSTOMER EXPLORER
# ============================================================

elif page == "🔮 Customer Explorer":
    st.header("🔮 Customer Explorer")
    st.caption(
        "Enter a hypothetical customer's income and spending score to determine "
        "which existing customer segment they are closest to."
    )

    cluster_features = config["cluster_features"]

    # ---------------------------------------------------------
    # Customer input section
    # ---------------------------------------------------------
    st.subheader("👤 Enter Customer Information")

    col1, col2, col3 = st.columns(3)

    income_min = float(df["Annual Income (k$)"].min())
    income_max = float(df["Annual Income (k$)"].max())
    spending_min = float(df["Spending Score (1-100)"].min())
    spending_max = float(df["Spending Score (1-100)"].max())

    with col1:
        algorithm = st.selectbox(
            "Clustering Algorithm",
            ["K-Means", "K-Medoids"],
            key="customer_explorer_algorithm"
        )

    with col2:
        customer_income = st.number_input(
            "Annual Income (k$)",
            min_value=0.0,
            max_value=1000.0,
            value=float(df["Annual Income (k$)"].median()),
            step=1.0,
            key="customer_income"
        )

    with col3:
        customer_spending = st.number_input(
            "Spending Score (1-100)",
            min_value=1.0,
            max_value=100.0,
            value=float(df["Spending Score (1-100)"].median()),
            step=1.0,
            key="customer_spending"
        )

    st.divider()

    # ---------------------------------------------------------
    # Transform hypothetical customer using saved scaler
    # ---------------------------------------------------------
    hypothetical_customer = pd.DataFrame(
        [[customer_income, customer_spending]],
        columns=cluster_features
    )

    hypothetical_scaled = scaler.transform(hypothetical_customer)

    # ---------------------------------------------------------
    # Cluster assignment
    # ---------------------------------------------------------
    if algorithm == "K-Means":

        assigned_cluster = int(
            kmeans_model.predict(hypothetical_scaled)[0]
        )

        # Convert centroid from scaled values back to original units
        representative_scaled = kmeans_model.cluster_centers_[assigned_cluster]

        representative_original = scaler.inverse_transform(
            representative_scaled.reshape(1, -1)
        )[0]

        representative_income = representative_original[0]
        representative_spending = representative_original[1]

        representative_label = "K-Means Centroid"

    else:

        # -----------------------------------------------------
        # K-Medoids assignment
        # -----------------------------------------------------
        medoid_points_scaled = np.asarray(
            kmedoids_model["medoid_points_scaled"]
        )

        distances = np.linalg.norm(
            medoid_points_scaled - hypothetical_scaled[0],
            axis=1
        )

        assigned_cluster = int(np.argmin(distances))

        representative_scaled = medoid_points_scaled[assigned_cluster]

        representative_original = scaler.inverse_transform(
            representative_scaled.reshape(1, -1)
        )[0]

        representative_income = representative_original[0]
        representative_spending = representative_original[1]

        representative_label = "K-Medoids Medoid"

    # ---------------------------------------------------------
    # Assigned cluster profile
    # ---------------------------------------------------------
    if algorithm == "K-Means":
        df_explorer = df.copy()

        X_explorer = df_explorer[cluster_features]
        X_explorer_scaled = scaler.transform(X_explorer)

        df_explorer["Cluster"] = kmeans_model.predict(
            X_explorer_scaled
        )

    else:
        df_explorer = df.copy()

        X_explorer = df_explorer[cluster_features]
        X_explorer_scaled = scaler.transform(X_explorer)

        distances_matrix = np.linalg.norm(
            X_explorer_scaled[:, np.newaxis, :]
            - medoid_points_scaled[np.newaxis, :, :],
            axis=2
        )

        df_explorer["Cluster"] = np.argmin(
            distances_matrix,
            axis=1
        )

    assigned_cluster_data = df_explorer[
        df_explorer["Cluster"] == assigned_cluster
    ]

    # ---------------------------------------------------------
    # Cluster naming
    # ---------------------------------------------------------
    overall_income = df["Annual Income (k$)"].mean()
    overall_spending = df["Spending Score (1-100)"].mean()

    cluster_income = assigned_cluster_data[
        "Annual Income (k$)"
    ].mean()

    cluster_spending = assigned_cluster_data[
        "Spending Score (1-100)"
    ].mean()

    if (
        cluster_income >= overall_income
        and cluster_spending >= overall_spending
    ):
        segment_name = "High-Value Customers"

    elif (
        cluster_income >= overall_income
        and cluster_spending < overall_spending
    ):
        segment_name = "High-Income / Low-Spending Customers"

    elif (
        cluster_income < overall_income
        and cluster_spending >= overall_spending
    ):
        segment_name = "Budget-Conscious High-Spending Customers"

    else:
        segment_name = "Low-Income / Low-Spending Customers"

    # ---------------------------------------------------------
    # Main result
    # ---------------------------------------------------------
    st.subheader("🎯 Cluster Assignment")

    result_col1, result_col2, result_col3 = st.columns(3)

    with result_col1:
        st.metric(
            "Assigned Cluster",
            f"Cluster {assigned_cluster}"
        )

    with result_col2:
        st.metric(
            "Segment",
            segment_name
        )

    with result_col3:
        st.metric(
            "Customers in Cluster",
            len(assigned_cluster_data)
        )

    st.success(
        f"The hypothetical customer is assigned to **Cluster {assigned_cluster}** "
        f"using **{algorithm}**."
    )

    # ---------------------------------------------------------
    # Customer vs representative point
    # ---------------------------------------------------------
    st.subheader("📍 Customer vs Cluster Representative")

    comparison_col1, comparison_col2 = st.columns(2)

    with comparison_col1:
        st.metric(
            "Customer Income",
            f"{customer_income:.1f} k$"
        )

        st.metric(
            "Customer Spending Score",
            f"{customer_spending:.1f}"
        )

    with comparison_col2:
        st.metric(
            representative_label,
            f"Cluster {assigned_cluster}"
        )

        st.write(
            f"**Representative Income:** "
            f"{representative_income:.1f} k$"
        )

        st.write(
            f"**Representative Spending:** "
            f"{representative_spending:.1f}"
        )

    # ---------------------------------------------------------
    # Required visualization
    # ---------------------------------------------------------
    st.subheader("📊 Customer Position in Cluster Map")

    fig, ax = plt.subplots(figsize=(10, 6))

    sns.scatterplot(
        data=df_explorer,
        x="Annual Income (k$)",
        y="Spending Score (1-100)",
        hue="Cluster",
        palette="tab10",
        s=70,
        alpha=0.75,
        ax=ax
    )

    # Highlight hypothetical customer
    ax.scatter(
        customer_income,
        customer_spending,
        marker="*",
        s=350,
        edgecolor="black",
        linewidth=1.5,
        label="Hypothetical Customer"
    )

    # Highlight representative point
    ax.scatter(
        representative_income,
        representative_spending,
        marker="X" if algorithm == "K-Means" else "D",
        s=220,
        edgecolor="black",
        linewidth=1.5,
        label=representative_label
    )

    ax.set_title(
        f"{algorithm}: Hypothetical Customer Assignment"
    )

    ax.set_xlabel("Annual Income (k$)")
    ax.set_ylabel("Spending Score (1-100)")
    ax.legend(
        bbox_to_anchor=(1.02, 1),
        loc="upper left"
    )

    ax.grid(alpha=0.2)

    st.pyplot(fig)
    plt.close(fig)

    # ---------------------------------------------------------
    # Assigned cluster profile
    # ---------------------------------------------------------
    st.subheader("📋 Assigned Cluster Profile")

    profile_col1, profile_col2, profile_col3, profile_col4 = st.columns(4)

    with profile_col1:
        st.metric(
            "Average Income",
            f"{cluster_income:.1f} k$"
        )

    with profile_col2:
        st.metric(
            "Average Spending",
            f"{cluster_spending:.1f}"
        )

    with profile_col3:
        st.metric(
            "Average Age",
            f"{assigned_cluster_data['Age'].mean():.1f}"
        )

    with profile_col4:
        st.metric(
            "Cluster Size",
            len(assigned_cluster_data)
        )

    # ---------------------------------------------------------
    # Distance / similarity information
    # ---------------------------------------------------------
    st.subheader("📏 Assignment Explanation")

    if algorithm == "K-Medoids":

        selected_distance = distances[assigned_cluster]

        st.write(
            f"The customer was assigned to Cluster {assigned_cluster} "
            f"because its scaled Euclidean distance to that cluster's "
            f"medoid is **{selected_distance:.4f}**."
        )

    else:

        centroid_distance = np.linalg.norm(
            hypothetical_scaled[0]
            - kmeans_model.cluster_centers_[assigned_cluster]
        )

        st.write(
            f"The customer was assigned to Cluster {assigned_cluster} "
            f"because its scaled Euclidean distance to that cluster's "
            f"K-Means centroid is **{centroid_distance:.4f}**."
        )

    # ---------------------------------------------------------
    # Customers belonging to assigned cluster
    # ---------------------------------------------------------
    with st.expander("👥 View Customers in Assigned Cluster"):

        display_columns = [
            "CustomerID",
            "Gender",
            "Age",
            "Annual Income (k$)",
            "Spending Score (1-100)",
            "Cluster"
        ]

        st.dataframe(
            assigned_cluster_data[
                display_columns
            ].sort_values(
                by="Spending Score (1-100)",
                ascending=False
            ),
            use_container_width=True,
            hide_index=True
        )

    # ---------------------------------------------------------
    # Important methodological note
    # ---------------------------------------------------------
    st.info(
        "⚠️ This tool performs **cluster assignment**, not spending "
        "prediction. The entered customer is placed into the nearest "
        "existing segment learned from the dataset."
    )

    with st.expander("🎓 Viva Explanation"):

        st.markdown(
            """
            **How does Customer Explorer work?**

            1. The user enters Annual Income and Spending Score.
            2. The same StandardScaler used during model training transforms
               the new customer.
            3. For K-Means, the customer is assigned using the model's
               `predict()` method.
            4. For K-Medoids, the Euclidean distance to every saved medoid
               is calculated.
            5. The closest representative determines the cluster.
            6. The result is displayed together with the cluster's profile.

            The model does not predict how much the customer will spend.
            It only determines which existing customer segment the customer
            most closely resembles.
            """
        )

# =========================================================
# FOOTER
# =========================================================

st.divider()

footer_col1, footer_col2, footer_col3 = st.columns(3)

with footer_col1:
    st.caption("🎓 DMDW OEP Project")

with footer_col2:
    st.caption("CustomerLens • Customer Segmentation")

with footer_col3:
    st.caption("K-Means + K-Medoids")