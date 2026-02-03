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
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

const tableRow = classVarianceAuthority.cva("nv-table-row", {
  variants: {
    align: {
      left: "nv-table--align-left",
      center: "nv-table--align-center",
      right: "nv-table--align-right"
    },
    selected: {
      true: "nv-table-row--selected"
    }
  }
});
const TableRow = react.forwardRef(
  ({ align, className, selected, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(
      "tr",
      {
        ...mergeProps.mergeProps(
          {
            className: tableRow({ align, className, selected }),
            ref,
            "data-testid": constants.TableTestIds.TableRow,
            "data-selected": selected
          },
          props
        )
      }
    );
  }
);
TableRow.displayName = "TableRow";

exports.TableRow = TableRow;
