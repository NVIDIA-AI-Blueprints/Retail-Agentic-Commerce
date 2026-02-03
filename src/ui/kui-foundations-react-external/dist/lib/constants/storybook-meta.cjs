/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
var test = require('storybook/test');

const buildDefaultMeta = (options = {}) => {
  const { role, testId, component: Component } = options;
  return {
    play: async ({ canvasElement }) => {
      if (role || testId) {
        const canvas = test.within(canvasElement);
        const element = role ? canvas.getAllByRole(role) : canvas.getAllByTestId(testId);
        await test.expect(element[0]).toBeVisible();
      }
    },
    ...Component ? {
      component: Component,
      render: (args) => /* @__PURE__ */ jsxRuntime.jsx(Component, { ...args })
    } : {}
  };
};
const DEFAULT_META = buildDefaultMeta();

exports.DEFAULT_META = DEFAULT_META;
exports.buildDefaultMeta = buildDefaultMeta;
