/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var Modal_js = require('./components/base/Modal.cjs');
var ModalRoot_js = require('./components/composed/ModalRoot.cjs');
var ModalTrigger_js = require('./components/composed/ModalTrigger.cjs');
var ModalContent_js = require('./components/composed/ModalContent.cjs');
var ModalHeading_js = require('./components/composed/ModalHeading.cjs');
var ModalMain_js = require('./components/composed/ModalMain.cjs');
var ModalFooter_js = require('./components/composed/ModalFooter.cjs');
var constants_js = require('./constants.cjs');



Object.defineProperty(exports, "Modal", {
  enumerable: true,
  get: function () { return Modal_js.Modal; }
});
Object.defineProperty(exports, "ModalRoot", {
  enumerable: true,
  get: function () { return ModalRoot_js.ModalRoot; }
});
Object.defineProperty(exports, "ModalTrigger", {
  enumerable: true,
  get: function () { return ModalTrigger_js.ModalTrigger; }
});
Object.defineProperty(exports, "ModalContent", {
  enumerable: true,
  get: function () { return ModalContent_js.ModalContent; }
});
Object.defineProperty(exports, "ModalHeading", {
  enumerable: true,
  get: function () { return ModalHeading_js.ModalHeading; }
});
Object.defineProperty(exports, "ModalMain", {
  enumerable: true,
  get: function () { return ModalMain_js.ModalMain; }
});
Object.defineProperty(exports, "ModalFooter", {
  enumerable: true,
  get: function () { return ModalFooter_js.ModalFooter; }
});
Object.defineProperty(exports, "ModalTestIds", {
  enumerable: true,
  get: function () { return constants_js.ModalTestIds; }
});
