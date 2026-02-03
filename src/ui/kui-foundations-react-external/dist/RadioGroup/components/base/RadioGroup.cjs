/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
// foundations-css import removed
var react = require('react');
var Label = require('../../../Label/index.cjs');
var RadioGroupItem = require('../composed/RadioGroupItem.cjs');
var RadioGroupRoot = require('../composed/RadioGroupRoot.cjs');

const RadioGroup = react.forwardRef(
  ({ error, labelSide, items, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(RadioGroupRoot.RadioGroupRoot, { ref, error, ...props, children: items.map(({ attributes, ...option }) => /* @__PURE__ */ jsxRuntime.jsx(
      RadioGroupItem.RadioGroupItem,
      {
        "aria-labelledby": `${option.value}-label`,
        labelSide,
        ...option,
        ...attributes?.RadioGroupItem,
        children: option.children && /* @__PURE__ */ jsxRuntime.jsx(
          Label.Label,
          {
            id: `${option.value}-label`,
            htmlFor: option.value,
            disabled: option.disabled,
            ...attributes?.Label,
            children: option.children
          }
        )
      },
      option.value
    )) });
  }
);
RadioGroup.displayName = "RadioGroup";

exports.RadioGroup = RadioGroup;
