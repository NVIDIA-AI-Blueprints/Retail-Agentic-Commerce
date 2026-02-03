/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var jsxRuntime = require('react/jsx-runtime');
// foundations-css import removed
var reactDialog = require('@radix-ui/react-dialog');
var useControllableState = require('../../../lib/hooks/use-controllable-state.cjs');
var constants = require('../../constants.cjs');
var context = require('../../context.cjs');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

var useControllableState__default = /*#__PURE__*/_interopDefault(useControllableState);

const ModalRoot = ({
  open,
  onOpenChange,
  defaultOpen = false,
  modal = true,
  children,
  hideCloseButton
}) => {
  const [internalOpen, setInternalOpen] = useControllableState__default.default({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange
  });
  return /* @__PURE__ */ jsxRuntime.jsx(
    context.ModalContext.Provider,
    {
      value: {
        open: internalOpen,
        hideCloseButton: !!hideCloseButton,
        modal
      },
      children: /* @__PURE__ */ jsxRuntime.jsx(
        reactDialog.Dialog,
        {
          "data-testid": constants.ModalTestIds.ModalRoot,
          open: internalOpen,
          onOpenChange: setInternalOpen,
          modal,
          children
        }
      )
    }
  );
};
ModalRoot.displayName = "ModalRoot";

exports.ModalRoot = ModalRoot;
