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
var reactSlot = require('@radix-ui/react-slot');
var Slottable = require('../../../lib/components/Slottable.cjs');
var PanelContent = require('../composed/PanelContent.cjs');
var PanelFooter = require('../composed/PanelFooter.cjs');
var PanelHeader = require('../composed/PanelHeader.cjs');
var PanelHeading = require('../composed/PanelHeading.cjs');
var PanelIcon = require('../composed/PanelIcon.cjs');
var PanelRoot = require('../composed/PanelRoot.cjs');

const Panel = react.forwardRef(
  ({
    asChild,
    density,
    slotIcon,
    elevation,
    slotHeading,
    slotFooter,
    children,
    attributes,
    ...props
  }, ref) => {
    const Component = asChild ? reactSlot.Slot : "div";
    return /* @__PURE__ */ jsxRuntime.jsx(
      PanelRoot.PanelRoot,
      {
        density,
        elevation,
        ref,
        ...props,
        asChild: true,
        children: /* @__PURE__ */ jsxRuntime.jsx(Component, { children: /* @__PURE__ */ jsxRuntime.jsx(Slottable.Slottable, { asChild, child: children, children: (child) => /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
          (slotHeading || slotIcon) && /* @__PURE__ */ jsxRuntime.jsxs(PanelHeader.PanelHeader, { ...attributes?.PanelHeader, children: [
            slotIcon && /* @__PURE__ */ jsxRuntime.jsx(PanelIcon.PanelIcon, { ...attributes?.PanelIcon, children: slotIcon }),
            slotHeading && /* @__PURE__ */ jsxRuntime.jsx(PanelHeading.PanelHeading, { ...attributes?.PanelHeading, children: slotHeading })
          ] }),
          children && /* @__PURE__ */ jsxRuntime.jsx(PanelContent.PanelContent, { ...attributes?.PanelContent, children: child }),
          slotFooter && /* @__PURE__ */ jsxRuntime.jsx(PanelFooter.PanelFooter, { ...attributes?.PanelFooter, children: slotFooter })
        ] }) }) })
      }
    );
  }
);
Panel.displayName = "Panel";

exports.Panel = Panel;
