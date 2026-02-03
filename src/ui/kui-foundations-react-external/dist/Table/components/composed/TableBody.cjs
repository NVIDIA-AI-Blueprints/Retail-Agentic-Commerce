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

const tableBody = classVarianceAuthority.cva("nv-table-body", {
  variants: {
    align: {
      left: "nv-table--align-left",
      center: "nv-table--align-center",
      right: "nv-table--align-right"
    }
  }
});
const TableBody = react.forwardRef(
  ({ align, className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(
      "tbody",
      {
        ...mergeProps.mergeProps(
          {
            className: tableBody({ align, className }),
            ref,
            "data-testid": constants.TableTestIds.TableBody
          },
          props
        )
      }
    );
  }
);
TableBody.displayName = "TableBody";

exports.TableBody = TableBody;
