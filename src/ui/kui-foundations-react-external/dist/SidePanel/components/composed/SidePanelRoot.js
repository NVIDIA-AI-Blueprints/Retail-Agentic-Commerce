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
import { SidePanelTestIds } from '../../constants.js';
import { SidePanelContext } from '../../context.js';

const SidePanelRoot = ({
  open,
  onOpenChange,
  defaultOpen = false,
  modal = false,
  children,
  hideCloseButton
}) => {
  const [internalOpen, setInternalOpen] = useControllableState({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange
  });
  return /* @__PURE__ */ jsx(
    SidePanelContext.Provider,
    {
      value: {
        modal,
        open: internalOpen,
        hideCloseButton: !!hideCloseButton
      },
      children: /* @__PURE__ */ jsx(
        Dialog,
        {
          "data-testid": SidePanelTestIds.SidePanelRoot,
          open: internalOpen,
          onOpenChange: setInternalOpen,
          modal,
          children
        }
      )
    }
  );
};
SidePanelRoot.displayName = "SidePanelRoot";

export { SidePanelRoot };
