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
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const bannerRoot = classVarianceAuthority.cva("nv-banner-root", {
  variants: {
    status: {
      error: "nv-banner-root--status-error",
      warning: "nv-banner-root--status-warning",
      success: "nv-banner-root--status-success",
      info: ""
    },
    kind: {
      global: "nv-banner-root--kind-global",
      header: "nv-banner-root--kind-header",
      inline: ""
    },
    actionsPosition: {
      right: "nv-banner-root--actionsPosition-right",
      bottom: "nv-banner-root--actionsPosition-bottom"
    }
  }
});
const BannerRoot = React__default.default.forwardRef(
  ({ className, kind, status, actionsPosition, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(
      primitive.Primitive.div,
      {
        ...mergeProps.mergeProps(
          {
            className: bannerRoot({
              className,
              kind,
              status,
              actionsPosition
            }),
            "data-testid": constants.BannerTestIds.BannerRoot,
            ref
          },
          props
        )
      }
    );
  }
);
BannerRoot.displayName = "BannerRoot";

exports.BannerRoot = BannerRoot;
