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
var useElementAttributes = require('../../../lib/hooks/use-element-attributes.cjs');
var AvatarFallback = require('../composed/AvatarFallback.cjs');
var AvatarImage = require('../composed/AvatarImage.cjs');
var AvatarRoot = require('../composed/AvatarRoot.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const Avatar = React__default.default.forwardRef(
  ({ src, fallback, alt, attributes, size, kind, interactive, ...props }, ref) => {
    const [rootAttrs, imageAttrs, fallbackAttrs] = useElementAttributes.useElementAttributes(
      props,
      ["div", AvatarRoot.AvatarRoot],
      ["img", AvatarImage.AvatarImage],
      ["div", AvatarFallback.AvatarFallback]
    );
    return /* @__PURE__ */ jsxRuntime.jsxs(
      AvatarRoot.AvatarRoot,
      {
        ref,
        size,
        interactive,
        kind,
        ...rootAttrs,
        children: [
          /* @__PURE__ */ jsxRuntime.jsx(
            AvatarImage.AvatarImage,
            {
              src,
              alt,
              ...imageAttrs,
              ...attributes?.AvatarImage
            }
          ),
          /* @__PURE__ */ jsxRuntime.jsx(AvatarFallback.AvatarFallback, { ...fallbackAttrs, ...attributes?.AvatarFallback, children: fallback })
        ]
      }
    );
  }
);
Avatar.displayName = "Avatar";

exports.Avatar = Avatar;
