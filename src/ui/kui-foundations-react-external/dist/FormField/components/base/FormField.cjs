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
var Label = require('../../../Label/index.cjs');
var Tooltip = require('../../../Tooltip/index.cjs');
var Icon = require('../../../lib/components/Icon.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var FormFieldContentGroup = require('../composed/FormFieldContentGroup.cjs');
var FormFieldHelper = require('../composed/FormFieldHelper.cjs');
var FormFieldLabelGroup = require('../composed/FormFieldLabelGroup.cjs');
var FormFieldRoot = require('../composed/FormFieldRoot.cjs');

const FormField = react.forwardRef(
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
    const generatedId = react.useId();
    const internalId = id || generatedId;
    const helper = react.useMemo(() => {
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
    return /* @__PURE__ */ jsxRuntime.jsxs(FormFieldRoot.FormFieldRoot, { ...mergeProps.mergeProps({ ref, labelPosition, required }, props), children: [
      /* @__PURE__ */ jsxRuntime.jsxs(FormFieldContentGroup.FormFieldContentGroup, { ...attributes?.FormFieldContentGroup, children: [
        (slotLabel || slotInfo) && /* @__PURE__ */ jsxRuntime.jsxs(FormFieldLabelGroup.FormFieldLabelGroup, { ...attributes?.FormFieldLabelGroup, children: [
          slotLabel && /* @__PURE__ */ jsxRuntime.jsx(Label.Label, { htmlFor: internalId, id: labelId, ...attributes?.Label, children: slotLabel }),
          slotInfo && /* @__PURE__ */ jsxRuntime.jsx(
            Tooltip.Tooltip,
            {
              slotContent: slotInfo,
              id: infoId,
              attributes: { TooltipTrigger: attributes?.TooltipTrigger },
              ...attributes?.TooltipContent,
              children: /* @__PURE__ */ jsxRuntime.jsx(Icon.Icon, { name: "info-circle" })
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
      helper && /* @__PURE__ */ jsxRuntime.jsx(
        FormFieldHelper.FormFieldHelper,
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

exports.FormField = FormField;
