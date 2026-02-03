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
var density = require('../../../lib/constants/density.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

const tableRoot = classVarianceAuthority.cva("nv-table-root", {
  variants: {
    density: density.densityVariant,
    layout: {
      fixed: "nv-table-root--layout-fixed",
      auto: "nv-table-root--layout-auto"
    },
    align: {
      left: "nv-table--align-left",
      center: "nv-table--align-center",
      right: "nv-table--align-right"
    },
    hoverableRows: {
      true: "nv-table-root--hoverable-rows"
    }
  },
  defaultVariants: {
    layout: "fixed",
    align: "left"
  }
});
const TableRoot = react.forwardRef(
  ({ className, layout, align, density, hoverableRows, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(
      "table",
      {
        ...mergeProps.mergeProps(
          {
            className: tableRoot({
              className,
              layout,
              align,
              density,
              hoverableRows
            }),
            ref,
            "data-testid": constants.TableTestIds.TableRoot
          },
          props
        )
      }
    );
  }
);
TableRoot.displayName = "TableRoot";

exports.TableRoot = TableRoot;
