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
var HorizontalLogo = require('../composed/HorizontalLogo.cjs');
var LogoOnlyLogo = require('../composed/LogoOnlyLogo.cjs');
var VerticalLogo = require('../composed/VerticalLogo.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const logo = classVarianceAuthority.cva("nv-logo", {
  variants: {
    color: {
      brand: "",
      neutral: "nv-logo--color-neutral"
    },
    size: {
      small: "nv-logo--size-small",
      medium: "nv-logo--size-medium",
      large: "nv-logo--size-large",
      xlarge: "nv-logo--size-xlarge",
      xxlarge: "nv-logo--size-xxlarge"
    }
  },
  defaultVariants: {
    color: "brand"
  }
});
const logoMap = {
  horizontal: HorizontalLogo.HorizontalLogo,
  vertical: VerticalLogo.VerticalLogo,
  "logo-only": LogoOnlyLogo.LogoOnlyLogo
};
const Logo = React__default.default.forwardRef(
  ({ color, kind = "horizontal", className, size, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(
      "div",
      {
        ...mergeProps.mergeProps(
          {
            className: logo({ className, color, size }),
            ref,
            "data-testid": constants.LogoTestIds.Root
          },
          props
        ),
        children: logoMap[kind] && React__default.default.createElement(logoMap[kind], {
          className: "nv-logo-element",
          "data-testid": constants.LogoTestIds.Logo
        })
      }
    );
  }
);
Logo.displayName = "Logo";

exports.Logo = Logo;
exports.logoMap = logoMap;
