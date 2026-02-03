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
import { densityVariant } from '../../../lib/constants/density.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { TableTestIds } from '../../constants.js';

const tableRoot = cva("nv-table-root", {
  variants: {
    density: densityVariant,
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
const TableRoot = forwardRef(
  ({ className, layout, align, density, hoverableRows, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "table",
      {
        ...mergeProps(
          {
            className: tableRoot({
              className,
              layout,
              align,
              density,
              hoverableRows
            }),
            ref,
            "data-testid": TableTestIds.TableRoot
          },
          props
        )
      }
    );
  }
);
TableRoot.displayName = "TableRoot";

export { TableRoot };
