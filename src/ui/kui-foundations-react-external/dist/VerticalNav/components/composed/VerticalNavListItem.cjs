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
var classVarianceAuthority = require('class-variance-authority');
var primitive = require('../../../lib/components/primitive.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

const verticalNavListItem = classVarianceAuthority.cva("nv-vertical-nav-list-item");
const VerticalNavListItem = react.forwardRef(({ className, disabled, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    primitive.Primitive.li,
    {
      ...mergeProps.mergeProps(
        {
          className: verticalNavListItem({ className }),
          ref,
          "data-testid": constants.VerticalNavTestIds.VerticalNavListItem,
          "aria-disabled": disabled,
          tabIndex: disabled ? -1 : void 0
        },
        props
      )
    }
  );
});
VerticalNavListItem.displayName = "VerticalNavListItem";

exports.VerticalNavListItem = VerticalNavListItem;
