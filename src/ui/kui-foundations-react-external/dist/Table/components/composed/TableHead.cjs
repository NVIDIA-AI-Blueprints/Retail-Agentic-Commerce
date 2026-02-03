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

const tableHead = classVarianceAuthority.cva("nv-table-head", {
  variants: {
    align: {
      left: "nv-table--align-left",
      center: "nv-table--align-center",
      right: "nv-table--align-right"
    }
  }
});
const TableHead = react.forwardRef(
  ({ align, className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(
      "thead",
      {
        ...mergeProps.mergeProps(
          {
            className: tableHead({ align, className }),
            ref,
            "data-testid": constants.TableTestIds.TableHead
          },
          props
        )
      }
    );
  }
);
TableHead.displayName = "TableHead";

exports.TableHead = TableHead;
