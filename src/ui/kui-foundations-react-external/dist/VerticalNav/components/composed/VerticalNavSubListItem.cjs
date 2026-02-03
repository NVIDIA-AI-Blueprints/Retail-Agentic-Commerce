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

const verticalNavSubListItem = classVarianceAuthority.cva("nv-vertical-nav-sub-list-item");
const VerticalNavSubListItem = react.forwardRef(({ className, disabled, ...props }, ref) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    primitive.Primitive.li,
    {
      ...mergeProps.mergeProps(
        {
          className: verticalNavSubListItem({ className }),
          ref,
          "data-testid": constants.VerticalNavTestIds.VerticalNavSubListItem,
          "aria-disabled": disabled,
          tabIndex: disabled ? -1 : void 0
        },
        props
      )
    }
  );
});
VerticalNavSubListItem.displayName = "VerticalNavSubListItem";

exports.VerticalNavSubListItem = VerticalNavSubListItem;
