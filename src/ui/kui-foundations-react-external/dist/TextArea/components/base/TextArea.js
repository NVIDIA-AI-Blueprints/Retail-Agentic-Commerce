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
import { TextAreaElement } from '../composed/TextAreaElement.js';
import { TextAreaRoot } from '../composed/TextAreaRoot.js';

const TextArea = forwardRef(
  ({
    resizeable,
    size,
    status,
    attributes,
    value,
    onValueChange,
    defaultValue,
    readOnly,
    disabled,
    slotLeft,
    slotRight,
    ...props
  }, ref) => {
    const [rootAttrs, elementAttrs] = useElementAttributes(
      props,
      ["div", TextAreaRoot],
      ["textarea", TextAreaElement]
    );
    return /* @__PURE__ */ jsx(
      TextAreaRoot,
      {
        size,
        status,
        value,
        onValueChange,
        defaultValue,
        readOnly,
        disabled,
        slotLeft,
        slotRight,
        ...rootAttrs,
        children: /* @__PURE__ */ jsx(
          TextAreaElement,
          {
            ref,
            resizeable,
            ...elementAttrs,
            ...attributes?.TextAreaElement
          }
        )
      }
    );
  }
);
TextArea.displayName = "TextArea";

export { TextArea };
