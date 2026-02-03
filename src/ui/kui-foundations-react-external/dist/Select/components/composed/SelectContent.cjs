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
var react$1 = require('@ariakit/react');
var classVarianceAuthority = require('class-variance-authority');
var Menu = require('../../../Menu/index.cjs');
var density = require('../../../lib/constants/density.cjs');
var portalContext = require('../../../lib/context/portal-context.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');
var SelectRoot = require('./SelectRoot.cjs');

const selectContent = classVarianceAuthority.cva("nv-select-content");
const placementToSide = (placement) => placement === "top" ? "top" : placement === "left" ? "left" : placement === "right" ? "right" : "bottom";
const SelectContent = react.forwardRef(
  ({
    autoFocusOnHide,
    children,
    className,
    density: density$1,
    hideOnEscape,
    portal = true,
    portalContainer,
    ...props
  }, ref) => {
    const { disabled, readOnly, size } = SelectRoot.useSelectContext();
    const placement = react$1.useStoreState(react$1.useSelectContext(), "currentPlacement");
    const { portalRef } = portalContext.usePortalContext();
    const renderProp = react.useCallback(
      (renderProps) => /* @__PURE__ */ jsxRuntime.jsx(
        Menu.MenuRoot,
        {
          ...mergeProps.mergeProps(props, {
            ref,
            className: selectContent({ className }),
            "data-testid": constants.SelectTestIds.SelectContent,
            "data-side": placementToSide(placement),
            "aria-label": "Select content",
            density: density$1 ?? density.getDensityFromSize(size),
            size
          }),
          asChild: true,
          children: /* @__PURE__ */ jsxRuntime.jsx("div", { ...renderProps })
        }
      ),
      [className, density$1, props, ref, size, placement]
    );
    return /* @__PURE__ */ jsxRuntime.jsx(
      react$1.SelectPopover,
      {
        autoFocusOnHide,
        disabled: readOnly ?? disabled,
        hideOnEscape,
        gutter: 4,
        sameWidth: true,
        portal,
        portalElement: portalContainer || portalRef,
        render: renderProp,
        children
      }
    );
  }
);
SelectContent.displayName = "SelectContent";

exports.SelectContent = SelectContent;
