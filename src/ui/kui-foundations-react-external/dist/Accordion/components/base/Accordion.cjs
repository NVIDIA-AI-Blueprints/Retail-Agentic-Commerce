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
var AccordionContent = require('../composed/AccordionContent.cjs');
var AccordionItem = require('../composed/AccordionItem.cjs');
var AccordionRoot = require('../composed/AccordionRoot.cjs');
var AccordionTrigger = require('../composed/AccordionTrigger.cjs');

const Accordion = react.forwardRef(
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
    return /* @__PURE__ */ jsxRuntime.jsx(
      AccordionRoot.AccordionRoot,
      {
        collapsible: multiple ? void 0 : collapsible,
        multiple: multiple ?? kind === "multiple",
        defaultValue,
        onValueChange,
        value,
        ref,
        ...props,
        children: items.map((item) => /* @__PURE__ */ jsxRuntime.jsxs(
          AccordionItem.AccordionItem,
          {
            value: item.value,
            ...item.attributes?.AccordionItem,
            children: [
              /* @__PURE__ */ jsxRuntime.jsx(
                AccordionTrigger.AccordionTrigger,
                {
                  disabled: item.disabled,
                  iconSide: item.iconSide,
                  ...item.attributes?.AccordionTrigger,
                  children: item.slotTrigger
                }
              ),
              /* @__PURE__ */ jsxRuntime.jsx(AccordionContent.AccordionContent, { ...item.attributes?.AccordionContent, children: item.slotContent })
            ]
          },
          item.value
        ))
      }
    );
  }
);
Accordion.displayName = "Accordion";

exports.Accordion = Accordion;
