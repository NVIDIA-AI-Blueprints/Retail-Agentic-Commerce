/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef, useRef, useCallback } from 'react';
import * as RadixDropdownPrimitives from '@radix-ui/react-dropdown-menu';
import { MenuCheckboxItem } from '../../../Menu/index.js';
import useControllableState from '../../../lib/hooks/use-controllable-state.js';
import { childrenToText } from '../../../lib/utils/children.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { DropdownTestIds } from '../../constants.js';

const DEBOUNCE_THRESHOLD = 50;
const DropdownCheckboxItem = forwardRef(
  ({
    checked,
    closeMenuOnSelect,
    defaultChecked,
    disabled,
    onCheckedChange,
    onSelect,
    filterValue,
    ...props
  }, ref) => {
    const lastInteractionTime = useRef(0);
    const handleCheckedChange = useCallback(
      (newChecked) => {
        const now = Date.now();
        if (now - lastInteractionTime.current < DEBOUNCE_THRESHOLD) {
          return;
        }
        lastInteractionTime.current = now;
        onCheckedChange?.(newChecked);
      },
      [onCheckedChange]
    );
    const [internalChecked, setInternalChecked] = useControllableState({
      value: checked,
      defaultValue: defaultChecked,
      onChange: handleCheckedChange
    });
    return /* @__PURE__ */ jsx(
      RadixDropdownPrimitives.CheckboxItem,
      {
        checked: internalChecked,
        disabled,
        onSelect: (e) => {
          if (!closeMenuOnSelect) {
            e.preventDefault();
          }
          setInternalChecked(
            internalChecked === "indeterminate" ? true : !internalChecked
          );
          onSelect?.(e);
        },
        textValue: filterValue ?? childrenToText(props.children),
        asChild: true,
        children: /* @__PURE__ */ jsx(
          MenuCheckboxItem,
          {
            ...mergeProps(
              { ref, "data-testid": DropdownTestIds.DropdownCheckboxItem },
              props
            ),
            checked: internalChecked,
            onCheckedChange: setInternalChecked,
            disabled
          }
        )
      }
    );
  }
);
DropdownCheckboxItem.displayName = "DropdownCheckboxItem";

export { DropdownCheckboxItem };
