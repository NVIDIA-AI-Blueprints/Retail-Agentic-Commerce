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
var reactDialog = require('@radix-ui/react-dialog');
var reactSlot = require('@radix-ui/react-slot');
var classVarianceAuthority = require('class-variance-authority');
var Button = require('../../../Button/index.cjs');
var Icon = require('../../../lib/components/Icon.cjs');
var Slottable = require('../../../lib/components/Slottable.cjs');
var density = require('../../../lib/constants/density.cjs');
var portalContext = require('../../../lib/context/portal-context.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');
var context = require('../../context.cjs');

const sidePanelContent = classVarianceAuthority.cva("nv-side-panel-content", {
  variants: {
    density: density.densityVariant,
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
const SidePanelContent = react.forwardRef(
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
    const Component = asChild ? reactSlot.Slot : "div";
    const context$1 = context.useSidePanelContext();
    const [portalRef, setPortalRef] = react.useState(null);
    react.useEffect(() => {
      if (typeof window === "undefined") return;
      if (portal && !context$1.open) {
        const container = portalContainer ?? document.body;
        if (container instanceof HTMLElement) {
          container.style.removeProperty("pointer-events");
        }
      }
    }, [portal, portalContainer, context$1.open]);
    const content = /* @__PURE__ */ jsxRuntime.jsxs(portalContext.PortalContext.Provider, { value: { portalRef }, children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        reactDialog.DialogContent,
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
          children: /* @__PURE__ */ jsxRuntime.jsx(
            Component,
            {
              ...mergeProps.mergeProps(
                {
                  className: sidePanelContent({
                    className,
                    side,
                    bordered,
                    density
                  }),
                  ref,
                  "data-testid": constants.SidePanelTestIds.SidePanelContent
                },
                props
              ),
              children: /* @__PURE__ */ jsxRuntime.jsx(Slottable.Slottable, { asChild, child: children, children: (child) => /* @__PURE__ */ jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [
                child,
                !context$1.hideCloseButton && /* @__PURE__ */ jsxRuntime.jsx(reactDialog.DialogClose, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsxs(
                  Button.Button,
                  {
                    color: "neutral",
                    className: "nv-side-panel-close",
                    kind: "tertiary",
                    children: [
                      /* @__PURE__ */ jsxRuntime.jsx(Icon.Icon, { name: "close" }),
                      /* @__PURE__ */ jsxRuntime.jsx("span", { children: "Close Side Panel" })
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
    const conditionallyWrappedContent = context$1.modal ? /* @__PURE__ */ jsxRuntime.jsx(reactDialog.DialogOverlay, { className: "nv-side-panel-overlay", forceMount, children: content }) : content;
    return portal ? /* @__PURE__ */ jsxRuntime.jsx(reactDialog.DialogPortal, { forceMount, container: portalContainer, children: conditionallyWrappedContent }) : conditionallyWrappedContent;
  }
);
SidePanelContent.displayName = "SidePanelContent";

exports.SidePanelContent = SidePanelContent;
