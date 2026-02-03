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
var Tooltip = require('@radix-ui/react-tooltip');
var classVarianceAuthority = require('class-variance-authority');
var Slottable = require('../../../lib/components/Slottable.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var Tooltip__namespace = /*#__PURE__*/_interopNamespace(Tooltip);

const tooltipContent = classVarianceAuthority.cva("nv-tooltip-content");
const TooltipContent = react.forwardRef(
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
    const Component = asChild ? reactSlot.Slot : "div";
    const content = /* @__PURE__ */ jsxRuntime.jsx(
      Tooltip__namespace.Content,
      {
        asChild: true,
        forceMount,
        side,
        sideOffset: showArrow ? 0 : 4,
        align,
        onEscapeKeyDown,
        onPointerDownOutside,
        children: /* @__PURE__ */ jsxRuntime.jsx(
          Component,
          {
            ...mergeProps.mergeProps(
              {
                className: tooltipContent({ className }),
                "data-testid": constants.TooltipTestIds.Content,
                ref
              },
              props
            ),
            children: /* @__PURE__ */ jsxRuntime.jsx(Slottable.Slottable, { asChild, child: children, children: (child) => /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
              child,
              showArrow && /* @__PURE__ */ jsxRuntime.jsx(Tooltip__namespace.Arrow, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(Arrow, {}) })
            ] }) })
          }
        )
      }
    );
    return portal ? /* @__PURE__ */ jsxRuntime.jsx(Tooltip__namespace.Portal, { container: portalContainer, forceMount, children: content }) : content;
  }
);
const Arrow = () => {
  return /* @__PURE__ */ jsxRuntime.jsxs("div", { className: "nv-tooltip-arrow", children: [
    /* @__PURE__ */ jsxRuntime.jsx(
      "svg",
      {
        width: "12",
        height: "8",
        viewBox: "0 0 12 8",
        xmlns: "http://www.w3.org/2000/svg",
        children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M7.66376 6.49999C6.87204 7.68677 5.12796 7.68677 4.33624 6.49999L0 0L6 4.91423e-07L12 9.82845e-07L7.66376 6.49999Z" })
      }
    ),
    /* @__PURE__ */ jsxRuntime.jsx(
      "svg",
      {
        width: "10",
        height: "7",
        viewBox: "0 0 10 7",
        xmlns: "http://www.w3.org/2000/svg",
        children: /* @__PURE__ */ jsxRuntime.jsx("path", { d: "M6.696 5.28641C5.91266 6.53974 4.08734 6.53974 3.304 5.28641L0 0L5 4.37114e-07L10 8.74228e-07L6.696 5.28641Z" })
      }
    )
  ] });
};
TooltipContent.displayName = "TooltipContent";

exports.TooltipContent = TooltipContent;
