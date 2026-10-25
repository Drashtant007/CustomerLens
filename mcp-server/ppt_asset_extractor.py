from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "artifacts" / "screenshots" / "streamlit"
OUTPUT = ROOT / "artifacts" / "ppt_assets"

OUTPUT.mkdir(parents=True, exist_ok=True)

FILES = {
    "overview": "01_overview.png",
    "data_quality": "02_data_quality.png",
    "optimal_k": "03_optimal_k.png",
    "cluster_explorer": "04_cluster_explorer.png",
    "algorithm_comparison": "05_algorithm_comparison.png",
    "business_insights": "06_business_insights.png",
    "customer_explorer": "07_customer_explorer.png",
}


def crop_relative(img, name, box):
    """
    box = (left%, top%, right%, bottom%)
    """
    w, h = img.size

    left = int(w * box[0])
    top = int(h * box[1])
    right = int(w * box[2])
    bottom = int(h * box[3])

    crop = img.crop((left, top, right, bottom))

    # Add a small white border for clean PPT placement.
    crop = ImageOps.expand(crop, border=8, fill="white")

    output = OUTPUT / name
    crop.save(output, quality=95)

    print(f"  ✓ {name:42} {crop.width}x{crop.height}")


def main():
    print("=" * 72)
    print("CustomerLens PPT VISUAL ASSET EXTRACTION")
    print("=" * 72)
    print(f"Source : {SOURCE}")
    print(f"Output : {OUTPUT}")
    print()

    if not SOURCE.exists():
        print("ERROR: Streamlit screenshot directory does not exist.")
        return 1

    missing = []

    for key, filename in FILES.items():
        if not (SOURCE / filename).exists():
            missing.append(filename)

    if missing:
        print("Missing screenshots:")
        for item in missing:
            print(f"  - {item}")
        print()
        print("Run the screenshot capture first.")
        return 1

    print("Reading screenshots...")
    print()

    for key, filename in FILES.items():
        path = SOURCE / filename
        img = Image.open(path)

        print(f"{filename}: {img.width}x{img.height}")

        # Save a clean central dashboard view.
        crop_relative(
            img,
            f"{key}_dashboard.png",
            (0.18, 0.03, 0.99, 0.97)
        )

    print()
    print("Creating focused PPT assets...")
    print()

    # ------------------------------------------------------------------
    # DATA QUALITY / EDA
    # ------------------------------------------------------------------
    img = Image.open(SOURCE / FILES["data_quality"])

    crop_relative(
        img,
        "01_dataset_overview.png",
        (0.18, 0.04, 0.99, 0.30)
    )

    crop_relative(
        img,
        "02_feature_distributions.png",
        (0.18, 0.28, 0.99, 0.68)
    )

    crop_relative(
        img,
        "03_eda_relationships.png",
        (0.18, 0.55, 0.99, 0.92)
    )

    # ------------------------------------------------------------------
    # OPTIMAL K
    # ------------------------------------------------------------------
    img = Image.open(SOURCE / FILES["optimal_k"])

    crop_relative(
        img,
        "04_optimal_k.png",
        (0.18, 0.03, 0.99, 0.97)
    )

    # ------------------------------------------------------------------
    # CLUSTER EXPLORER
    # ------------------------------------------------------------------
    img = Image.open(SOURCE / FILES["cluster_explorer"])

    crop_relative(
        img,
        "05_kmeans_segmentation.png",
        (0.18, 0.10, 0.99, 0.65)
    )

    crop_relative(
        img,
        "06_cluster_profile.png",
        (0.18, 0.55, 0.99, 0.90)
    )

    # ------------------------------------------------------------------
    # ALGORITHM COMPARISON
    # ------------------------------------------------------------------
    img = Image.open(SOURCE / FILES["algorithm_comparison"])

    crop_relative(
        img,
        "07_algorithm_comparison.png",
        (0.18, 0.04, 0.99, 0.92)
    )

    # ------------------------------------------------------------------
    # BUSINESS INSIGHTS
    # ------------------------------------------------------------------
    img = Image.open(SOURCE / FILES["business_insights"])

    crop_relative(
        img,
        "08_business_insights.png",
        (0.18, 0.04, 0.99, 0.90)
    )

    # ------------------------------------------------------------------
    # CUSTOMER EXPLORER
    # ------------------------------------------------------------------
    img = Image.open(SOURCE / FILES["customer_explorer"])

    crop_relative(
        img,
        "09_customer_explorer.png",
        (0.18, 0.04, 0.99, 0.90)
    )

    print()
    print("=" * 72)
    print("EXTRACTION COMPLETE")
    print("=" * 72)

    outputs = sorted(OUTPUT.glob("*.png"))

    print(f"Assets created: {len(outputs)}")
    print(f"Location: {OUTPUT}")
    print()

    for item in outputs:
        print(f"  {item.name}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
