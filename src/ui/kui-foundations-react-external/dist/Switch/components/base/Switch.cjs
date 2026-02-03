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
var Label = require('../../../Label/index.cjs');
var useElementAttributes = require('../../../lib/hooks/use-element-attributes.cjs');
var SwitchRoot = require('../composed/SwitchRoot.cjs');
var SwitchThumb = require('../composed/SwitchThumb.cjs');
var SwitchTrack = require('../composed/SwitchTrack.cjs');

const Switch = react.forwardRef(
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
    const labelId = react.useId();
    const trackId = react.useId();
    const [rootAttrs, trackAttrs, thumbAttrs, labelAttrs] = useElementAttributes.useElementAttributes(
      props,
      ["div", SwitchRoot.SwitchRoot],
      ["button", SwitchTrack.SwitchTrack],
      ["span", SwitchThumb.SwitchThumb],
      ["label", Label.Label]
    );
    return /* @__PURE__ */ jsxRuntime.jsxs(SwitchRoot.SwitchRoot, { side: labelSide, size, ...rootAttrs, children: [
      /* @__PURE__ */ jsxRuntime.jsx(
        SwitchTrack.SwitchTrack,
        {
          "aria-labelledby": labelId,
          disabled,
          checked: checked ?? defaultChecked,
          onCheckedChange,
          id: trackId,
          ref,
          ...trackAttrs,
          ...attributes?.SwitchTrack,
          children: /* @__PURE__ */ jsxRuntime.jsx(SwitchThumb.SwitchThumb, { ...thumbAttrs, ...attributes?.SwitchThumb })
        }
      ),
      slotLabel && /* @__PURE__ */ jsxRuntime.jsx(
        Label.Label,
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

exports.Switch = Switch;
