/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
import { within, expect } from 'storybook/test';

const buildDefaultMeta = (options = {}) => {
  const { role, testId, component: Component } = options;
  return {
    play: async ({ canvasElement }) => {
      if (role || testId) {
        const canvas = within(canvasElement);
        const element = role ? canvas.getAllByRole(role) : canvas.getAllByTestId(testId);
        await expect(element[0]).toBeVisible();
      }
    },
    ...Component ? {
      component: Component,
      render: (args) => /* @__PURE__ */ jsx(Component, { ...args })
    } : {}
  };
};
const DEFAULT_META = buildDefaultMeta();

export { DEFAULT_META, buildDefaultMeta };
