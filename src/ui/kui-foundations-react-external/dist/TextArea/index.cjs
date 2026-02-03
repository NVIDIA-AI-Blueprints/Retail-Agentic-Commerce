/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var TextArea_js = require('./components/base/TextArea.cjs');
var TextAreaRoot_js = require('./components/composed/TextAreaRoot.cjs');
var TextAreaElement_js = require('./components/composed/TextAreaElement.cjs');
var constants_js = require('./constants.cjs');



Object.defineProperty(exports, "TextArea", {
  enumerable: true,
  get: function () { return TextArea_js.TextArea; }
});
Object.defineProperty(exports, "TextAreaRoot", {
  enumerable: true,
  get: function () { return TextAreaRoot_js.TextAreaRoot; }
});
Object.defineProperty(exports, "TextAreaElement", {
  enumerable: true,
  get: function () { return TextAreaElement_js.TextAreaElement; }
});
Object.defineProperty(exports, "TextAreaTestIds", {
  enumerable: true,
  get: function () { return constants_js.TextAreaTestIds; }
});
