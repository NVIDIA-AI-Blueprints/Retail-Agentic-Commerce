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

const tableDataCell = cva("nv-table-data-cell", {
  variants: {
    align: {
      left: "nv-table--align-left",
      center: "nv-table--align-center",
      right: "nv-table--align-right"
    }
  }
});
const TableDataCell = forwardRef(({ align, className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    "td",
    {
      ...mergeProps(
        {
          className: tableDataCell({ className, align }),
          ref,
          "data-testid": TableTestIds.TableDataCell
        },
        props
      )
    }
  );
});
TableDataCell.displayName = "TableDataCell";

export { TableDataCell };
