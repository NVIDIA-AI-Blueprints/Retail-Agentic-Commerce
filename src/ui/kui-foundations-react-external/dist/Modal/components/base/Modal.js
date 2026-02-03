/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsxs, jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { ModalContent } from '../composed/ModalContent.js';
import { ModalFooter } from '../composed/ModalFooter.js';
import { ModalHeading } from '../composed/ModalHeading.js';
import { ModalMain } from '../composed/ModalMain.js';
import { ModalRoot } from '../composed/ModalRoot.js';
import { ModalTrigger } from '../composed/ModalTrigger.js';

const Modal = forwardRef(
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
    return /* @__PURE__ */ jsxs(
      ModalRoot,
      {
        open,
        onOpenChange,
        defaultOpen,
        modal,
        hideCloseButton,
        children: [
          slotTrigger && /* @__PURE__ */ jsx(ModalTrigger, { asChild: true, ...attributes?.ModalTrigger, children: slotTrigger }),
          /* @__PURE__ */ jsxs(
            ModalContent,
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
                /* @__PURE__ */ jsx(ModalHeading, { ...attributes?.ModalHeading, children: slotHeading }),
                /* @__PURE__ */ jsx(ModalMain, { ...attributes?.ModalMain, children }),
                slotFooter && /* @__PURE__ */ jsx(ModalFooter, { ...attributes?.ModalFooter, children: slotFooter })
              ]
            }
          )
        ]
      }
    );
  }
);
Modal.displayName = "Modal";

export { Modal };
