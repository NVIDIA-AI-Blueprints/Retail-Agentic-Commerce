/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { Dialog } from '@radix-ui/react-dialog';
import useControllableState from '../../../lib/hooks/use-controllable-state.js';
import { ModalTestIds } from '../../constants.js';
import { ModalContext } from '../../context.js';

const ModalRoot = ({
  open,
  onOpenChange,
  defaultOpen = false,
  modal = true,
  children,
  hideCloseButton
}) => {
  const [internalOpen, setInternalOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange
  });
  return /* @__PURE__ */ jsx(
    ModalContext.Provider,
    {
      value: {
        open: internalOpen,
        hideCloseButton: !!hideCloseButton,
        modal
      },
      children: /* @__PURE__ */ jsx(
        Dialog,
        {
          "data-testid": ModalTestIds.ModalRoot,
          open: internalOpen,
          onOpenChange: setInternalOpen,
          modal,
          children
        }
      )
    }
  );
};
ModalRoot.displayName = "ModalRoot";

export { ModalRoot };
