# CustomerLens — Customer Segmentation Using K-Means and K-Medoids

CustomerLens is a Data Mining and Data Warehousing (DMDW) OEP project that performs customer segmentation using clustering techniques.

The project implements:

- Data preprocessing
- Exploratory Data Analysis (EDA)
- Feature scaling using StandardScaler
- K-Means clustering
- K-Medoids clustering using the PAM approach
- Elbow / Bend-in-the-Knee analysis
- Silhouette analysis
- Davies-Bouldin evaluation
- Customer cluster profiling
- Income vs Spending Score visualization
- Interactive Streamlit dashboard
- Hypothetical customer cluster assignment
- Automated validation tests

---

## 1. Project Overview

Customer segmentation divides customers into groups with similar characteristics.

CustomerLens focuses on two primary clustering features:

- Annual Income (k$)
- Spending Score (1-100)

The objective is to identify meaningful customer groups and compare the performance of K-Means and K-Medoids clustering.

The project uses the Mall Customer Segmentation dataset containing 200 customer records.

> **Note:** Spending Score is a behavioral score provided in the dataset and should not be interpreted as raw monetary spending.

---

## 2. Problem Statement

Businesses often have customers with different income levels and purchasing behaviors.

Treating all customers as one homogeneous group can make marketing and customer-management decisions less effective.

CustomerLens addresses this problem by applying unsupervised clustering techniques to identify customer segments based on Annual Income and Spending Score.

---

## 3. Objectives

The main objectives are:

1. Perform data preprocessing and quality analysis.
2. Explore customer characteristics using EDA.
3. Scale the clustering features.
4. Determine a suitable number of clusters.
5. Implement K-Means clustering.
6. Implement K-Medoids clustering using PAM.
7. Compare the clustering algorithms.
8. Visualize customer segments.
9. Profile the resulting customer groups.
10. Provide an interactive dashboard for analysis.

---

## 4. Dataset

The project uses the Mall Customer Segmentation dataset.

### Dataset Size

- Records: 200 customers
- Attributes: 5

### Columns

| Column | Description |
|---|---|
| CustomerID | Unique customer identifier |
| Gender | Customer gender |
| Age | Customer age |
| Annual Income (k$) | Annual income in thousands of dollars |
| Spending Score (1-100) | Behavioral spending score |

### Clustering Features

Only the following two features are used for the primary clustering analysis:

```text
Annual Income (k$)
Spending Score (1-100)
```

CustomerID is excluded because it is an identifier rather than a behavioral feature.

Gender and Age are retained for post-clustering profiling and interpretation.

---

## 5. Methodology

The project follows this workflow:

```text
Dataset
   â†“
Data Audit
   â†“
Preprocessing
   â†“
Feature Selection
   â†“
StandardScaler
   â†“
Optimal K Analysis
   â†“
K-Means + K-Medoids
   â†“
Cluster Evaluation
   â†“
Cluster Profiling
   â†“
Visualization
   â†“
Business Insights
   â†“
Interactive Dashboard
```

---

## 6. Preprocessing

The clustering features are standardized using `StandardScaler`.

This is necessary because clustering algorithms are distance-based and the two features can have different numerical scales.

The transformed feature matrix is used for both K-Means and K-Medoids.

No train-test split is used because this is an unsupervised clustering problem rather than a supervised prediction problem.

---

## 7. Optimal Number of Clusters

Values of K from 2 through 10 were evaluated.

The project evaluates:

### K-Means

- Inertia
- Silhouette Score
- Davies-Bouldin Index

### K-Medoids

- Medoid Cost
- Silhouette Score
- Davies-Bouldin Index

The raw K-Means inertia and K-Medoids medoid cost are algorithm-specific objective functions and are therefore not treated as directly comparable quantities.

---

## 8. Optimal K

Both algorithms achieved their highest Silhouette Score at:

```text
K = 5
```

### K-Means

Silhouette Score at K=5:

```text
0.554657
```

Davies-Bouldin Index:

```text
0.572236
```

### K-Medoids

Silhouette Score at K=5:

```text
0.556218
```

Davies-Bouldin Index:

```text
0.566089
```

Therefore, K=5 is used for the final clustering models.

