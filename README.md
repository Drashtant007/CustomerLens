# CustomerLens — Customer Segmentation Using K-Means and K-Medoids

CustomerLens is a Data Mining and Data Warehousing (DMDW) OEP project that performs customer segmentation using unsupervised clustering techniques.

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
- Annual Income vs Spending Score visualization
- Interactive Streamlit dashboard
- React-based analytics frontend
- Hypothetical customer cluster assignment
- Automated validation tests

---

## 1. Project Overview

Customer segmentation divides customers into groups with similar characteristics.

CustomerLens focuses on two primary clustering features:

- Annual Income (k$)
- Spending Score (1-100)

The objective is to identify meaningful customer groups and compare K-Means and K-Medoids clustering on the same customer dataset.

The project uses the Mall Customer Segmentation dataset containing 200 customer records.

> **Dataset note:** Spending Score is a behavioral score provided in the dataset and should not be interpreted as raw monetary spending.

---

## 2. Problem Statement

Businesses often have customers with different income levels and purchasing behaviors.

Treating all customers as one homogeneous group can make marketing and customer-management decisions less effective.

CustomerLens addresses this problem by applying unsupervised clustering techniques to identify customer segments based primarily on Annual Income and Spending Score.

---

## 3. Objectives

The main objectives are:

1. Perform data preprocessing and data-quality analysis.
2. Explore customer characteristics using EDA.
3. Select appropriate clustering features.
4. Standardize the clustering features.
5. Determine a suitable number of clusters using K evaluation techniques.
6. Implement K-Means clustering.
7. Implement K-Medoids clustering using the PAM approach.
8. Compare the clustering algorithms using clustering-quality metrics.
9. Create a 2D Annual Income vs Spending Score scatter plot with color-coded clusters.
10. Profile the resulting customer groups.
11. Provide descriptive business interpretations of the clusters.
12. Provide interactive interfaces for exploring the clustering results.

---

## 4. Dataset

The project uses the **Mall Customer Segmentation dataset**.

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

`CustomerID` is excluded because it is an identifier rather than a meaningful behavioral feature.

`Gender` and `Age` are retained for post-clustering profiling and interpretation rather than being used as the primary clustering dimensions.

### Dataset Selection

The assignment permits the use of the Yasserh customer segmentation dataset. CustomerLens uses the Mall Customer Segmentation dataset because it directly contains both **Annual Income** and **Spending Score**, which are required for the project's primary 2D visualization and clustering analysis.

---

## 5. Methodology

The project follows this workflow:

```text
Dataset
   ↓
Data Audit
   ↓
Preprocessing
   ↓
Feature Selection
   ↓
StandardScaler
   ↓
Optimal K Analysis
   ↓
K-Means + K-Medoids
   ↓
Cluster Evaluation
   ↓
Cluster Profiling
   ↓
Visualization
   ↓
Business Insights
   ↓
Interactive Interfaces
```

---

## 6. Preprocessing

The primary clustering features are standardized using `StandardScaler`.

This is important because the clustering algorithms rely on distance calculations and numerical variables should be placed on comparable scales.

The transformed feature matrix is used for both K-Means and K-Medoids.

No train-test split is used because this is an unsupervised clustering problem rather than a supervised prediction problem.

---

## 7. Optimal Number of Clusters

Values of `K` from 2 through 10 were evaluated.

### K-Means

The following measures were evaluated:

- Inertia
- Silhouette Score
- Davies-Bouldin Index

### K-Medoids

The following measures were evaluated:

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

Silhouette Score:

```text
0.554657
```

Davies-Bouldin Index:

```text
0.572236
```

### K-Medoids

Silhouette Score:

```text
0.556218
```

Davies-Bouldin Index:

```text
0.566089
```

Therefore, `K = 5` is used for the final clustering models.

---

## 9. Algorithm Comparison

| Metric | K-Means | K-Medoids |
|---|---:|---:|
| Optimal K | 5 | 5 |
| Silhouette Score | 0.554657 | 0.556218 |
| Davies-Bouldin Index | 0.572236 | 0.566089 |
| Runtime* | 0.164474 s | 0.076011 s |

\* Runtime values are specific to the implemented experiment, execution environment, and particular run. They should not be interpreted as a general statement that K-Medoids is faster than K-Means.

