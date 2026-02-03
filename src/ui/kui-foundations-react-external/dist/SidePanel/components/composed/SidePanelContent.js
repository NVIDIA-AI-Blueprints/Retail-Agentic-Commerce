/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef, useState, useEffect } from 'react';
import { DialogContent, DialogClose, DialogOverlay, DialogPortal } from '@radix-ui/react-dialog';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { Button } from '../../../Button/index.js';
import { Icon } from '../../../lib/components/Icon.js';
import { Slottable } from '../../../lib/components/Slottable.js';
import { densityVariant } from '../../../lib/constants/density.js';
import { PortalContext } from '../../../lib/context/portal-context.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { SidePanelTestIds } from '../../constants.js';
import { useSidePanelContext } from '../../context.js';

const sidePanelContent = cva("nv-side-panel-content", {
  variants: {
    density: densityVariant,
    side: {
      left: "nv-side-panel-content--side-left",
      right: "nv-side-panel-content--side-right"
    },
    bordered: {
      true: "nv-side-panel-content--bordered"
    }
  },
  defaultVariants: {
    side: "right",
    bordered: false
  }
});
const SidePanelContent = forwardRef(
  ({
    className,
    density,
    side,
    closeOnClickOutside = true,
    onPointerDownOutside,
    onInteractOutside,
    onOpenAutoFocus,
    portal = true,
    portalContainer,
    onEscapeKeyDown,
    bordered,
    asChild,
    children,
    forceMount,
    ...props
  }, ref) => {
    const Component = asChild ? Slot : "div";
    const context = useSidePanelContext();
    const [portalRef, setPortalRef] = useState(null);
    useEffect(() => {
      if (typeof window === "undefined") return;
      if (portal && !context.open) {
        const container = portalContainer ?? document.body;
        if (container instanceof HTMLElement) {
          container.style.removeProperty("pointer-events");
        }
      }
    }, [portal, portalContainer, context.open]);
    const content = /* @__PURE__ */ jsxs(PortalContext.Provider, { value: { portalRef }, children: [
      /* @__PURE__ */ jsx(
        DialogContent,
        {
          ref: setPortalRef,
          forceMount,
          onOpenAutoFocus,
          onPointerDownOutside: (event) => {
            if (!closeOnClickOutside) {
              event.preventDefault();
            }
            onPointerDownOutside?.(event);
          },
          onInteractOutside: (event) => {
            if (!closeOnClickOutside) {
              event.preventDefault();
            }
            onInteractOutside?.(event);
          },
          onEscapeKeyDown,
          "aria-describedby": void 0,
          asChild: true,
          children: /* @__PURE__ */ jsx(
            Component,
            {
              ...mergeProps(
                {
                  className: sidePanelContent({
                    className,
                    side,
                    bordered,
                    density
                  }),
                  ref,
                  "data-testid": SidePanelTestIds.SidePanelContent
                },
                props
              ),
              children: /* @__PURE__ */ jsx(Slottable, { asChild, child: children, children: (child) => /* @__PURE__ */ jsxs(Fragment, { children: [
                child,
                !context.hideCloseButton && /* @__PURE__ */ jsx(DialogClose, { asChild: true, children: /* @__PURE__ */ jsxs(
                  Button,
                  {
                    color: "neutral",
                    className: "nv-side-panel-close",
                    kind: "tertiary",
                    children: [
                      /* @__PURE__ */ jsx(Icon, { name: "close" }),
                      /* @__PURE__ */ jsx("span", { children: "Close Side Panel" })
                    ]
                  }
                ) })
              ] }) })
            }
          )
        }
      ),
      "r"
    ] });
    const conditionallyWrappedContent = context.modal ? /* @__PURE__ */ jsx(DialogOverlay, { className: "nv-side-panel-overlay", forceMount, children: content }) : content;
    return portal ? /* @__PURE__ */ jsx(DialogPortal, { forceMount, container: portalContainer, children: conditionallyWrappedContent }) : conditionallyWrappedContent;
  }
);
SidePanelContent.displayName = "SidePanelContent";

export { SidePanelContent };
