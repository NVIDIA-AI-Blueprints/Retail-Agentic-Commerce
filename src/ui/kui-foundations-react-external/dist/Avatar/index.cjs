/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var Avatar_js = require('./components/base/Avatar.cjs');
var AvatarRoot_js = require('./components/composed/AvatarRoot.cjs');
var AvatarImage_js = require('./components/composed/AvatarImage.cjs');
var AvatarFallback_js = require('./components/composed/AvatarFallback.cjs');
var constants_js = require('./constants.cjs');



Object.defineProperty(exports, "Avatar", {
  enumerable: true,
  get: function () { return Avatar_js.Avatar; }
});
Object.defineProperty(exports, "AvatarRoot", {
  enumerable: true,
  get: function () { return AvatarRoot_js.AvatarRoot; }
});
Object.defineProperty(exports, "AvatarImage", {
  enumerable: true,
  get: function () { return AvatarImage_js.AvatarImage; }
});
Object.defineProperty(exports, "AvatarFallback", {
  enumerable: true,
  get: function () { return AvatarFallback_js.AvatarFallback; }
});
Object.defineProperty(exports, "AvatarTestIds", {
  enumerable: true,
  get: function () { return constants_js.AvatarTestIds; }
});
