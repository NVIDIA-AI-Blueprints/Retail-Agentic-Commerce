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

const tableBody = cva("nv-table-body", {
  variants: {
    align: {
      left: "nv-table--align-left",
      center: "nv-table--align-center",
      right: "nv-table--align-right"
    }
  }
});
const TableBody = forwardRef(
  ({ align, className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "tbody",
      {
        ...mergeProps(
          {
            className: tableBody({ align, className }),
            ref,
            "data-testid": TableTestIds.TableBody
          },
          props
        )
      }
    );
  }
);
TableBody.displayName = "TableBody";

export { TableBody };
