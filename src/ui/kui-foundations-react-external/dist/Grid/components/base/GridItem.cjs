/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
// foundations-css import removed
var React = require('react');
var classVarianceAuthority = require('class-variance-authority');
var primitive = require('../../../lib/components/primitive.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var responsive = require('../../../lib/utils/responsive.cjs');
var constants = require('../../constants.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const GridItem = React__default.default.forwardRef(
  ({
    className,
    colEnd,
    cols,
    colStart,
    rows,
    rowEnd,
    rowStart,
    padding,
    paddingX,
    paddingY,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    spacing,
    spacingX,
    spacingY,
    spacingTop,
    spacingRight,
    spacingBottom,
    spacingLeft,
    ...divProps
  }, ref) => /* @__PURE__ */ jsxRuntime.jsx(
    primitive.Primitive.div,
    {
      ...mergeProps.mergeProps(
        {
          className: classVarianceAuthority.cx(
            "nv-grid-item",
            primitive.primitive({
              padding,
              paddingX,
              paddingY,
              paddingTop,
              paddingRight,
              paddingBottom,
              paddingLeft,
              spacing,
              spacingX,
              spacingY,
              spacingTop,
              spacingRight,
              spacingBottom,
              spacingLeft
            }),
            responsive.getResponsiveClassName("nv-grid-item", "col-span", cols, 1),
            responsive.getResponsiveClassName("nv-grid-item", "row-span", rows),
            responsive.getResponsiveClassName("nv-grid-item", "col-start", colStart),
            responsive.getResponsiveClassName("nv-grid-item", "col-end", colEnd),
            responsive.getResponsiveClassName("nv-grid-item", "row-start", rowStart),
            responsive.getResponsiveClassName("nv-grid-item", "row-end", rowEnd),
            className
          ),
          ref,
          "data-testid": constants.GridTestIds.GridItem
        },
        divProps
      )
    }
  )
);
GridItem.displayName = "GridItem";

exports.GridItem = GridItem;
