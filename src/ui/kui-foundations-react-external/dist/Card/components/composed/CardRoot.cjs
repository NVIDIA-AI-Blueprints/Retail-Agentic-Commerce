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
var primitive = require('../../../lib/components/primitive.cjs');
var density = require('../../../lib/constants/density.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const cardRoot = classVarianceAuthority.cva("nv-card-root", {
  variants: {
    density: density.densityVariant,
    interactive: {
      true: "nv-card-root--interactive"
    },
    kind: {
      solid: "nv-card-root--kind-solid",
      gradient: "nv-card-root--kind-gradient",
      float: "nv-card-root--kind-float"
    },
    layout: {
      horizontal: "nv-card-root--layout-horizontal",
      vertical: "nv-card-root--layout-vertical"
    },
    selected: {
      true: "nv-card-root--selected"
    }
  },
  defaultVariants: {
    interactive: false,
    kind: "solid",
    layout: "vertical",
    selected: false
  }
});
const CardRoot = React__default.default.forwardRef(
  ({ className, interactive, kind, layout, selected, density, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(
      primitive.Primitive.div,
      {
        ...mergeProps.mergeProps(
          {
            className: cardRoot({
              className,
              density,
              interactive,
              layout,
              kind,
              selected
            }),
            "data-testid": constants.CardTestIds.CardRoot,
            ref
          },
          props
        )
      }
    );
  }
);
CardRoot.displayName = "CardRoot";

exports.CardRoot = CardRoot;
