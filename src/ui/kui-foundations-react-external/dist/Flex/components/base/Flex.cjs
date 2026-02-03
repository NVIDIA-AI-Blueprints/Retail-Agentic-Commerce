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
var properties = require('../../../lib/constants/properties.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var variants = require('../../../lib/utils/variants.cjs');
var constants = require('../../constants.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const flex = classVarianceAuthority.cva("nv-flex", {
  variants: {
    align: variants.buildVariants("nv-flex", "align", properties.AlignItemsValues),
    direction: variants.buildVariants("nv-flex", "direction", properties.DirectionValues),
    justify: variants.buildVariants("nv-flex", "justify", properties.JustifyContentValues),
    wrap: variants.buildVariants("nv-flex", "wrap", properties.FlexWrapValues)
  },
  defaultVariants: {
    align: "stretch",
    direction: "row",
    justify: "start",
    wrap: "nowrap"
  }
});
const Flex = React__default.default.forwardRef(
  ({
    align,
    className,
    direction,
    gap,
    wrap,
    justify,
    padding,
    paddingX,
    paddingY,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    spacing,
    spacingX,
    spacingY,
    spacingTop,
    spacingRight,
    spacingBottom,
    spacingLeft,
    ...divProps
  }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(
      primitive.Primitive.div,
      {
        ...mergeProps.mergeProps(
          {
            className: classVarianceAuthority.cx(
              primitive.primitive({
                gap,
                padding,
                paddingX,
                paddingY,
                paddingTop,
                paddingRight,
                paddingBottom,
                paddingLeft,
                spacing,
                spacingX,
                spacingY,
                spacingTop,
                spacingRight,
                spacingBottom,
                spacingLeft
              }),
              flex({
                align,
                className,
                direction,
                justify,
                wrap
              })
            ),
            ref,
            "data-testid": constants.FlexTestIds.Flex
          },
          divProps
        )
      }
    );
  }
);
Flex.displayName = "Flex";

exports.Flex = Flex;
