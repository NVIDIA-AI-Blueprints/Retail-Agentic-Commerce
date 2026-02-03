/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef, useCallback } from 'react';
import { useStoreState, useSelectContext as useSelectContext$1, SelectPopover } from '@ariakit/react';
import { cva } from 'class-variance-authority';
import { MenuRoot } from '../../../Menu/index.js';
import { getDensityFromSize } from '../../../lib/constants/density.js';
import { usePortalContext } from '../../../lib/context/portal-context.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { SelectTestIds } from '../../constants.js';
import { useSelectContext } from './SelectRoot.js';

const selectContent = cva("nv-select-content");
const placementToSide = (placement) => placement === "top" ? "top" : placement === "left" ? "left" : placement === "right" ? "right" : "bottom";
const SelectContent = forwardRef(
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
    const { disabled, readOnly, size } = useSelectContext();
    const placement = useStoreState(useSelectContext$1(), "currentPlacement");
    const { portalRef } = usePortalContext();
    const renderProp = useCallback(
      (renderProps) => /* @__PURE__ */ jsx(
        MenuRoot,
        {
          ...mergeProps(props, {
            ref,
            className: selectContent({ className }),
            "data-testid": SelectTestIds.SelectContent,
            "data-side": placementToSide(placement),
            "aria-label": "Select content",
            density: density ?? getDensityFromSize(size),
            size
          }),
          asChild: true,
          children: /* @__PURE__ */ jsx("div", { ...renderProps })
        }
      ),
      [className, density, props, ref, size, placement]
    );
    return /* @__PURE__ */ jsx(
      SelectPopover,
      {
        autoFocusOnHide,
        disabled: readOnly ?? disabled,
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
SelectContent.displayName = "SelectContent";

export { SelectContent };
