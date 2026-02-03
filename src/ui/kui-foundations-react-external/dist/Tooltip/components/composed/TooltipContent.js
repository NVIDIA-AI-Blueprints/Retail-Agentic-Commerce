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
import * as Tooltip from '@radix-ui/react-tooltip';
import { cva } from 'class-variance-authority';
import { Slottable } from '../../../lib/components/Slottable.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { TooltipTestIds } from '../../constants.js';

const tooltipContent = cva("nv-tooltip-content");
const TooltipContent = forwardRef(
  ({
    portal = true,
    portalContainer,
    className,
    children,
    side = "top",
    align = "center",
    asChild,
    onEscapeKeyDown,
    onPointerDownOutside,
    forceMount,
    showArrow = false,
    ...props
  }, ref) => {
    const Component = asChild ? Slot : "div";
    const content = /* @__PURE__ */ jsx(
      Tooltip.Content,
      {
        asChild: true,
        forceMount,
        side,
        sideOffset: showArrow ? 0 : 4,
        align,
        onEscapeKeyDown,
        onPointerDownOutside,
        children: /* @__PURE__ */ jsx(
          Component,
          {
            ...mergeProps(
              {
                className: tooltipContent({ className }),
                "data-testid": TooltipTestIds.Content,
                ref
              },
              props
            ),
            children: /* @__PURE__ */ jsx(Slottable, { asChild, child: children, children: (child) => /* @__PURE__ */ jsxs(Fragment, { children: [
              child,
              showArrow && /* @__PURE__ */ jsx(Tooltip.Arrow, { asChild: true, children: /* @__PURE__ */ jsx(Arrow, {}) })
            ] }) })
          }
        )
      }
    );
    return portal ? /* @__PURE__ */ jsx(Tooltip.Portal, { container: portalContainer, forceMount, children: content }) : content;
  }
);
const Arrow = () => {
  return /* @__PURE__ */ jsxs("div", { className: "nv-tooltip-arrow", children: [
    /* @__PURE__ */ jsx(
      "svg",
      {
        width: "12",
        height: "8",
        viewBox: "0 0 12 8",
        xmlns: "http://www.w3.org/2000/svg",
        children: /* @__PURE__ */ jsx("path", { d: "M7.66376 6.49999C6.87204 7.68677 5.12796 7.68677 4.33624 6.49999L0 0L6 4.91423e-07L12 9.82845e-07L7.66376 6.49999Z" })
      }
    ),
    /* @__PURE__ */ jsx(
      "svg",
      {
        width: "10",
        height: "7",
        viewBox: "0 0 10 7",
        xmlns: "http://www.w3.org/2000/svg",
        children: /* @__PURE__ */ jsx("path", { d: "M6.696 5.28641C5.91266 6.53974 4.08734 6.53974 3.304 5.28641L0 0L5 4.37114e-07L10 8.74228e-07L6.696 5.28641Z" })
      }
    )
  ] });
};
TooltipContent.displayName = "TooltipContent";

export { TooltipContent };
