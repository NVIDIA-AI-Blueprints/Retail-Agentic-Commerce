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
var ModalContent = require('../composed/ModalContent.cjs');
var ModalFooter = require('../composed/ModalFooter.cjs');
var ModalHeading = require('../composed/ModalHeading.cjs');
var ModalMain = require('../composed/ModalMain.cjs');
var ModalRoot = require('../composed/ModalRoot.cjs');
var ModalTrigger = require('../composed/ModalTrigger.cjs');

const Modal = react.forwardRef(
  ({
    open,
    onOpenChange,
    density,
    defaultOpen,
    modal,
    portal,
    portalContainer,
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
    forceMount,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsxs(
      ModalRoot.ModalRoot,
      {
        open,
        onOpenChange,
        defaultOpen,
        modal,
        hideCloseButton,
        children: [
          slotTrigger && /* @__PURE__ */ jsxRuntime.jsx(ModalTrigger.ModalTrigger, { asChild: true, ...attributes?.ModalTrigger, children: slotTrigger }),
          /* @__PURE__ */ jsxRuntime.jsxs(
            ModalContent.ModalContent,
            {
              ref,
              density,
              forceMount,
              portalContainer,
              onOpenAutoFocus,
              closeOnClickOutside,
              portal,
              onEscapeKeyDown,
              onPointerDownOutside,
              onInteractOutside,
              ...props,
              children: [
                /* @__PURE__ */ jsxRuntime.jsx(ModalHeading.ModalHeading, { ...attributes?.ModalHeading, children: slotHeading }),
                /* @__PURE__ */ jsxRuntime.jsx(ModalMain.ModalMain, { ...attributes?.ModalMain, children }),
                slotFooter && /* @__PURE__ */ jsxRuntime.jsx(ModalFooter.ModalFooter, { ...attributes?.ModalFooter, children: slotFooter })
              ]
            }
          )
        ]
      }
    );
  }
);
Modal.displayName = "Modal";

exports.Modal = Modal;
