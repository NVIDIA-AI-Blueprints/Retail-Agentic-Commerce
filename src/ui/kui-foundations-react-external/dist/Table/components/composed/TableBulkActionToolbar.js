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
import { Primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { TableTestIds } from '../../constants.js';

const tableBulkActionToolbar = cva("nv-table-bulk-action-toolbar");
const TableBulkActionToolbar = forwardRef(({ className, ...props }, ref) => {
  return /* @__PURE__ */ jsx(
    Primitive.div,
    {
      ...mergeProps(
        {
          className: tableBulkActionToolbar({ className }),
          ref,
          "data-testid": TableTestIds.TableBulkActionToolbar
        },
        props
      )
    }
  );
});
TableBulkActionToolbar.displayName = "TableToolbar";

export { TableBulkActionToolbar };
