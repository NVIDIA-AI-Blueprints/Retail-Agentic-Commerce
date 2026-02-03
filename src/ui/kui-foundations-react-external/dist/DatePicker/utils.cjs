/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

"use client";

'use strict';

var reactDayPicker = require('react-day-picker');
var tz = require('@date-fns/tz');
var dateFns = require('date-fns');
var constants = require('./constants.cjs');

const isDateRange = (value) => {
  return typeof value === "object" && value !== null && ("from" in value || "to" in value);
};
const isDate = (value) => {
  return value instanceof Date;
};
const formatDate = (date, formatString, formatFn, timeZone) => {
  try {
    if (formatFn) {
      return formatFn(date);
    }
    if (timeZone) {
      return dateFns.format(date, formatString || constants.DEFAULT_DATE_PICKER_FORMAT, {
        in: tz.tz(timeZone)
      });
    }
    return dateFns.format(date, formatString || constants.DEFAULT_DATE_PICKER_FORMAT);
  } catch {
    return "";
  }
};
const parseDate = (dateString, formatString, disabledMatcher, referenceDate, timeZone) => {
  if (!dateString || !dateString.trim()) {
    return void 0;
  }
  try {
    const baseDate = timeZone ? new tz.TZDate(referenceDate ?? /* @__PURE__ */ new Date(), timeZone) : referenceDate ?? /* @__PURE__ */ new Date();
    const parsedDate = dateFns.parse(dateString, formatString, baseDate);
    if (!dateFns.isValid(parsedDate)) {
      return void 0;
    }
    if (referenceDate) {
      parsedDate.setHours(referenceDate.getHours());
      parsedDate.setMinutes(referenceDate.getMinutes());
      parsedDate.setSeconds(referenceDate.getSeconds());
      parsedDate.setMilliseconds(referenceDate.getMilliseconds());
    }
    if (disabledMatcher && reactDayPicker.dateMatchModifiers(parsedDate, disabledMatcher)) {
      return void 0;
    }
    return parsedDate;
  } catch {
    return void 0;
  }
};
const isDatePickerValueEqual = (value1, value2) => {
  if (value1 === void 0 && value2 === void 0) {
    return true;
  }
  if (value1 === void 0 || value2 === void 0) {
    return false;
  }
  if (isDate(value1) && isDate(value2)) {
    return dateFns.isEqual(value1, value2);
  }
  if (isDateRange(value1) && isDateRange(value2)) {
    const fromEqual = value1.from && value2.from ? dateFns.isEqual(value1.from, value2.from) : value1.from === value2.from;
    const toEqual = value1.to && value2.to ? dateFns.isEqual(value1.to, value2.to) : value1.to === value2.to;
    return fromEqual && toEqual;
  }
  return false;
};
const getZonedTime = (date, timeZone) => {
  if (!timeZone) {
    return new Date(date);
  }
  const inputDate = new Date(date);
  return new tz.TZDate(
    inputDate.getFullYear(),
    inputDate.getMonth(),
    inputDate.getDate(),
    timeZone
  );
};

exports.formatDate = formatDate;
exports.getZonedTime = getZonedTime;
exports.isDate = isDate;
exports.isDatePickerValueEqual = isDatePickerValueEqual;
exports.isDateRange = isDateRange;
exports.parseDate = parseDate;
