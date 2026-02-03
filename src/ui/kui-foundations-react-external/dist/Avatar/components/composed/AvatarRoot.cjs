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
var RadixAvatar = require('@radix-ui/react-avatar');
var classVarianceAuthority = require('class-variance-authority');
var primitive = require('../../../lib/components/primitive.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

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

var React__default = /*#__PURE__*/_interopDefault(React);
var RadixAvatar__namespace = /*#__PURE__*/_interopNamespace(RadixAvatar);

const avatar = classVarianceAuthority.cva("nv-avatar-root", {
  variants: {
    size: {
      small: "nv-avatar-root--size-small",
      medium: "nv-avatar-root--size-medium",
      large: "nv-avatar-root--size-large",
      xlarge: "nv-avatar-root--size-xlarge",
      xxlarge: "nv-avatar-root--size-xxlarge"
    },
    interactive: {
      true: "nv-avatar-root--interactive"
    },
    kind: {
      outline: "nv-avatar-root--kind-outline",
      solid: ""
    }
  },
  defaultVariants: {
    size: "medium",
    kind: "outline"
  }
});
const AvatarRoot = React__default.default.forwardRef(
  ({ className, size, kind, interactive, ...props }, ref) => {
    const isInteractive = interactive !== void 0 ? interactive : !!props.onClick;
    return /* @__PURE__ */ jsxRuntime.jsx(RadixAvatar__namespace.Avatar, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(
      primitive.Primitive.div,
      {
        ...mergeProps.mergeProps(
          {
            className: avatar({
              className,
              size,
              kind,
              interactive: isInteractive
            }),
            "data-testid": constants.AvatarTestIds.AvatarRoot,
            ref
          },
          props
        )
      }
    ) });
  }
);
AvatarRoot.displayName = "AvatarRoot";

exports.AvatarRoot = AvatarRoot;
