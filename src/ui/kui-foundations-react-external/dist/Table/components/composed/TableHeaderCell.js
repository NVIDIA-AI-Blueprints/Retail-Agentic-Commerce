/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { TableTestIds } from '../../constants.js';

const tableHeaderCell = cva("nv-table-header-cell", {
  variants: {
    align: {
      left: "nv-table--align-left",
      center: "nv-table--align-center",
      right: "nv-table--align-right"
    }
  }
});
const TableHeaderCell = forwardRef(({ align, className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    "th",
    {
      ...mergeProps(
        {
          className: tableHeaderCell({ className, align }),
          ref,
          "data-testid": TableTestIds.TableHeaderCell
        },
        props
      )
    }
  );
});
TableHeaderCell.displayName = "TableHeaderCell";

export { TableHeaderCell };
