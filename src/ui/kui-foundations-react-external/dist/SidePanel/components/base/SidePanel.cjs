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
var SidePanelContent = require('../composed/SidePanelContent.cjs');
var SidePanelFooter = require('../composed/SidePanelFooter.cjs');
var SidePanelHeading = require('../composed/SidePanelHeading.cjs');
var SidePanelMain = require('../composed/SidePanelMain.cjs');
var SidePanelNavigation = require('../composed/SidePanelNavigation.cjs');
var SidePanelRoot = require('../composed/SidePanelRoot.cjs');
var SidePanelTrigger = require('../composed/SidePanelTrigger.cjs');

const SidePanel = react.forwardRef(
  ({
    density,
    open,
    onOpenChange,
    defaultOpen,
    modal,
    portal,
    portalContainer,
    side,
    slotNavigation,
    slotHeading,
    slotFooter,
    slotTrigger,
    closeOnClickOutside,
    onPointerDownOutside,
    onInteractOutside,
    onOpenAutoFocus,
    attributes,
    children,
    onEscapeKeyDown,
    hideCloseButton,
    bordered,
    forceMount,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsxs(
      SidePanelRoot.SidePanelRoot,
      {
        open,
        onOpenChange,
        defaultOpen,
        modal,
        hideCloseButton,
        children: [
          slotTrigger && /* @__PURE__ */ jsxRuntime.jsx(SidePanelTrigger.SidePanelTrigger, { asChild: true, ...attributes?.SidePanelTrigger, children: slotTrigger }),
          /* @__PURE__ */ jsxRuntime.jsxs(
            SidePanelContent.SidePanelContent,
            {
              ref,
              density,
              forceMount,
              portalContainer,
              closeOnClickOutside,
              portal,
              side,
              onEscapeKeyDown,
              bordered,
              onPointerDownOutside,
              onInteractOutside,
              onOpenAutoFocus,
              ...props,
              children: [
                /* @__PURE__ */ jsxRuntime.jsx(SidePanelHeading.SidePanelHeading, { ...attributes?.SidePanelHeading, children: slotHeading }),
                slotNavigation && /* @__PURE__ */ jsxRuntime.jsx(SidePanelNavigation.SidePanelNavigation, { ...attributes?.SidePanelNavigation, children: slotNavigation }),
                /* @__PURE__ */ jsxRuntime.jsx(SidePanelMain.SidePanelMain, { ...attributes?.SidePanelMain, children }),
                slotFooter && /* @__PURE__ */ jsxRuntime.jsx(SidePanelFooter.SidePanelFooter, { ...attributes?.SidePanelFooter, children: slotFooter })
              ]
            }
          )
        ]
      }
    );
  }
);
SidePanel.displayName = "SidePanel";

exports.SidePanel = SidePanel;
