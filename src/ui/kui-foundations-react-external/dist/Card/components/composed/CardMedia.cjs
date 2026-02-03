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
var reactSlot = require('@radix-ui/react-slot');
var classVarianceAuthority = require('class-variance-authority');
var Slottable = require('../../../lib/components/Slottable.cjs');
var primitive = require('../../../lib/components/primitive.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const cardMedia = classVarianceAuthority.cva("nv-card-media");
const CardMedia = React__default.default.forwardRef(
  ({ children, className, slotHeader, asChild, ...props }, ref) => {
    const Component = asChild ? reactSlot.Slot : "div";
    return /* @__PURE__ */ jsxRuntime.jsx(
      Component,
      {
        ...mergeProps.mergeProps(
          {
            className: cardMedia({ className }),
            "data-testid": constants.CardTestIds.CardMedia,
            ref
          },
          props
        ),
        children: /* @__PURE__ */ jsxRuntime.jsx(Slottable.Slottable, { asChild, child: children, children: (child) => /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
          child,
          slotHeader && /* @__PURE__ */ jsxRuntime.jsx(primitive.Primitive.div, { className: "nv-card-media-header", children: slotHeader })
        ] }) })
      }
    );
  }
);
CardMedia.displayName = "CardMedia";

exports.CardMedia = CardMedia;
