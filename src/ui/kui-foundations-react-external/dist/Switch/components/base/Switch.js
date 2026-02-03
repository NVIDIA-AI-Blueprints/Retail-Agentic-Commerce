/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsxs, jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef, useId } from 'react';
import { Label } from '../../../Label/index.js';
import { useElementAttributes } from '../../../lib/hooks/use-element-attributes.js';
import { SwitchRoot } from '../composed/SwitchRoot.js';
import { SwitchThumb } from '../composed/SwitchThumb.js';
import { SwitchTrack } from '../composed/SwitchTrack.js';

const Switch = forwardRef(
  ({
    slotLabel,
    labelSide = "right",
    size = "medium",
    checked,
    onCheckedChange,
    defaultChecked,
    disabled,
    attributes,
    ...props
  }, ref) => {
    const labelId = useId();
    const trackId = useId();
    const [rootAttrs, trackAttrs, thumbAttrs, labelAttrs] = useElementAttributes(
      props,
      ["div", SwitchRoot],
      ["button", SwitchTrack],
      ["span", SwitchThumb],
      ["label", Label]
    );
    return /* @__PURE__ */ jsxs(SwitchRoot, { side: labelSide, size, ...rootAttrs, children: [
      /* @__PURE__ */ jsx(
        SwitchTrack,
        {
          "aria-labelledby": labelId,
          disabled,
          checked: checked ?? defaultChecked,
          onCheckedChange,
          id: trackId,
          ref,
          ...trackAttrs,
          ...attributes?.SwitchTrack,
          children: /* @__PURE__ */ jsx(SwitchThumb, { ...thumbAttrs, ...attributes?.SwitchThumb })
        }
      ),
      slotLabel && /* @__PURE__ */ jsx(
        Label,
        {
          id: labelId,
          htmlFor: trackId,
          size,
          disabled,
          ...labelAttrs,
          ...attributes?.Label,
          children: slotLabel
        }
      )
    ] });
  }
);
Switch.displayName = "Switch";

export { Switch };
