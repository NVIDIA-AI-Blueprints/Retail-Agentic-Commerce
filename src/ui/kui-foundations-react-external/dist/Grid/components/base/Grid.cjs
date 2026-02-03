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
var variants = require('../../../lib/utils/variants.cjs');
var constants = require('../../constants.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const grid = classVarianceAuthority.cva("nv-grid", {
  variants: {
    flow: variants.buildVariants("nv-grid", "flow", [
      "row",
      "col",
      "dense",
      "row-dense",
      "col-dense"
    ])
  }
});
const Grid = React__default.default.forwardRef(
  ({
    className,
    cols,
    flow,
    gap,
    rows,
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
            primitive.primitive({
              gap,
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
            grid({
              flow
            }),
            responsive.getResponsiveClassName("nv-grid", "cols", cols),
            responsive.getResponsiveClassName("nv-grid", "rows", rows),
            className
          ),
          ref,
          "data-testid": constants.GridTestIds.Grid
        },
        divProps
      )
    }
  )
);
Grid.displayName = "Grid";

exports.Grid = Grid;
