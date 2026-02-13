"""Architecture tests for protocol package boundaries."""

from __future__ import annotations

import ast
from pathlib import Path

PROTOCOLS_ROOT = Path("src/merchant/protocols")


def _find_cross_imports(protocol: str, forbidden_protocol: str) -> list[str]:
    violations: list[str] = []
    base = PROTOCOLS_ROOT / protocol
    forbidden_prefix = f"src.merchant.protocols.{forbidden_protocol}"

    for py_file in base.rglob("*.py"):
        tree = ast.parse(py_file.read_text(encoding="utf-8"))
        for node in ast.walk(tree):
            if isinstance(node, ast.ImportFrom):
                module = node.module or ""
                if module.startswith(forbidden_prefix):
                    violations.append(f"{py_file}:{node.lineno} imports {module}")
            elif isinstance(node, ast.Import):
                for alias in node.names:
                    if alias.name.startswith(forbidden_prefix):
                        violations.append(
                            f"{py_file}:{node.lineno} imports {alias.name}"
                        )
    return violations


def test_acp_does_not_import_ucp_modules() -> None:
    violations = _find_cross_imports(protocol="acp", forbidden_protocol="ucp")
    assert violations == []


def test_ucp_does_not_import_acp_modules() -> None:
    violations = _find_cross_imports(protocol="ucp", forbidden_protocol="acp")
    assert violations == []
