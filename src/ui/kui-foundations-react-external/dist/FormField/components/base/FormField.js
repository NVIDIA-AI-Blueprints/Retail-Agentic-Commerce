/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

import { jsxs, jsx } from 'react/jsx-runtime';
// foundations-css import removed
import { forwardRef, useId, useMemo } from 'react';
import { Label } from '../../../Label/index.js';
import { Tooltip } from '../../../Tooltip/index.js';
import { Icon } from '../../../lib/components/Icon.js';
import { mergeProps } from '../../../lib/utils/merge-props.js';
import { FormFieldContentGroup } from '../composed/FormFieldContentGroup.js';
import { FormFieldHelper } from '../composed/FormFieldHelper.js';
import { FormFieldLabelGroup } from '../composed/FormFieldLabelGroup.js';
import { FormFieldRoot } from '../composed/FormFieldRoot.js';

const FormField = forwardRef(
  ({
    id,
    name,
    status,
    labelPosition = "top",
    slotLabel,
    slotInfo,
    slotError,
    slotSuccess,
    slotHelp,
    children,
    required,
    attributes,
    ...props
  }, ref) => {
    const generatedId = useId();
    const internalId = id || generatedId;
    const helper = useMemo(() => {
      if (slotSuccess && status === "success") {
        return slotSuccess;
      }
      if (slotError && status === "error") {
        return slotError;
      }
      if (slotHelp && !status) {
        return slotHelp;
      }
    }, [slotSuccess, slotError, slotHelp, status]);
    const helperId = helper ? attributes?.FormFieldHelper?.id || `${internalId}-helper` : void 0;
    const labelId = slotLabel ? attributes?.Label?.id || `${internalId}-label` : void 0;
    const infoId = slotInfo ? attributes?.TooltipTrigger?.id || `${internalId}-info` : void 0;
    return /* @__PURE__ */ jsxs(FormFieldRoot, { ...mergeProps({ ref, labelPosition, required }, props), children: [
      /* @__PURE__ */ jsxs(FormFieldContentGroup, { ...attributes?.FormFieldContentGroup, children: [
        (slotLabel || slotInfo) && /* @__PURE__ */ jsxs(FormFieldLabelGroup, { ...attributes?.FormFieldLabelGroup, children: [
          slotLabel && /* @__PURE__ */ jsx(Label, { htmlFor: internalId, id: labelId, ...attributes?.Label, children: slotLabel }),
          slotInfo && /* @__PURE__ */ jsx(
            Tooltip,
            {
              slotContent: slotInfo,
              id: infoId,
              attributes: { TooltipTrigger: attributes?.TooltipTrigger },
              ...attributes?.TooltipContent,
              children: /* @__PURE__ */ jsx(Icon, { name: "info-circle" })
            }
          )
        ] }),
        typeof children === "function" ? children({
          id: internalId,
          status,
          name,
          required,
          "aria-describedby": helperId,
          "aria-labelledby": labelId,
          "aria-details": infoId
        }) : children
      ] }),
      helper && /* @__PURE__ */ jsx(
        FormFieldHelper,
        {
          kind: status,
          id: helperId,
          ...attributes?.FormFieldHelper,
          children: helper
        }
      )
    ] });
  }
);
FormField.displayName = "FormField";

export { FormField };
