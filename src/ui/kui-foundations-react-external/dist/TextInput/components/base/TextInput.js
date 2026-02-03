/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { useElementAttributes } from '../../../lib/hooks/use-element-attributes.js';
import { TextInputElement } from '../composed/TextInputElement.js';
import { TextInputRoot } from '../composed/TextInputRoot.js';

const TextInput = forwardRef(
  ({
    size,
    slotLeft,
    slotRight,
    status,
    defaultValue,
    value,
    onValueChange,
    type,
    readOnly,
    disabled,
    dismissible,
    attributes,
    ...props
  }, ref) => {
    const [rootAttrs, valueAttrs] = useElementAttributes(
      props,
      ["div", TextInputRoot],
      ["input", TextInputElement]
    );
    return /* @__PURE__ */ jsx(
      TextInputRoot,
      {
        size,
        status,
        dismissible,
        slotLeft,
        slotRight,
        readOnly,
        disabled,
        value,
        defaultValue,
        onValueChange,
        ...rootAttrs,
        children: /* @__PURE__ */ jsx(
          TextInputElement,
          {
            ref,
            type,
            ...valueAttrs,
            ...attributes?.TextInputValue
          }
        )
      }
    );
  }
);
TextInput.displayName = "TextInput";

export { TextInput };
