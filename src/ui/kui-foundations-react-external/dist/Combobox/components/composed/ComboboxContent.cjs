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
var context = require('../../context.cjs');

const comboboxContent = classVarianceAuthority.cva("nv-combobox-content");
const placementToSide = (placement) => placement === "top" ? "top" : placement === "left" ? "left" : placement === "right" ? "right" : "bottom";
const ComboboxContent = react.forwardRef(
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
    const { disabled, readOnly, size } = context.useComboboxContext();
    const { portalRef } = portalContext.usePortalContext();
    const currentPlacement = react$1.useStoreState(
      react$1.useComboboxContext(),
      "currentPlacement"
    );
    const renderProp = react.useCallback(
      (renderProps) => /* @__PURE__ */ jsxRuntime.jsx(
        Menu.MenuRoot,
        {
          ...mergeProps.mergeProps(props, {
            "aria-label": "Combobox list",
            "data-testid": constants.ComboboxTestIds.ComboboxContent,
            className: comboboxContent({ className }),
            density: density$1 ?? density.getDensityFromSize(size),
            ref,
            "data-side": placementToSide(currentPlacement),
            size
          }),
          asChild: true,
          children: /* @__PURE__ */ jsxRuntime.jsx("div", { ...renderProps })
        }
      ),
      [className, density$1, props, ref, size, currentPlacement]
    );
    return /* @__PURE__ */ jsxRuntime.jsx(
      react$1.ComboboxPopover,
      {
        autoFocusOnHide,
        disabled: readOnly || disabled,
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
ComboboxContent.displayName = "ComboboxContent";

exports.ComboboxContent = ComboboxContent;
