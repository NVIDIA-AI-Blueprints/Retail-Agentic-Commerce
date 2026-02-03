/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsxs, jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { SidePanelContent } from '../composed/SidePanelContent.js';
import { SidePanelFooter } from '../composed/SidePanelFooter.js';
import { SidePanelHeading } from '../composed/SidePanelHeading.js';
import { SidePanelMain } from '../composed/SidePanelMain.js';
import { SidePanelNavigation } from '../composed/SidePanelNavigation.js';
import { SidePanelRoot } from '../composed/SidePanelRoot.js';
import { SidePanelTrigger } from '../composed/SidePanelTrigger.js';

const SidePanel = forwardRef(
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
    return /* @__PURE__ */ jsxs(
      SidePanelRoot,
      {
        open,
        onOpenChange,
        defaultOpen,
        modal,
        hideCloseButton,
        children: [
          slotTrigger && /* @__PURE__ */ jsx(SidePanelTrigger, { asChild: true, ...attributes?.SidePanelTrigger, children: slotTrigger }),
          /* @__PURE__ */ jsxs(
            SidePanelContent,
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
                /* @__PURE__ */ jsx(SidePanelHeading, { ...attributes?.SidePanelHeading, children: slotHeading }),
                slotNavigation && /* @__PURE__ */ jsx(SidePanelNavigation, { ...attributes?.SidePanelNavigation, children: slotNavigation }),
                /* @__PURE__ */ jsx(SidePanelMain, { ...attributes?.SidePanelMain, children }),
                slotFooter && /* @__PURE__ */ jsx(SidePanelFooter, { ...attributes?.SidePanelFooter, children: slotFooter })
              ]
            }
          )
        ]
      }
    );
  }
);
SidePanel.displayName = "SidePanel";

export { SidePanel };
