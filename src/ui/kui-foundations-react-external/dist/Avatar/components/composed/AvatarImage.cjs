/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
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

const avatarImage = classVarianceAuthority.cva("nv-avatar-image");
const AvatarImage = React__default.default.forwardRef(
  ({ className, src, alt, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(RadixAvatar__namespace.Image, { asChild: true, src, alt, children: /* @__PURE__ */ jsxRuntime.jsx(
      primitive.Primitive.img,
      {
        ...mergeProps.mergeProps(
          {
            className: avatarImage({ className }),
            "data-testid": constants.AvatarTestIds.AvatarImage,
            ref
          },
          props
        )
      }
    ) });
  }
);
AvatarImage.displayName = "AvatarImage";

exports.AvatarImage = AvatarImage;
