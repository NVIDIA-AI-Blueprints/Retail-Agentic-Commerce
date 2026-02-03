/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { Slottable } from '../../../lib/components/Slottable.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { TableTestIds } from '../../constants.js';
import { TableBulkActionToolbar } from './TableBulkActionToolbar.js';

const tableToolbar = cva("nv-table-toolbar");
const TableToolbar = forwardRef(
  ({
    asChild,
    children,
    className,
    showBulkActionsToolbar,
    slotBulkActions,
    ...props
  }, ref) => {
    const Component = asChild ? Slot : "section";
    return /* @__PURE__ */ jsx(
      Component,
      {
        ...mergeProps(
          {
            className: tableToolbar({ className }),
            ref,
            "data-testid": TableTestIds.TableToolbar
          },
          props
        ),
        children: /* @__PURE__ */ jsx(Slottable, { asChild, child: children, children: (child) => /* @__PURE__ */ jsxs(Fragment, { children: [
          slotBulkActions && /* @__PURE__ */ jsx(
            TableBulkActionToolbar,
            {
              "aria-hidden": !showBulkActionsToolbar || void 0,
              className: "nv-table-toolbar-bulk-actions-section",
              "data-active": showBulkActionsToolbar,
              inert: !showBulkActionsToolbar ? " " : void 0,
              children: slotBulkActions
            }
          ),
          /* @__PURE__ */ jsx(
            "div",
            {
              "aria-hidden": showBulkActionsToolbar || void 0,
              className: "nv-table-toolbar-content",
              "data-active": !showBulkActionsToolbar,
              inert: showBulkActionsToolbar ? " " : void 0,
              children: child
            }
          )
        ] }) })
      }
    );
  }
);
TableToolbar.displayName = "TableToolbar";

export { TableToolbar };
