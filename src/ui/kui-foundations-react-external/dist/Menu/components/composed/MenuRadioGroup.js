/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { cva } from 'class-variance-authority';
import { RadioGroupRoot } from '../../../RadioGroup/index.js';
import { Primitive } from '../../../lib/components/primitive.js';
import useControllableState from '../../../lib/hooks/use-controllable-state.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { MenuTestIds } from '../../constants.js';
import { MenuRadioGroupContext } from '../../context.js';
import { MenuSection } from './MenuSection.js';

const menuRadioGroup = cva("nv-menu-radio-group");
const MenuRadioGroup = forwardRef(
  ({
    className,
    name,
    defaultValue = "",
    value,
    onValueChange,
    disabled,
    required,
    error,
    ...props
  }, ref) => {
    const [internalValue, setInternalValue] = useControllableState({
      value,
      defaultValue,
      onChange: onValueChange
    });
    return /* @__PURE__ */ jsx(
      MenuRadioGroupContext.Provider,
      {
        value: { value: internalValue, onValueChange: setInternalValue },
        children: /* @__PURE__ */ jsx(
          RadioGroupRoot,
          {
            name,
            value: internalValue,
            onValueChange: setInternalValue,
            disabled,
            required,
            error,
            asChild: true,
            children: /* @__PURE__ */ jsx(MenuSection, { asChild: true, children: /* @__PURE__ */ jsx(
              Primitive.div,
              {
                ...mergeProps(
                  {
                    className: menuRadioGroup({ className }),
                    ref,
                    "data-testid": MenuTestIds.MenuRadioGroup,
                    role: "group"
                  },
                  props
                )
              }
            ) })
          }
        )
      }
    );
  }
);
MenuRadioGroup.displayName = "MenuRadioGroup";

export { MenuRadioGroup };
