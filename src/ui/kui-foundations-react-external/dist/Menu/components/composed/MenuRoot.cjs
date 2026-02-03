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
var density = require('../../../lib/constants/density.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var mergeRefs = require('../../../lib/utils/merge-refs.cjs');
var constants = require('../../constants.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var React__default = /*#__PURE__*/_interopDefault(React);

const menuRoot = classVarianceAuthority.cva("nv-menu", {
  variants: {
    density: density.densityVariant
  }
});
const MenuRoot = React.forwardRef(
  ({ className, density, asChild, onScrollToBottom, ...props }, ref) => {
    const Element = asChild ? reactSlot.Slot : "menu";
    const innerRef = React.useRef(null);
    React__default.default.useEffect(() => {
      const menuRef = innerRef?.current;
      if (!menuRef) return;
      const onScroll = () => {
        if (menuRef.scrollTop + menuRef.offsetHeight >= menuRef.scrollHeight) {
          onScrollToBottom?.();
        }
      };
      menuRef.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        menuRef.removeEventListener("scroll", onScroll);
      };
    }, [onScrollToBottom]);
    return /* @__PURE__ */ jsxRuntime.jsx(
      Element,
      {
        ...mergeProps.mergeProps(
          {
            className: menuRoot({ className, density }),
            ref: mergeRefs.mergeRefs(ref, innerRef),
            "data-testid": constants.MenuTestIds.MenuRoot,
            role: "menu"
          },
          props
        )
      }
    );
  }
);
MenuRoot.displayName = "MenuRoot";

exports.MenuRoot = MenuRoot;