---

## 9. Algorithm Comparison

| Metric | K-Means | K-Medoids |
|---|---:|---:|
| Optimal K | 5 | 5 |
| Silhouette Score | 0.554657 | 0.556218 |
| Davies-Bouldin Index | 0.572236 | 0.566089 |
| Runtime* | 0.164474 s | 0.076011 s |

\*Runtime values are specific to the implemented experiment and hardware/run and should not be interpreted as a general statement that K-Medoids is faster than K-Means.

K-Medoids achieved a slightly higher Silhouette Score and slightly lower Davies-Bouldin Index for this dataset.

The difference is small, so the results indicate that both algorithms provide strong and highly similar segmentation.

---

## 10. Evaluation Metrics

### Silhouette Score

The Silhouette Score measures how similar an object is to its own cluster compared with other clusters.

Higher values indicate better-separated and more cohesive clusters.

### Davies-Bouldin Index

The Davies-Bouldin Index evaluates the similarity between clusters.

Lower values indicate better clustering quality.

### Adjusted Rand Index

An Adjusted Rand Index was also calculated to compare the two resulting partitions.

The measured ARI was:

```text
0.9597
```

This indicates very high agreement between the K-Means and K-Medoids cluster assignments.

ARI is a comparison metric between partitions and is not clustering accuracy.

---

## 11. K-Means

K-Means partitions customers into K groups by assigning each customer to the nearest centroid and iteratively updating the centroids.

The final model uses:

```text
K = 5
```

The trained model is stored in:

```text
artifacts/models/kmeans_k5.joblib
```

---

## 12. K-Medoids

K-Medoids is a partitioning clustering method similar to K-Means but uses actual observations as cluster representatives called medoids.

CustomerLens implements the PAM-style approach manually using NumPy and pairwise Euclidean distances.

The final model uses:

```text
K = 5
```

The saved model information is stored in:

```text
artifacts/models/kmedoids_pam_k5.joblib
```

The saved K-Medoids artifact contains:

- `k`
- `medoid_indices`
- `medoid_points_scaled`

---

## 13. Required Visualization

The primary visualization required by the project is:

```text
Annual Income vs Spending Score
```

Customers are color-coded according to their cluster assignment.

The dashboard also displays the appropriate cluster representative:

- K-Means â†’ Centroid
- K-Medoids â†’ Medoid

---

## 14. Interactive Dashboard

CustomerLens includes a Streamlit dashboard with the following sections:

### ðŸ  Overview

Provides a high-level summary of the dataset, models, and project configuration.

### ðŸ“Š Data Quality & EDA

Provides:

- Dataset statistics
- Missing-value analysis
- Feature distributions
- Correlation analysis
- Exploratory visualizations

### ðŸ“ Optimal K

Displays the evaluation of K values from 2 to 10 using clustering-quality metrics.

### ðŸŽ¯ Cluster Explorer

Allows users to inspect individual clusters and view:

- Customer count
- Average income
- Average spending
- Average age
- Customer records
- Centroids or medoids

### âš–ï¸ Algorithm Comparison

Compares K-Means and K-Medoids using:

- Silhouette Score
- Davies-Bouldin Index
- Runtime
- Cluster sizes
- Adjusted Rand Index

### ðŸ’¡ Business Insights

Provides cluster profiles and descriptive segment interpretations.

### ðŸ”® Customer Explorer

Allows a hypothetical customer to be entered using:

- Annual Income
- Spending Score

The application then assigns the customer to the nearest existing cluster.

This is a cluster-assignment tool, not a spending prediction model.

---

## 15. Project Structure

