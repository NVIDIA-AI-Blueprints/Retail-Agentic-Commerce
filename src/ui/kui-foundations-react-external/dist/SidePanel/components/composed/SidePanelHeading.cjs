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
var reactDialog = require('@radix-ui/react-dialog');
var classVarianceAuthority = require('class-variance-authority');
var primitive = require('../../../lib/components/primitive.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');
var context = require('../../context.cjs');

const sidePanelHeading = classVarianceAuthority.cva("nv-side-panel-heading", {
  variants: {
    invisible: {
      true: "nv-side-panel-heading--invisible"
    },
    hidden: {
      true: "nv-side-panel-heading--hidden"
    }
  },
  defaultVariants: {
    hidden: false
  }
});
const SidePanelHeading = react.forwardRef(({ className, children, ...props }, ref) => {
  const context$1 = context.useSidePanelContext();
  if (!context$1) {
    throw new Error("SidePanelContent must be a child of a SidePanelRoot.");
  }
  return /* @__PURE__ */ jsxRuntime.jsx(reactDialog.DialogTitle, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(
    primitive.Primitive.h2,
    {
      ...mergeProps.mergeProps(
        {
          className: sidePanelHeading({
            className,
            invisible: !children && !context$1.hideCloseButton,
            hidden: !children && context$1.hideCloseButton
          }),
          ref,
          "data-testid": constants.SidePanelTestIds.SidePanelHeading
        },
        props
      ),
      children: !children ? "Side Panel Content" : children
    }
  ) });
});
SidePanelHeading.displayName = "SidePanelHeading";

exports.SidePanelHeading = SidePanelHeading;
