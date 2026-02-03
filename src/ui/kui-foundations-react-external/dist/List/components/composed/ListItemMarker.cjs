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

const listItemMarker = classVarianceAuthority.cva("nv-list-item-marker");
const ListItemMarker = react.forwardRef(
  ({ className, children = ">", ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(
      primitive.Primitive.div,
      {
        ...mergeProps.mergeProps(
          {
            className: listItemMarker({ className }),
            ref,
            "data-testid": constants.ListTestIds.ListItemMarker
          },
          props
        ),
        children
      }
    );
  }
);
ListItemMarker.displayName = "ListItemMarker";

exports.ListItemMarker = ListItemMarker;
