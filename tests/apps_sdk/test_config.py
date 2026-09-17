# SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
# SPDX-License-Identifier: Apache-2.0

"""Tests for Apps SDK configuration defaults."""

from pathlib import Path

import pytest

from src.apps_sdk.config import AppsSdkSettings


def test_debug_mode_is_disabled_by_default(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    """Debug mode must require an explicit opt-in."""
    monkeypatch.chdir(tmp_path)
    monkeypatch.delenv("DEBUG", raising=False)

    settings = AppsSdkSettings()

    assert settings.debug is False


def test_debug_mode_can_be_enabled_explicitly(
    monkeypatch: pytest.MonkeyPatch, tmp_path: Path
) -> None:
    """Local development can still opt in to debug behavior."""
    monkeypatch.chdir(tmp_path)
    monkeypatch.setenv("DEBUG", "true")

    settings = AppsSdkSettings()

    assert settings.debug is True
