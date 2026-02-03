/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsxs, jsx } from 'react/jsx-runtime';
// foundations-css import removed
import React from 'react';
import { Label } from '../../../Label/index.js';
import { useElementAttributes } from '../../../lib/hooks/use-element-attributes.js';
import { CheckboxBox } from '../composed/CheckboxBox.js';
import { CheckboxIndicator } from '../composed/CheckboxIndicator.js';
import { CheckboxRoot } from '../composed/CheckboxRoot.js';

const Checkbox = React.forwardRef(
  ({
    labelSide,
    slotLabel,
    disabled,
    error,
    attributes,
    className,
    checked,
    defaultChecked,
    onCheckedChange,
    ...props
  }, ref) => {
    const boxId = React.useId();
    const labelId = React.useId();
    const [rootAttrs, boxAttrs, indicatorAttrs, labelAttrs] = useElementAttributes(
      props,
      ["div", CheckboxRoot],
      ["button", CheckboxBox],
      ["div", CheckboxIndicator],
      ["label", Label]
    );
    return /* @__PURE__ */ jsxs(CheckboxRoot, { className, labelSide, ...rootAttrs, children: [
      /* @__PURE__ */ jsx(
        CheckboxBox,
        {
          checked,
          onCheckedChange,
          defaultChecked,
          disabled,
          error,
          ref,
          id: boxId,
          "aria-labelledby": labelId,
          ...boxAttrs,
          ...attributes?.CheckboxBox,
          children: /* @__PURE__ */ jsx(
            CheckboxIndicator,
            {
              checked,
              error,
              ...indicatorAttrs
            }
          )
        }
      ),
      slotLabel && /* @__PURE__ */ jsx(
        Label,
        {
          disabled,
          id: labelId,
          htmlFor: boxId,
          ...labelAttrs,
          ...attributes?.Label,
          children: slotLabel
        }
      )
    ] });
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
