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
var reactSlot = require('@radix-ui/react-slot');
var classVarianceAuthority = require('class-variance-authority');
var Slottable = require('../../../lib/components/Slottable.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');
var TableBulkActionToolbar = require('./TableBulkActionToolbar.cjs');

const tableToolbar = classVarianceAuthority.cva("nv-table-toolbar");
const TableToolbar = react.forwardRef(
  ({
    asChild,
    children,
    className,
    showBulkActionsToolbar,
    slotBulkActions,
    ...props
  }, ref) => {
    const Component = asChild ? reactSlot.Slot : "section";
    return /* @__PURE__ */ jsxRuntime.jsx(
      Component,
      {
        ...mergeProps.mergeProps(
          {
            className: tableToolbar({ className }),
            ref,
            "data-testid": constants.TableTestIds.TableToolbar
          },
          props
        ),
        children: /* @__PURE__ */ jsxRuntime.jsx(Slottable.Slottable, { asChild, child: children, children: (child) => /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
          slotBulkActions && /* @__PURE__ */ jsxRuntime.jsx(
            TableBulkActionToolbar.TableBulkActionToolbar,
            {
              "aria-hidden": !showBulkActionsToolbar || void 0,
              className: "nv-table-toolbar-bulk-actions-section",
              "data-active": showBulkActionsToolbar,
              inert: !showBulkActionsToolbar ? " " : void 0,
              children: slotBulkActions
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(
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

exports.TableToolbar = TableToolbar;
