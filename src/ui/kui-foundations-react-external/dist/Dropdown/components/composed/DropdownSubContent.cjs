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
var RadixDropdownPrimitives = require('@radix-ui/react-dropdown-menu');
var classVarianceAuthority = require('class-variance-authority');
var Menu = require('../../../Menu/index.cjs');
var density = require('../../../lib/constants/density.cjs');
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

var RadixDropdownPrimitives__namespace = /*#__PURE__*/_interopNamespace(RadixDropdownPrimitives);

const dropdownContent = classVarianceAuthority.cva("nv-dropdown-content", {
  variants: {
    density: density.densityVariant
  }
});
const DropdownSubContent = react.forwardRef(
  ({
    className,
    density,
    portal = true,
    portalContainer,
    onEscapeKeyDown,
    onPointerDownOutside,
    forceMount,
    ...props
  }, ref) => {
    const content = /* @__PURE__ */ jsxRuntime.jsx(
      RadixDropdownPrimitives__namespace.DropdownMenuSubContent,
      {
        forceMount,
        onEscapeKeyDown,
        onPointerDownOutside,
        asChild: true,
        children: /* @__PURE__ */ jsxRuntime.jsx(
          Menu.MenuRoot,
          {
            ...mergeProps.mergeProps(
              {
                ref,
                "data-testid": constants.DropdownTestIds.DropdownSubContent,
                className: dropdownContent({ className, density })
              },
              props
            )
          }
        )
      }
    );
    return portal ? /* @__PURE__ */ jsxRuntime.jsx(
      RadixDropdownPrimitives__namespace.Portal,
      {
        container: portalContainer,
        forceMount,
        children: content
      }
    ) : content;
  }
);
DropdownSubContent.displayName = "DropdownSubContent";

exports.DropdownSubContent = DropdownSubContent;
