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

const tableRow = cva("nv-table-row", {
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
const TableRow = forwardRef(
  ({ align, className, selected, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "tr",
      {
        ...mergeProps(
          {
            className: tableRow({ align, className, selected }),
            ref,
            "data-testid": TableTestIds.TableRow,
            "data-selected": selected
          },
          props
        )
      }
    );
  }
);
TableRow.displayName = "TableRow";

export { TableRow };
