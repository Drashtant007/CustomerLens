from __future__ import annotations

import csv
import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Any

from mcp.server import MCPServer


# ============================================================
# CustomerLens MCP Server
# ============================================================

mcp = MCPServer(
    name="CustomerLens",
    version="1.0.0",
    description=(
        "Project-specific MCP server for the CustomerLens "
        "Data Mining and Data Warehousing OEP project."
    ),
)


# ============================================================
# PROJECT ROOT
# ============================================================

ROOT = Path(
    os.environ.get(
        "CUSTOMERLENS_ROOT",
        Path(__file__).resolve().parents[1],
    )
).resolve()


# ============================================================
# HELPERS
# ============================================================

def _python() -> str:
    """Return the CustomerLens virtual-environment Python."""
    venv_python = ROOT / ".venv" / "Scripts" / "python.exe"

    if venv_python.exists():
        return str(venv_python)

    return sys.executable


def _run(
    command: list[str],
    cwd: Path = ROOT,
    timeout: int = 300,
) -> dict[str, Any]:
    """Run a controlled project command."""
    try:
        result = subprocess.run(
            command,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=timeout,
            encoding="utf-8",
            errors="replace",
        )

        return {
            "command": " ".join(command),
            "returncode": result.returncode,
            "passed": result.returncode == 0,
            "stdout": result.stdout.strip(),
            "stderr": result.stderr.strip(),
        }

    except subprocess.TimeoutExpired:
        return {
            "command": " ".join(command),
            "returncode": -1,
            "passed": False,
            "stdout": "",
            "stderr": "Command timed out.",
        }

    except FileNotFoundError as exc:
        return {
            "command": " ".join(command),
            "returncode": -1,
            "passed": False,
            "stdout": "",
            "stderr": f"Executable not found: {exc.filename}",
        }

    except OSError as exc:
        return {
            "command": " ".join(command),
            "returncode": -1,
            "passed": False,
            "stdout": "",
            "stderr": f"OS error while running command: {exc}",
        }


def _read_json(path: Path) -> Any:
    """Read a UTF-8 JSON file."""
    return json.loads(
        path.read_text(encoding="utf-8")
    )


# ============================================================
# TOOL 1 — PROJECT STATUS
# ============================================================

@mcp.tool()
def project_status() -> dict[str, Any]:
    """
    Inspect the CustomerLens project and verify important files.
    """

    expected_files = [
        "app.py",
        "README.md",
        "requirements.txt",
        "export_frontend_data.py",
        "data/raw/Mall_Customers.csv",
        "tests/test_clustering.py",
        "frontend/package.json",
        "frontend/public/data/customerlens.json",
        "notebooks/CustomerLens_OEP_Report.docx",
    ]

    files = {}

    for relative_path in expected_files:
        files[relative_path] = (
            ROOT / relative_path
        ).exists()

    return {
        "project_root": str(ROOT),
        "expected_files": files,
        "all_expected_present": all(files.values()),
    }


# ============================================================
# TOOL 2 — PROJECT METRICS
# ============================================================

@mcp.tool()
def get_metrics() -> dict[str, Any]:
    """
    Read the actual recorded CustomerLens clustering metrics.

    This tool never invents or recalculates project results.
    """

    data_path = (
        ROOT
        / "frontend"
        / "public"
        / "data"
        / "customerlens.json"
    )

    if not data_path.exists():
        return {
            "passed": False,
            "error": (
                "customerlens.json is missing. "
                "Run export_frontend_data first."
            ),
        }

    data = _read_json(data_path)

    return {
        "passed": True,
        "meta": data.get("meta", {}),
        "algorithm_comparison": data.get(
            "algorithm_comparison",
            [],
        ),
        "kmeans_optimal_k": data.get(
            "kmeans_optimal_k",
            [],
        ),
        "kmedoids_optimal_k": data.get(
            "kmedoids_optimal_k",
            [],
        ),
        "business_segments": data.get(
            "business_segments",
            [],
        ),
    }


# ============================================================
# TOOL 3 — EXPORT FRONTEND DATA
# ============================================================

@mcp.tool()
def export_frontend_data() -> dict[str, Any]:
    """
    Regenerate frontend/public/data/customerlens.json
    from the project's existing CSV artifacts.
    """

    script = ROOT / "export_frontend_data.py"

    if not script.exists():
        return {
            "passed": False,
            "error": (
                "export_frontend_data.py was not found."
            ),
        }

    result = _run(
        [
            _python(),
            str(script),
        ],
        timeout=120,
    )

    output = (
        ROOT
        / "frontend"
        / "public"
        / "data"
        / "customerlens.json"
    )

    result["output_exists"] = output.exists()

    return result


# ============================================================
# TOOL 4 — PYTEST
# ============================================================

@mcp.tool()
def run_tests() -> dict[str, Any]:
    """
    Run the CustomerLens clustering test suite.
    """

    return _run(
        [
            _python(),
            "-m",
            "pytest",
            "tests/test_clustering.py",
            "-v",
        ],
        timeout=180,
    )


# ============================================================
# TOOL 5 — FRONTEND BUILD + LINT
# ============================================================

@mcp.tool()
def run_frontend_checks() -> dict[str, Any]:
    """
    Run the React production build and ESLint checks.
    """

    build = _run(
        [
            "npm.cmd",
            "--prefix",
            "frontend",
            "run",
            "build",
        ],
        timeout=180,
    )

    lint = _run(
        [
            "npm.cmd",
            "--prefix",
            "frontend",
            "run",
            "lint",
        ],
        timeout=180,
    )

    return {
        "build": build,
        "lint": lint,
        "passed": (
            build["passed"]
            and lint["passed"]
        ),
    }


# ============================================================
# TOOL 6 — GIT STATUS
# ============================================================

@mcp.tool()
def git_status() -> dict[str, Any]:
    """
    Inspect the current Git branch, working tree,
    and latest commits.
    """

    status = _run(
        [
            "git",
            "status",
            "--short",
            "--branch",
        ],
        timeout=30,
    )

    log = _run(
        [
            "git",
            "log",
            "-3",
            "--oneline",
        ],
        timeout=30,
    )

    return {
        "status": status,
        "recent_commits": log,
    }


# ============================================================
# TOOL 7 — FINAL AUDIT
# ============================================================

@mcp.tool()
def final_audit() -> dict[str, Any]:
    """
    Run a complete CustomerLens submission-readiness audit.

    Checks:
    - expected project files
    - clustering tests
    - React build
    - ESLint
    - recorded project metrics
    - Git status
    """

    project = project_status()
    tests = run_tests()
    frontend = run_frontend_checks()
    metrics = get_metrics()
    git = git_status()

    git_clean = (
        git["status"]["passed"]
        and not git["status"]["stdout"]
        .replace("## master...origin/master", "")
        .strip()
    )

    ready = (
        project["all_expected_present"]
        and tests["passed"]
        and frontend["passed"]
        and metrics["passed"]
        and git_clean
    )

    return {
        "status": (
            "READY"
            if ready
            else "NEEDS_ATTENTION"
        ),
        "project": project,
        "tests": tests,
        "frontend": frontend,
        "metrics": metrics,
        "git": git,
        "git_clean": git_clean,
    }


# ============================================================
# SERVER ENTRY POINT
# ============================================================

if __name__ == "__main__":
    mcp.run()
