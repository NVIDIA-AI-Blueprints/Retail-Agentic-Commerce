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
var primitive = require('../../../lib/components/primitive.cjs');
var mergeProps = require('../../../lib/utils/merge-props.cjs');
var constants = require('../../constants.cjs');

const modalFooter = classVarianceAuthority.cva("nv-modal-footer");
const ModalFooter = react.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsxRuntime.jsx(
      primitive.Primitive.div,
      {
        ...mergeProps.mergeProps(
          {
            className: modalFooter({ className }),
            ref,
            "data-testid": constants.ModalTestIds.ModalFooter
          },
          props
        )
      }
    );
  }
);
ModalFooter.displayName = "ModalFooter";

exports.ModalFooter = ModalFooter;
