/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
// foundations-css import removed
var React = require('react');
var classVarianceAuthority = require('class-variance-authority');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const spinnerStyles = classVarianceAuthority.cva("nv-spinner", {
  variants: {
    size: {
      small: "nv-spinner--size-small",
      medium: "nv-spinner--size-medium",
      large: "nv-spinner--size-large"
    }
  },
  defaultVariants: {
    size: "medium"
  }
});
const Spinner = React.forwardRef(
  ({ className, description, size, ...props }, ref) => {
    const id = React__default.default.useId();
    return /* @__PURE__ */ jsxRuntime.jsxs(
      "div",
      {
        ...mergeProps.mergeProps(
          {
            ref,
            className: spinnerStyles({ className, size }),
            "data-testid": constants.SpinnerTestIds.Spinner
          },
          props
        ),
        role: "status",
        "aria-labelledby": description && id,
        children: [
          /* @__PURE__ */ jsxRuntime.jsx("div", { children: /* @__PURE__ */ jsxRuntime.jsxs("svg", { height: "100%", width: "100%", viewBox: "0 0 142 128", children: [
            /* @__PURE__ */ jsxRuntime.jsxs("g", { transform: "translate(36, 0)", children: [
              /* @__PURE__ */ jsxRuntime.jsx(SpinnerArrow, { delay: "-1s", direction: "up", y: "1" }),
              /* @__PURE__ */ jsxRuntime.jsx(SpinnerArrow, { delay: "-.9444s", direction: "down", x: "18" }),
              /* @__PURE__ */ jsxRuntime.jsx(SpinnerArrow, { delay: "-.8888s", direction: "up", x: "36", y: "1" })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs("g", { transform: "translate(18, 32)", children: [
              /* @__PURE__ */ jsxRuntime.jsx(SpinnerArrow, { delay: "-1s", direction: "up", y: "1" }),
              /* @__PURE__ */ jsxRuntime.jsx(SpinnerArrow, { delay: "-.9444s", direction: "down", x: "18" }),
              /* @__PURE__ */ jsxRuntime.jsx(SpinnerArrow, { delay: "-.8888s", direction: "up", x: "36", y: "1" }),
              /* @__PURE__ */ jsxRuntime.jsx(SpinnerArrow, { delay: "-.8333s", direction: "down", x: "54" }),
              /* @__PURE__ */ jsxRuntime.jsx(SpinnerArrow, { delay: "-.7777s", direction: "up", x: "72", y: "1" })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs("g", { transform: "translate(0, 64)", children: [
              /* @__PURE__ */ jsxRuntime.jsx(SpinnerArrow, { delay: "0s", direction: "up", y: "1" }),
              /* @__PURE__ */ jsxRuntime.jsx(SpinnerArrow, { delay: "-.1111s", direction: "down", x: "18" }),
              /* @__PURE__ */ jsxRuntime.jsx(SpinnerArrow, { delay: "-1s", direction: "up", x: "36", y: "1" }),
              /* @__PURE__ */ jsxRuntime.jsx(SpinnerArrow, { delay: "-.8333s", direction: "down", x: "54" }),
              /* @__PURE__ */ jsxRuntime.jsx(SpinnerArrow, { delay: "-.6666s", direction: "up", x: "72", y: "1" }),
              /* @__PURE__ */ jsxRuntime.jsx(SpinnerArrow, { delay: "-.7222s", direction: "down", x: "90" }),
              /* @__PURE__ */ jsxRuntime.jsx(SpinnerArrow, { delay: "-.6666s", direction: "up", x: "108", y: "1" })
            ] }),
            /* @__PURE__ */ jsxRuntime.jsxs("g", { transform: "translate(0, 96)", children: [
              /* @__PURE__ */ jsxRuntime.jsx(SpinnerArrow, { delay: "-.1666s", direction: "down" }),
              /* @__PURE__ */ jsxRuntime.jsx(SpinnerArrow, { delay: "-.2222s", direction: "up", x: "18", y: "1" }),
              /* @__PURE__ */ jsxRuntime.jsx(SpinnerArrow, { delay: "-.1666s", direction: "down", x: "36" }),
              /* @__PURE__ */ jsxRuntime.jsx(SpinnerArrow, { delay: "-.3333s", direction: "up", x: "54", y: "1" }),
              /* @__PURE__ */ jsxRuntime.jsx(SpinnerArrow, { delay: "-.5s", direction: "down", x: "72" }),
              /* @__PURE__ */ jsxRuntime.jsx(SpinnerArrow, { delay: "-.6111s", direction: "up", x: "90", y: "1" }),
              /* @__PURE__ */ jsxRuntime.jsx(SpinnerArrow, { delay: "-.5555s", direction: "down", x: "108" })
            ] }),
            "Sorry, your browser does not support inline SVG."
          ] }) }),
          description && /* @__PURE__ */ jsxRuntime.jsx("div", { className: "nv-spinner-description", id, children: description })
        ]
      }
    );
  }
);
const SpinnerArrow = ({
  delay,
  direction,
  y = "0",
  x = "0"
}) => {
  return /* @__PURE__ */ jsxRuntime.jsx(
    "polygon",
    {
      className: "nv-spinner-arrow",
      "data-testid": constants.SpinnerTestIds.Arrow,
      points: direction === "up" ? "17 0, 34 31, 0 31" : "0 0, 34 0, 17 31",
      transform: `translate(${x}, ${y})`,
      style: { animationDelay: delay }
    }
  );
};
Spinner.displayName = "Spinner";

exports.Spinner = Spinner;
