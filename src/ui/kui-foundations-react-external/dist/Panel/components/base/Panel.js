/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { Slottable } from '../../../lib/components/Slottable.js';
import { PanelContent } from '../composed/PanelContent.js';
import { PanelFooter } from '../composed/PanelFooter.js';
import { PanelHeader } from '../composed/PanelHeader.js';
import { PanelHeading } from '../composed/PanelHeading.js';
import { PanelIcon } from '../composed/PanelIcon.js';
import { PanelRoot } from '../composed/PanelRoot.js';

const Panel = forwardRef(
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
    const Component = asChild ? Slot : "div";
    return /* @__PURE__ */ jsx(
      PanelRoot,
      {
        density,
        elevation,
        ref,
        ...props,
        asChild: true,
        children: /* @__PURE__ */ jsx(Component, { children: /* @__PURE__ */ jsx(Slottable, { asChild, child: children, children: (child) => /* @__PURE__ */ jsxs(Fragment, { children: [
          (slotHeading || slotIcon) && /* @__PURE__ */ jsxs(PanelHeader, { ...attributes?.PanelHeader, children: [
            slotIcon && /* @__PURE__ */ jsx(PanelIcon, { ...attributes?.PanelIcon, children: slotIcon }),
            slotHeading && /* @__PURE__ */ jsx(PanelHeading, { ...attributes?.PanelHeading, children: slotHeading })
          ] }),
          children && /* @__PURE__ */ jsx(PanelContent, { ...attributes?.PanelContent, children: child }),
          slotFooter && /* @__PURE__ */ jsx(PanelFooter, { ...attributes?.PanelFooter, children: slotFooter })
        ] }) }) })
      }
    );
  }
);
Panel.displayName = "Panel";

export { Panel };
