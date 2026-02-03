/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { Label } from '../../../Label/index.js';
import { RadioGroupItem } from '../composed/RadioGroupItem.js';
import { RadioGroupRoot } from '../composed/RadioGroupRoot.js';

const RadioGroup = forwardRef(
  ({ error, labelSide, items, ...props }, ref) => {
    return /* @__PURE__ */ jsx(RadioGroupRoot, { ref, error, ...props, children: items.map(({ attributes, ...option }) => /* @__PURE__ */ jsx(
      RadioGroupItem,
      {
        "aria-labelledby": `${option.value}-label`,
        labelSide,
        ...option,
        ...attributes?.RadioGroupItem,
        children: option.children && /* @__PURE__ */ jsx(
          Label,
          {
            id: `${option.value}-label`,
            htmlFor: option.value,
            disabled: option.disabled,
            ...attributes?.Label,
            children: option.children
          }
        )
      },
      option.value
    )) });
  }
);
RadioGroup.displayName = "RadioGroup";

export { RadioGroup };
