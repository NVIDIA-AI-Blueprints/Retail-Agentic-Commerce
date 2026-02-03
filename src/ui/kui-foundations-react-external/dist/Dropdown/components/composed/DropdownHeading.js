/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef } from 'react';
import { MenuHeading } from '../../../Menu/index.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { DropdownTestIds } from '../../constants.js';

const DropdownHeading = forwardRef(
  (props, ref) => {
    return /* @__PURE__ */ jsx(
      MenuHeading,
      {
        ...mergeProps(
          { ref, "data-testid": DropdownTestIds.DropdownHeading },
          props
        )
      }
    );
  }
);
DropdownHeading.displayName = "DropdownHeading";

export { DropdownHeading };
