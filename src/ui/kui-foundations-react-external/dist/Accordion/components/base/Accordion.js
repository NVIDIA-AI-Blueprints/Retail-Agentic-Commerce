/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx, jsxs } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { AccordionContent } from '../composed/AccordionContent.js';
import { AccordionItem } from '../composed/AccordionItem.js';
import { AccordionRoot } from '../composed/AccordionRoot.js';
import { AccordionTrigger } from '../composed/AccordionTrigger.js';

const Accordion = forwardRef(
  ({
    collapsible,
    defaultValue,
    items,
    kind,
    multiple,
    onValueChange,
    value,
    ...props
  }, ref) => {
    return /* @__PURE__ */ jsx(
      AccordionRoot,
      {
        collapsible: multiple ? void 0 : collapsible,
        multiple: multiple ?? kind === "multiple",
        defaultValue,
        onValueChange,
        value,
        ref,
        ...props,
        children: items.map((item) => /* @__PURE__ */ jsxs(
          AccordionItem,
          {
            value: item.value,
            ...item.attributes?.AccordionItem,
            children: [
              /* @__PURE__ */ jsx(
                AccordionTrigger,
                {
                  disabled: item.disabled,
                  iconSide: item.iconSide,
                  ...item.attributes?.AccordionTrigger,
                  children: item.slotTrigger
                }
              ),
              /* @__PURE__ */ jsx(AccordionContent, { ...item.attributes?.AccordionContent, children: item.slotContent })
            ]
          },
          item.value
        ))
      }
    );
  }
);
Accordion.displayName = "Accordion";

export { Accordion };