For this dataset and experiment, K-Medoids achieved a slightly higher Silhouette Score and slightly lower Davies-Bouldin Index than K-Means.

The differences are small, indicating that both algorithms produce strong and highly similar segmentation results.

---

## 10. Evaluation Metrics

### Silhouette Score

The Silhouette Score measures how similar an observation is to its own cluster compared with other clusters.

Higher values generally indicate better cluster cohesion and separation.

### Davies-Bouldin Index

The Davies-Bouldin Index evaluates the similarity between clusters.

Lower values generally indicate better clustering quality.

### Adjusted Rand Index

An Adjusted Rand Index (ARI) was calculated to compare the two resulting cluster partitions.

The measured ARI was:

```text
0.9597
```

This indicates very high agreement between the K-Means and K-Medoids cluster assignments.

ARI is a comparison metric between partitions and should not be interpreted as clustering accuracy.

---

## 11. K-Means

K-Means partitions customers into `K` groups by assigning observations to cluster centroids and iteratively updating those centroids.

The final model uses:

```text
K = 5
```

The trained model is stored at:

```text
artifacts/models/kmeans_k5.joblib
```

---

## 12. K-Medoids

K-Medoids is a partitioning clustering method similar to K-Means but uses actual observations as cluster representatives called medoids.

CustomerLens implements the PAM-style approach using NumPy and pairwise Euclidean distances.

The final model uses:

```text
K = 5
```

The saved model information is stored at:

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

- K-Means → Centroid
- K-Medoids → Medoid

The visualization allows the resulting customer groups to be examined in the original income and spending-score feature space.

---

## 14. Interactive Applications

CustomerLens provides two interfaces for exploring the validated clustering results.

### 14.1 Streamlit Dashboard

The Streamlit dashboard provides the following sections:

#### Overview

Provides a high-level summary of the dataset, models, metrics, and project configuration.

#### Data Quality & EDA

Provides:

- Dataset statistics
- Missing-value analysis
- Feature distributions
- Exploratory visualizations
- Descriptive statistics

#### Optimal K

Displays the evaluation of K values from 2 to 10 using clustering-quality metrics.

#### Cluster Explorer

Allows users to inspect individual clusters and view:

- Customer count
- Average income
- Average spending
- Average age
- Customer records
- Centroids or medoids

#### Algorithm Comparison

Compares K-Means and K-Medoids using:

- Silhouette Score
- Davies-Bouldin Index
- Runtime
- Cluster characteristics
- Adjusted Rand Index

#### Business Insights

Provides cluster profiles and descriptive segment interpretations.

#### Customer Explorer

Allows a hypothetical customer to be entered using:

- Annual Income
- Spending Score

The application assigns the hypothetical customer to the nearest existing cluster.

This is a cluster-assignment tool and is **not** a spending prediction model.

---

### 14.2 React Frontend

CustomerLens also includes a React-based analytics frontend.

The frontend provides:

- Overview
- Data Quality
- Optimal K
- Cluster Explorer
- Algorithm Comparison
- Business Insights
- Customer Explorer

The React application consumes validated project results exported from the Python artifacts.

The frontend does not independently retrain the clustering models.

The data flow is:

```text
Python Analysis
      ↓
Saved CSV Results
      ↓
export_frontend_data.py
      ↓
frontend/public/data/customerlens.json
      ↓
React Frontend
```

This keeps the frontend visualization consistent with the validated Python analysis.

---

## 15. Project Structure

```text
CustomerLens/
│
├── app.py
├── README.md
├── requirements.txt
├── .gitignore
├── export_frontend_data.py
│
├── data/
│   ├── raw/
│   │   └── Mall_Customers.csv
│   │
│   └── processed/
│       ├── clustering_features_scaled.csv
│       ├── customerlens_final.csv
│       ├── customers_audited.csv
│       ├── customers_with_cluster_assignments.csv
│       └── final_customer_segmentation.csv
│
├── artifacts/
│   ├── models/
│   │   ├── feature_config.joblib
│   │   ├── kmeans_k5.joblib
│   │   ├── kmedoids_pam_k5.joblib
│   │   └── scaler.joblib
│   │
│   ├── results/
│   │   ├── cluster_assignment_comparison.csv
│   │   ├── final_algorithm_comparison.csv
│   │   ├── final_business_segment_profile.csv
│   │   ├── kmeans_cluster_profiles.csv
│   │   ├── kmeans_optimal_k_results.csv
│   │   ├── kmedoids_cluster_profiles.csv
│   │   ├── kmedoids_optimal_k_results.csv
│   │   └── segment_business_insights.csv
│   │
│   └── figures/
│       └── kmeans_customer_segmentation.png
│
├── frontend/
│   ├── public/
│   │   └── data/
│   │       └── customerlens.json
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── data/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   │
│   ├── package.json
│   └── vite.config.ts
│
├── notebooks/
│   └── 01_data_audit_and_eda.ipynb
│
├── src/
│   └── __init__.py
│
└── tests/
    └── test_clustering.py
```