```text
CustomerLens/
â”‚
â”œâ”€â”€ app.py
â”œâ”€â”€ README.md
â”œâ”€â”€ requirements.txt
â”œâ”€â”€ .gitignore
â”‚
â”œâ”€â”€ data/
â”‚   â”œâ”€â”€ raw/
â”‚   â”‚   â””â”€â”€ Mall_Customers.csv
â”‚   â””â”€â”€ processed/
â”‚       â””â”€â”€ customerlens_final.csv
â”‚
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ __init__.py
â”‚   â”œâ”€â”€ data_loader.py
â”‚   â”œâ”€â”€ preprocessing.py
â”‚   â”œâ”€â”€ eda.py
â”‚   â”œâ”€â”€ optimal_k.py
â”‚   â”œâ”€â”€ kmeans_model.py
â”‚   â”œâ”€â”€ kmedoids_pam.py
â”‚   â”œâ”€â”€ evaluation.py
â”‚   â”œâ”€â”€ profiling.py
â”‚   â””â”€â”€ visualizations.py
â”‚
â”œâ”€â”€ notebooks/
â”‚   â”œâ”€â”€ 01_data_audit_and_eda.ipynb
â”‚   â””â”€â”€ 02_clustering_experiments.ipynb
â”‚
â”œâ”€â”€ artifacts/
â”‚   â”œâ”€â”€ models/
â”‚   â”‚   â”œâ”€â”€ scaler.joblib
â”‚   â”‚   â”œâ”€â”€ kmeans_k5.joblib
â”‚   â”‚   â”œâ”€â”€ kmedoids_pam_k5.joblib
â”‚   â”‚   â””â”€â”€ feature_config.joblib
â”‚   â”‚
â”‚   â”œâ”€â”€ results/
â”‚   â”‚   â”œâ”€â”€ kmeans_optimal_k_results.csv
â”‚   â”‚   â””â”€â”€ kmedoids_optimal_k_results.csv
â”‚   â”‚
â”‚   â””â”€â”€ figures/
â”‚
â””â”€â”€ tests/
    â””â”€â”€ test_clustering.py
```

---

## 16. Installation

Clone the repository and enter the project directory.

Create a virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```powershell
.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## 17. Running the Dashboard

From the project root:

```bash
streamlit run app.py
```

The application will open in the browser.

---

## 18. Running Tests

CustomerLens includes automated validation tests.

Run:

```bash
python -m pytest -q
```

Current validation status:

```text
8 passed
```

The tests verify:

- Dataset size
- Required clustering features
- Missing values
- Optimal K
- K-Means configuration
- K-Medoids configuration
- K-Means customer assignment
- K-Medoids customer assignment

---

## 19. Reproducibility

The project stores the following artifacts:

```text
artifacts/models/
artifacts/results/
data/processed/
```

The saved scaler, clustering models, configuration, and evaluation results allow the Streamlit dashboard to reproduce the validated project results without retraining every time.

---

## 20. Limitations

1. The dataset contains only 200 customers.
2. The clustering analysis uses only Annual Income and Spending Score as primary clustering features.
3. Spending Score is a behavioral score rather than a direct monetary spending measurement.
4. Cluster labels do not represent predefined customer categories.
5. The descriptive segment names are interpretations derived from cluster statistics.
6. Results may differ when applied to another dataset or customer population.
7. Runtime comparisons are specific to the implementation and execution environment.

---

## 21. Academic Relevance

The project directly demonstrates important DMDW concepts:

- Data preprocessing
- Exploratory Data Analysis
- Unsupervised learning
- Partition-based clustering
- K-Means
- K-Medoids
- Distance-based clustering
- Optimal K selection
- Cluster evaluation
- Data visualization
- Cluster profiling

---

## 22. Conclusion

CustomerLens successfully applies K-Means and K-Medoids clustering to customer segmentation using Annual Income and Spending Score.

Both algorithms identified five meaningful customer groups, with K=5 supported by the evaluated clustering-quality metrics.

For the final K=5 models, K-Medoids achieved a slightly higher Silhouette Score and slightly lower Davies-Bouldin Index than K-Means. The high Adjusted Rand Index also indicates strong agreement between the two clustering solutions.

The resulting Streamlit application provides an interactive environment for exploring customer segments, comparing clustering algorithms, understanding cluster characteristics, and assigning hypothetical customers to existing segments.

---

## 23. Technologies Used

- Python
- Pandas
- NumPy
- Scikit-learn
- Matplotlib
- Seaborn
- Streamlit
- Joblib
- Jupyter Notebook
- Pytest
- Git

---

## 24. Project Type

**Academic Project — Data Mining and Data Warehousing (DMDW) OEP**

**Project:** CustomerLens  
**Focus:** Customer Segmentation using Clustering
