from __future__ import annotations

import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeoutError


ROOT = Path(__file__).resolve().parents[1]

BASE_URL = "http://127.0.0.1:8501"

OUTPUT_ROOT = ROOT / "artifacts" / "screenshots" / "streamlit"

# The sidebar in the current CustomerLens Streamlit UI.
# These coordinates correspond to a 1600x1000 browser viewport.
SIDEBAR_X = 100

PAGES = [
    ("01_overview", "Overview", 541),
    ("02_data_quality", "Data Quality & EDA", 563),
    ("03_optimal_k", "Optimal K", 585),
    ("04_cluster_explorer", "Cluster Explorer", 606),
    ("05_algorithm_comparison", "Algorithm Comparison", 628),
    ("06_business_insights", "Business Insights", 649),
    ("07_customer_explorer", "Customer Explorer", 671),
]


VIEWPORT_WIDTH = 1600
VIEWPORT_HEIGHT = 1000

# Overlap prevents charts/text from being cut exactly at viewport boundaries.
OVERLAP = 120

SCROLL_STEP = VIEWPORT_HEIGHT - OVERLAP


def wait_for_streamlit(page):
    print("Waiting for Streamlit application...")

    page.wait_for_load_state("domcontentloaded")

    # Give Streamlit time to finish its websocket rendering.
    page.wait_for_timeout(4000)

    # Wait for the main Streamlit app container.
    try:
        page.locator('[data-testid="stAppViewContainer"]').wait_for(
            state="visible",
            timeout=15000,
        )
    except PlaywrightTimeoutError:
        print("  Warning: Streamlit app container was not detected.")

    page.wait_for_timeout(2500)

    print("Streamlit loaded.")


def scroll_to_top(page):
    page.evaluate(
        """
        () => {
            window.scrollTo(0, 0);

            const containers = [
                document.querySelector('[data-testid="stAppViewContainer"]'),
                document.querySelector('[data-testid="stMain"]'),
                document.querySelector('section.main'),
            ];

            for (const el of containers) {
                if (el) {
                    try {
                        el.scrollTop = 0;
                    } catch (_) {}
                }
            }
        }
        """
    )

    page.wait_for_timeout(800)


def get_scroll_height(page):
    return page.evaluate(
        """
        () => {
            const candidates = [
                document.documentElement,
                document.body,
                document.querySelector('[data-testid="stAppViewContainer"]'),
                document.querySelector('[data-testid="stMain"]'),
                document.querySelector('section.main')
            ].filter(Boolean);

            let height = document.documentElement.scrollHeight;

            for (const el of candidates) {
                height = Math.max(
                    height,
                    el.scrollHeight || 0,
                    el.clientHeight || 0
                );
            }

            return height;
        }
        """
    )


def scroll_window(page, y):
    page.evaluate(
        """
        (y) => {
            window.scrollTo(0, y);

            const containers = [
                document.querySelector('[data-testid="stAppViewContainer"]'),
                document.querySelector('[data-testid="stMain"]'),
                document.querySelector('section.main')
            ];

            for (const el of containers) {
                if (el && el.scrollHeight > el.clientHeight) {
                    el.scrollTop = y;
                }
            }
        }
        """,
        y,
    )

    page.wait_for_timeout(1000)


def capture_page(page, folder_name, label):
    output_dir = OUTPUT_ROOT / folder_name
    output_dir.mkdir(parents=True, exist_ok=True)

    # Remove old captures so stale screenshots do not get mixed with new ones.
    for old_file in output_dir.glob("*.png"):
        old_file.unlink()

    print(f"\n  Capturing scroll sections for: {label}")

    scroll_to_top(page)
    page.wait_for_timeout(1000)

    total_height = get_scroll_height(page)

    print(f"  Detected page height: {total_height}px")

    positions = []

    y = 0

    while True:
        if y not in positions:
            positions.append(y)

        if y + VIEWPORT_HEIGHT >= total_height:
            break

        next_y = y + SCROLL_STEP

        if next_y >= total_height:
            next_y = max(0, total_height - VIEWPORT_HEIGHT)

        if next_y == y:
            break

        y = next_y

    captured = []

    for index, scroll_y in enumerate(positions, start=1):

        scroll_window(page, scroll_y)

        # Extra rendering time for charts and Streamlit elements.
        page.wait_for_timeout(900)

        filename = output_dir / f"{index:02d}.png"

        page.screenshot(
            path=str(filename),
            full_page=False,
        )

        captured.append(filename)

        print(
            f"    ✓ {index:02d}.png "
            f"(scroll={scroll_y}px)"
        )

    print(f"  Captured {len(captured)} sections.")

    return captured


def select_sidebar_page(page, label, y):
    print(f"  Selecting: {label}")

    # Always start from the top because the sidebar coordinates
    # correspond to the normal initial Streamlit viewport.
    scroll_to_top(page)

    page.wait_for_timeout(500)

    # Click the actual visible sidebar position.
    page.mouse.click(SIDEBAR_X, y)

    page.wait_for_timeout(2500)

    # Allow Streamlit rerun + chart rendering.
    page.wait_for_timeout(2000)

    return True


def main():

    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)

    print("=" * 70)
    print("CustomerLens Streamlit SCROLL-BY-SCROLL Screenshot Capture")
    print("=" * 70)
    print(f"URL: {BASE_URL}")
    print(f"Output: {OUTPUT_ROOT}")
    print()
    print(
        f"Viewport: {VIEWPORT_WIDTH} x {VIEWPORT_HEIGHT}"
    )
    print(
        f"Scroll step: {SCROLL_STEP}px "
        f"with {OVERLAP}px overlap"
    )

    results = {}

    with sync_playwright() as p:

        browser = p.chromium.launch(
            headless=True
        )

        context = browser.new_context(
            viewport={
                "width": VIEWPORT_WIDTH,
                "height": VIEWPORT_HEIGHT,
            },
            device_scale_factor=1,
        )

        page = context.new_page()

        print("\nOpening Streamlit application...")

        try:
            page.goto(
                BASE_URL,
                wait_until="domcontentloaded",
                timeout=30000,
            )
        except Exception as exc:
            print(f"ERROR: Could not open Streamlit: {exc}")
            browser.close()
            return 1

        wait_for_streamlit(page)

        # Capture every requested page.
        for folder_name, label, y in PAGES:

            print("\n" + "-" * 70)
            print(f"PAGE: {label}")
            print("-" * 70)

            try:

                select_sidebar_page(
                    page,
                    label,
                    y,
                )

                captures = capture_page(
                    page,
                    folder_name,
                    label,
                )

                results[label] = len(captures)

            except Exception as exc:

                print(
                    f"  ✗ FAILED: {label}"
                )
                print(
                    f"    Error: {exc}"
                )

                results[label] = 0

        browser.close()

    print("\n")
    print("=" * 70)
    print("SCREENSHOT SUMMARY")
    print("=" * 70)

    total = 0

    for label, count in results.items():

        if count > 0:
            print(
                f"✓ {label:<30} {count} sections"
            )
            total += count
        else:
            print(
                f"✗ {label:<30} FAILED"
            )

    print("-" * 70)
    print(
        f"Total viewport screenshots captured: {total}"
    )
    print(
        f"Output: {OUTPUT_ROOT}"
    )
    print("=" * 70)

    return 0 if total > 0 else 1


if __name__ == "__main__":
    sys.exit(main())

