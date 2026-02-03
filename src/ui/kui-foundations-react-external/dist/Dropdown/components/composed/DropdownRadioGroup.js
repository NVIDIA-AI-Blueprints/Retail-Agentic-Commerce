/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import * as RadixDropdownPrimitives from '@radix-ui/react-dropdown-menu';
import { MenuRadioGroup } from '../../../Menu/index.js';
import useControllableState from '../../../lib/hooks/use-controllable-state.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { DropdownTestIds } from '../../constants.js';
import { DropdownRadioGroupContext } from '../../context.js';

const DropdownRadioGroup = forwardRef(({ value, defaultValue = "", onValueChange, ...props }, ref) => {
  const [internalValue, setInternalValue] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange
  });
  return /* @__PURE__ */ jsx(
    DropdownRadioGroupContext.Provider,
    {
      value: { value: internalValue, onValueChange: setInternalValue },
      children: /* @__PURE__ */ jsx(
        RadixDropdownPrimitives.RadioGroup,
        {
          value: internalValue,
          onValueChange: setInternalValue,
          asChild: true,
          children: /* @__PURE__ */ jsx(
            MenuRadioGroup,
            {
              ...mergeProps(
                { ref, "data-testid": DropdownTestIds.DropdownRadioGroup },
                props
              )
            }
          )
        }
      )
    }
  );
});
DropdownRadioGroup.displayName = "DropdownRadioGroup";

export { DropdownRadioGroup };
