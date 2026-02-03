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
var Menu = require('../../../Menu/index.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

const DropdownSection = react.forwardRef(
  (props, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(
      Menu.MenuSection,
      {
        ...mergeProps.mergeProps(
          { ref, "data-testid": constants.DropdownTestIds.DropdownSection },
          props
        )
      }
    );
  }
);
DropdownSection.displayName = "DropdownSection";

exports.DropdownSection = DropdownSection;
