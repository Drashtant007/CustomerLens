# CustomerLens OEP Skill

## Purpose

You are assisting with the CustomerLens DMDW Open Ended Project. Treat the repository as an academic project whose results must remain reproducible and internally consistent.

## Project facts

- Title: CustomerLens — Customer Segmentation Using K-Means and K-Medoids Clustering with Optimal-K Selection and Interactive Analytics.
- Dataset: Mall Customer Segmentation Data.
- Dataset size: 200 customers.
- Primary clustering features:
  - Annual Income (k$)
  - Spending Score (1-100)
- CustomerID is excluded from clustering.
- Gender and Age are retained for post-clustering profiling.
- Scaling: StandardScaler.
- Algorithms: K-Means and K-Medoids (PAM).
- Optimal K: 5 for both algorithms.
- K-Means silhouette at K=5: 0.554657.
- K-Medoids silhouette at K=5: 0.556218.
- K-Means Davies-Bouldin at K=5: 0.572236.
- K-Medoids Davies-Bouldin at K=5: 0.566089.
- ARI: 0.9597. Describe ARI as agreement between partitions, never as accuracy.
- Recorded runtimes:
  - K-Means: 0.164474 s
  - K-Medoids PAM: 0.076011 s
- Do not claim K-Medoids is generally faster; runtime is implementation/run-specific.
- Do not compare K-Means inertia directly with K-Medoids medoid cost as though they were the same objective.

## Required academic features

The project must visibly demonstrate:
1. preprocessing
2. clustering
3. K-Means
4. K-Medoids
5. Elbow/Bend-in-Knee analysis for K
6. 2D Annual Income vs Spending Score scatter plots, color-coded by cluster

## Source-of-truth rule

Never fabricate, round away, or silently replace project results. Prefer the project's generated CSV/JSON artifacts. If a requested claim is not supported by project artifacts, state that clearly.

## Safe workflow

Before major changes:
1. inspect git status
2. inspect relevant project files
3. run tests when touching clustering logic
4. run frontend build/lint when touching frontend
5. preserve existing working behavior
6. report exactly what changed

For final readiness, use the MCP `final_audit` tool if available.

## Reporting rules

When preparing the OEP report or PPT:
- keep terminology aligned with the project
- use actual measured values
- distinguish objective functions from evaluation metrics
- explain why K=5 is selected using the project's evidence
- include limitations, especially that Spending Score is a behavioral score supplied by the dataset
- do not claim general business conclusions beyond what the dataset supports

## Files

Important locations:
- `data/raw/Mall_Customers.csv`
- `data/processed/`
- `artifacts/results/`
- `artifacts/models/`
- `frontend/public/data/customerlens.json`
- `frontend/src/`
- `tests/test_clustering.py`
- `export_frontend_data.py`
- `app.py`
- `notebooks/CustomerLens_OEP_Report.docx`

## MCP tool usage

Use these tools when exposed by the CustomerLens MCP server:
- `project_status`: inspect expected project files
- `get_metrics`: read recorded metrics
- `export_frontend_data`: regenerate frontend JSON from artifacts
- `run_tests`: validate clustering
- `run_frontend_checks`: validate React build and lint
- `git_status`: inspect repository state
- `final_audit`: run the complete safe submission audit

Do not add a generic arbitrary shell/command-execution tool. Keep project operations explicit and auditable.
