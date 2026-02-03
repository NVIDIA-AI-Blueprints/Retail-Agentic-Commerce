/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef, useCallback } from 'react';
import { useStoreState, useComboboxContext as useComboboxContext$1, ComboboxPopover } from '@ariakit/react';
import { cva } from 'class-variance-authority';
import { MenuRoot } from '../../../Menu/index.js';
import { getDensityFromSize } from '../../../lib/constants/density.js';
import { usePortalContext } from '../../../lib/context/portal-context.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { ComboboxTestIds } from '../../constants.js';
import { useComboboxContext } from '../../context.js';

const comboboxContent = cva("nv-combobox-content");
const placementToSide = (placement) => placement === "top" ? "top" : placement === "left" ? "left" : placement === "right" ? "right" : "bottom";
const ComboboxContent = forwardRef(
  ({
    autoFocusOnHide,
    children,
    className,
    density,
    hideOnEscape,
    portal = true,
    portalContainer,
    ...props
  }, ref) => {
    const { disabled, readOnly, size } = useComboboxContext();
    const { portalRef } = usePortalContext();
    const currentPlacement = useStoreState(
      useComboboxContext$1(),
      "currentPlacement"
    );
    const renderProp = useCallback(
      (renderProps) => /* @__PURE__ */ jsx(
        MenuRoot,
        {
          ...mergeProps(props, {
            "aria-label": "Combobox list",
            "data-testid": ComboboxTestIds.ComboboxContent,
            className: comboboxContent({ className }),
            density: density ?? getDensityFromSize(size),
            ref,
            "data-side": placementToSide(currentPlacement),
            size
          }),
          asChild: true,
          children: /* @__PURE__ */ jsx("div", { ...renderProps })
        }
      ),
      [className, density, props, ref, size, currentPlacement]
    );
    return /* @__PURE__ */ jsx(
      ComboboxPopover,
      {
        autoFocusOnHide,
        disabled: readOnly || disabled,
        hideOnEscape,
        gutter: 4,
        sameWidth: true,
        portal,
        portalElement: portalContainer || portalRef,
        render: renderProp,
        children
      }
    );
  }
);
ComboboxContent.displayName = "ComboboxContent";

export { ComboboxContent };
