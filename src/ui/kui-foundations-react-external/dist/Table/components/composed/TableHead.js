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

const tableHead = cva("nv-table-head", {
  variants: {
    align: {
      left: "nv-table--align-left",
      center: "nv-table--align-center",
      right: "nv-table--align-right"
    }
  }
});
const TableHead = forwardRef(
  ({ align, className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "thead",
      {
        ...mergeProps(
          {
            className: tableHead({ align, className }),
            ref,
            "data-testid": TableTestIds.TableHead
          },
          props
        )
      }
    );
  }
);
TableHead.displayName = "TableHead";

export { TableHead };
