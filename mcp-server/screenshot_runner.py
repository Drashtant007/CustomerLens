from __future__ import annotations

import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = ROOT / "artifacts" / "screenshots"
BASE_URL = "http://127.0.0.1:5173"

VIEWS = [
    ("01_overview", "Overview"),
    ("02_data_quality", "Data Quality"),
    ("03_optimal_k", "Optimal K"),
    ("04_cluster_explorer", "Cluster Explorer"),
    ("05_algorithm_comparison", "Algorithm Comparison"),
    ("06_business_insights", "Business Insights"),
    ("07_customer_explorer", "Customer Explorer"),
]


def capture_screenshots() -> int:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print("=" * 60)
    print("CustomerLens Screenshot Runner")
    print("=" * 60)
    print(f"URL: {BASE_URL}")
    print(f"Output: {OUTPUT_DIR}")
    print()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        page = browser.new_page(
            viewport={"width": 1600, "height": 1000},
            device_scale_factor=1,
        )

        print("Opening CustomerLens...")
        page.goto(BASE_URL, wait_until="networkidle")

        # Allow charts/animations to finish rendering.
        page.wait_for_timeout(2000)

        print(f"Page title: {page.title()}")
        print()

        successful = 0

        for filename, label in VIEWS:
            print(f"[{successful + 1}/{len(VIEWS)}] Capturing: {label}")

            try:
                # Locate the sidebar navigation item by its visible text.
                nav_item = page.get_by_text(label, exact=True).first

                nav_item.wait_for(
                    state="visible",
                    timeout=10000,
                )

                nav_item.click()

                # Give React time to update the view and charts time to render.
                page.wait_for_timeout(1200)

                # Wait until the page has settled.
                try:
                    page.wait_for_load_state(
                        "networkidle",
                        timeout=3000,
                    )
                except PlaywrightTimeoutError:
                    pass

                page.wait_for_timeout(800)

                output_file = OUTPUT_DIR / f"{filename}.png"

                page.screenshot(
                    path=str(output_file),
                    full_page=True,
                )

                print(f"    OK -> {output_file}")
                successful += 1

            except Exception as exc:
                print(f"    FAILED -> {exc}")

        browser.close()

    print()
    print("=" * 60)
    print(f"Captured: {successful}/{len(VIEWS)}")
    print("=" * 60)

    return 0 if successful == len(VIEWS) else 1


if __name__ == "__main__":
    sys.exit(capture_screenshots())