---

## 16. Installation

Clone the repository and enter the project directory.

Create a Python virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```powershell
.venv\Scripts\Activate.ps1
```

Install Python dependencies:

```bash
pip install -r requirements.txt
```

### Frontend dependencies

Enter the frontend directory:

```powershell
cd frontend
```

Install Node.js dependencies:

```powershell
npm install
```

---

## 17. Running the Streamlit Dashboard

From the project root:

```bash
streamlit run app.py
```

The Streamlit application will open in the browser.

---

## 18. Running the React Frontend

From the project root:

```powershell
npm --prefix frontend run dev
```

The Vite development server will start and display its local URL in the terminal.

For a production build:

```powershell
npm --prefix frontend run build
```

---

## 19. Updating Frontend Data

The React frontend consumes the generated file:

```text
frontend/public/data/customerlens.json
```

To regenerate this file from the current Python results:

```powershell
python export_frontend_data.py
```

The exporter reads the validated project artifacts and creates the frontend JSON dataset.

---

## 20. Running Tests

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

The frontend was additionally validated with:

```powershell
npm --prefix frontend run build
```

and:

```powershell
npm --prefix frontend run lint
```

Both completed successfully in the validated project state.

---

## 21. Reproducibility

The project stores validated models, preprocessing artifacts, evaluation results, processed datasets, and frontend data.

Important locations include:

```text
artifacts/models/
artifacts/results/
data/processed/
frontend/public/data/customerlens.json
```

The saved scaler, clustering models, configuration, evaluation results, and exported frontend data allow the applications to display the validated project results without retraining the models every time.

---

## 22. Limitations

1. The dataset contains only 200 customers.
2. The primary clustering analysis uses only Annual Income and Spending Score.
3. Spending Score is a behavioral score rather than a direct monetary spending measurement.
4. Cluster labels do not represent predefined customer categories.
5. Descriptive business segment names are interpretations derived from cluster statistics.
6. Results may differ when applied to another dataset or customer population.
7. Runtime comparisons are specific to the implementation and execution environment.
8. The dataset is suitable for demonstrating clustering methodology but is not necessarily representative of a real-world customer population.

---

## 23. Academic Relevance

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
- Data-driven customer segmentation

The project therefore provides a practical implementation of clustering concepts covered in the DMDW curriculum.

---

## 24. Conclusion

CustomerLens successfully applies K-Means and K-Medoids clustering to customer segmentation using Annual Income and Spending Score.

Both algorithms identified five customer groups, with `K = 5` supported by the evaluated clustering-quality metrics.

For the final K=5 models, K-Medoids achieved a slightly higher Silhouette Score and slightly lower Davies-Bouldin Index than K-Means for this dataset and experiment. The high Adjusted Rand Index of `0.9597` also indicates strong agreement between the two clustering solutions.

The resulting applications provide interactive environments for exploring customer segments, comparing clustering algorithms, understanding cluster characteristics, visualizing the Income vs Spending Score relationship, and assigning hypothetical customers to existing clusters.

---

## 25. Technologies Used

### Data Science / Machine Learning

- Python
- Pandas
- NumPy
- Scikit-learn
- Matplotlib
- Seaborn
- Joblib
- Jupyter Notebook

### Applications

- Streamlit
- React
- Vite
- TypeScript
- Tailwind CSS
- Recharts
- Lucide React
- Base UI

### Development / Testing

- Pytest
- ESLint
- Git
- GitHub

---

## 26. Project Type

**Academic Project — Data Mining and Data Warehousing (DMDW) OEP**

**Project:** CustomerLens

**Focus:** Customer Segmentation Using Clustering

**Primary Algorithms:** K-Means and K-Medoids (PAM)

**Optimal K:** 5