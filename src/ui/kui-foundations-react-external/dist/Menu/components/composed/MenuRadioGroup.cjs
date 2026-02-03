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
var classVarianceAuthority = require('class-variance-authority');
var RadioGroup = require('../../../RadioGroup/index.cjs');
var primitive = require('../../../lib/components/primitive.cjs');
var useControllableState = require('../../../lib/hooks/use-controllable-state.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');
var context = require('../../context.cjs');
var MenuSection = require('./MenuSection.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var useControllableState__default = /*#__PURE__*/_interopDefault(useControllableState);

const menuRadioGroup = classVarianceAuthority.cva("nv-menu-radio-group");
const MenuRadioGroup = react.forwardRef(
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
    const [internalValue, setInternalValue] = useControllableState__default.default({
      value,
      defaultValue,
      onChange: onValueChange
    });
    return /* @__PURE__ */ jsxRuntime.jsx(
      context.MenuRadioGroupContext.Provider,
      {
        value: { value: internalValue, onValueChange: setInternalValue },
        children: /* @__PURE__ */ jsxRuntime.jsx(
          RadioGroup.RadioGroupRoot,
          {
            name,
            value: internalValue,
            onValueChange: setInternalValue,
            disabled,
            required,
            error,
            asChild: true,
            children: /* @__PURE__ */ jsxRuntime.jsx(MenuSection.MenuSection, { asChild: true, children: /* @__PURE__ */ jsxRuntime.jsx(
              primitive.Primitive.div,
              {
                ...mergeProps.mergeProps(
                  {
                    className: menuRadioGroup({ className }),
                    ref,
                    "data-testid": constants.MenuTestIds.MenuRadioGroup,
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

exports.MenuRadioGroup = MenuRadioGroup;
