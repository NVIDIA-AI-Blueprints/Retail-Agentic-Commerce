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
import { Primitive } from '../../../lib/components/primitive.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { PanelTestIds } from '../../constants.js';

const panelFooter = cva("nv-panel-footer");
const PanelFooter = forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      Primitive.div,
      {
        ...mergeProps(
          {
            className: panelFooter({ className }),
            ref,
            "data-testid": PanelTestIds.PanelFooter
          },
          props
        )
      }
    );
  }
);
PanelFooter.displayName = "PanelFooter";

export { PanelFooter };
