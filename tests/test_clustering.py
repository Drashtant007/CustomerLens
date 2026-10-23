import joblib
import numpy as np
import pandas as pd


DATA_PATH = "data/processed/customerlens_final.csv"
SCALER_PATH = "artifacts/models/scaler.joblib"
KMEANS_PATH = "artifacts/models/kmeans_k5.joblib"
KMEDOIDS_PATH = "artifacts/models/kmedoids_pam_k5.joblib"
CONFIG_PATH = "artifacts/models/feature_config.joblib"


def test_dataset_exists_and_has_expected_size():
    df = pd.read_csv(DATA_PATH)

    assert len(df) == 200
    assert len(df.columns) >= 5


def test_required_clustering_features_exist():
    df = pd.read_csv(DATA_PATH)
    config = joblib.load(CONFIG_PATH)

    cluster_features = config["cluster_features"]

    assert cluster_features == [
        "Annual Income (k$)",
        "Spending Score (1-100)"
    ]

    for feature in cluster_features:
        assert feature in df.columns


def test_clustering_features_have_no_missing_values():
    df = pd.read_csv(DATA_PATH)
    config = joblib.load(CONFIG_PATH)

    cluster_features = config["cluster_features"]

    assert df[cluster_features].isna().sum().sum() == 0


def test_optimal_k_is_five():
    config = joblib.load(CONFIG_PATH)

    assert config["optimal_k"] == 5


def test_kmeans_model_has_five_clusters():
    kmeans = joblib.load(KMEANS_PATH)

    assert kmeans.n_clusters == 5


def test_kmedoids_model_has_five_medoids():
    kmedoids = joblib.load(KMEDOIDS_PATH)

    assert kmedoids["k"] == 5
    assert len(kmedoids["medoid_indices"]) == 5
    assert len(kmedoids["medoid_points_scaled"]) == 5


def test_kmeans_can_assign_all_customers():
    df = pd.read_csv(DATA_PATH)
    config = joblib.load(CONFIG_PATH)

    scaler = joblib.load(SCALER_PATH)
    kmeans = joblib.load(KMEANS_PATH)

    cluster_features = config["cluster_features"]

    X = df[cluster_features]
    X_scaled = scaler.transform(X)

    X_scaled_df = pd.DataFrame(
        X_scaled,
        columns=cluster_features
    )

    labels = kmeans.predict(X_scaled_df)

    assert len(labels) == len(df)
    assert np.all(labels >= 0)
    assert np.all(labels < 5)


def test_kmedoids_can_assign_all_customers():
    df = pd.read_csv(DATA_PATH)
    config = joblib.load(CONFIG_PATH)

    scaler = joblib.load(SCALER_PATH)
    kmedoids = joblib.load(KMEDOIDS_PATH)

    cluster_features = config["cluster_features"]

    X = df[cluster_features]
    X_scaled = scaler.transform(X)

    medoid_points_scaled = np.asarray(
        kmedoids["medoid_points_scaled"]
    )

    distances = np.linalg.norm(
        X_scaled[:, np.newaxis, :]
        - medoid_points_scaled[np.newaxis, :, :],
        axis=2
    )

    labels = np.argmin(distances, axis=1)

    assert len(labels) == len(df)
    assert np.all(labels >= 0)
    assert np.all(labels < 5)