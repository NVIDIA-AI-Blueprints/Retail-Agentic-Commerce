/*
 * SPDX-FileCopyrightText: Copyright (c) 2025 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
 *
 * EXTERNAL HEADER TODO
 */

import * as react from 'react';
import react__default, { ForwardRefExoticComponent, RefAttributes, JSXElementConstructor, ComponentPropsWithRef, ReactNode, PropsWithChildren, ReactElement } from 'react';
import * as class_variance_authority_types from 'class-variance-authority/types';
import { PrimitivePropsWithRef as PrimitivePropsWithRef$1 } from '@radix-ui/react-primitive';
import { VariantProps } from 'class-variance-authority';
import * as react_jsx_runtime from 'react/jsx-runtime';
import * as RadixCheckbox from '@radix-ui/react-checkbox';
import { ComboboxPopoverProps } from '@ariakit/react';
import { DayButtonProps, DateRange, Matcher } from 'react-day-picker';

/**
 * HTML Element Attribute Mappings
 *
 * @internal
 * This is a specialized internal mapping used primarily for Base component prop forwarding.
 * It is NOT meant to be an exhaustive list of all possible HTML element's and their associated attributes.
 */
/**
 * Common attributes
 * @see {@link https://react.dev/reference/react-dom/components/common}
 */
declare const COMMON_ATTRIBUTES: readonly ["dangerouslySetInnerHTML", "suppressContentEditableWarning", "suppressHydrationWarning", "style", "accessKey", "autoCapitalize", "className", "contentEditable", "dir", "draggable", "enterKeyHint", "hidden", "id", "is", "inputMode", "itemProp", "lang", "onAnimationEnd", "onAnimationEndCapture", "onAnimationIteration", "onAnimationIterationCapture", "onAnimationStart", "onAnimationStartCapture", "onAuxClick", "onAuxClickCapture", "onBeforeInput", "onBeforeInputCapture", "onBlur", "onBlurCapture", "onClick", "onClickCapture", "onCompositionStart", "onCompositionStartCapture", "onCompositionEnd", "onCompositionEndCapture", "onCompositionUpdate", "onCompositionUpdateCapture", "onContextMenu", "onContextMenuCapture", "onCopy", "onCopyCapture", "onCut", "onCutCapture", "onDoubleClick", "onDoubleClickCapture", "onDrag", "onDragCapture", "onDragEnd", "onDragEndCapture", "onDragEnter", "onDragEnterCapture", "onDragOver", "onDragOverCapture", "onDragStart", "onDragStartCapture", "onDrop", "onDropCapture", "onFocus", "onFocusCapture", "onGotPointerCapture", "onGotPointerCaptureCapture", "onKeyDown", "onKeyDownCapture", "onKeyPress", "onKeyPressCapture", "onKeyUp", "onKeyUpCapture", "onLostPointerCapture", "onLostPointerCaptureCapture", "onMouseDown", "onMouseDownCapture", "onMouseEnter", "onMouseLeave", "onMouseMove", "onMouseMoveCapture", "onMouseOut", "onMouseOutCapture", "onMouseUp", "onMouseUpCapture", "onPointerCancel", "onPointerCancelCapture", "onPointerDown", "onPointerDownCapture", "onPointerEnter", "onPointerLeave", "onPointerMove", "onPointerMoveCapture", "onPointerOut", "onPointerOutCapture", "onPointerUp", "onPointerUpCapture", "onPaste", "onPasteCapture", "onScroll", "onScrollCapture", "onSelect", "onSelectCapture", "onTouchCancel", "onTouchCancelCapture", "onTouchEnd", "onTouchEndCapture", "onTouchMove", "onTouchMoveCapture", "onTouchStart", "onTouchStartCapture", "onTransitionEnd", "onTransitionEndCapture", "onWheel", "onWheelCapture", "role", "slot", "spellCheck", "tabIndex", "title", "translate", "onReset", "onResetCapture", "onSubmit", "onSubmitCapture", "onCancel", "onCancelCapture", "onClose", "onCloseCapture", "onToggle", "onToggleCapture", "onLoad", "onLoadCapture", "onError", "onErrorCapture", "onAbort", "onAbortCapture", "onCanPlay", "onCanPlayCapture", "onCanPlayThrough", "onCanPlayThroughCapture", "onDurationChange", "onDurationChangeCapture", "onEmptied", "onEmptiedCapture", "onEncrypted", "onEncryptedCapture", "onEnded", "onEndedCapture", "onLoadedData", "onLoadedDataCapture", "onLoadedMetadata", "onLoadedMetadataCapture", "onLoadStart", "onLoadStartCapture", "onPause", "onPauseCapture", "onPlay", "onPlayCapture", "onPlaying", "onPlayingCapture", "onProgress", "onProgressCapture", "onRateChange", "onRateChangeCapture", "onResize", "onResizeCapture", "onSeeked", "onSeekedCapture", "onSeeking", "onSeekingCapture", "onStalled", "onStalledCapture", "onSuspend", "onSuspendCapture", "onTimeUpdate", "onTimeUpdateCapture", "onVolumeChange", "onVolumeChangeCapture", "onWaiting", "onWaitingCapture"];
declare const ELEMENT_ATTRIBUTE_MAP: {
    readonly a: readonly ["href", "target", "rel", "download", "ping", "hrefLang", "referrerPolicy"];
    readonly form: readonly ["action"];
    readonly input: readonly ["accept", "alt", "capture", "autoComplete", "autoFocus", "checked", "defaultChecked", "defaultValue", "dirname", "disabled", "form", "formAction", "formEnctype", "formMethod", "formNoValidate", "formTarget", "height", "list", "max", "maxLength", "min", "minLength", "multiple", "name", "onChange", "onChangeCapture", "onInput", "onInputCapture", "onInvalid", "onInvalidCapture", "onSelect", "onSelectCapture", "pattern", "placeholder", "readOnly", "required", "size", "src", "step", "type", "value", "width", "aria-describedby", "aria-details", "aria-labelledby", "id"];
    readonly select: readonly ["autoComplete", "autoFocus", "children", "defaultValue", "disabled", "form", "multiple", "name", "onChange", "onChangeCapture", "onInput", "onInputCapture", "onInvalid", "onInvalidCapture", "required", "size", "value", "aria-describedby", "aria-details", "aria-labelledby", "id", "name"];
    readonly textarea: readonly ["autoComplete", "autoFocus", "cols", "defaultValue", "disabled", "form", "maxLength", "minLength", "name", "onChange", "onChangeCapture", "onInput", "onInputCapture", "onInvalid", "onInvalidCapture", "onSelect", "onSelectCapture", "placeholder", "readOnly", "required", "rows", "value", "wrap", "aria-describedby", "aria-details", "aria-labelledby", "id", "name"];
    readonly button: readonly ["type", "disabled", "form", "formAction", "formEnctype", "formMethod", "formNoValidate", "formTarget", "name", "value", "aria-describedby", "aria-details", "aria-labelledby", "id"];
    readonly label: readonly ["form", "htmlFor"];
    readonly img: readonly ["src", "alt", "width", "height", "loading", "decoding", "srcSet", "sizes", "crossOrigin", "referrerPolicy", "fetchPriority"];
    readonly progress: readonly ["max", "value"];
};

type ComponentType<P = any, T = any> = ForwardRefExoticComponent<P & RefAttributes<T>> | JSXElementConstructor<P>;
/**
 * A tuple type representing an HTML element and its corresponding React component
 * @typeParam T - The HTML element type (e.g., "div", "input")
 * @typeParam C - The React component type
 *
 * @example
 * ```tsx
 * type DivRoot = ElementComponentPair<"div", typeof RootComponent>;
 * type InputField = ElementComponentPair<"input", typeof InputComponent>;
 * ```
 */
type ElementComponentPair<T extends keyof react__default.JSX.IntrinsicElements = keyof react__default.JSX.IntrinsicElements, C extends ComponentType = ComponentType> = readonly [T, C];
/**
 * Type utility that allows mapping native HTML attributes to a component while ensuring type safety.
 * It filters out attributes that would conflict with the component's props and allows data attributes to be passed through.
 *
 * @typeParam T - The HTML element type (e.g., "div", "button")
 * @typeParam C - The component type to map attributes to
 *
 * @example
 * ```tsx
 * // Allow passing native div attributes to MyComponent
 * type Props = {
 *   attributes?: NativeElementAttributes<"div", typeof MyComponent>;
 * }
 * ```
 */
type NativeElementAttributes<T extends ElementComponentPair[0], C extends ElementComponentPair[1]> = {
    [K in keyof react__default.JSX.IntrinsicElements[T] as K extends "children" ? never : K extends keyof react__default.ComponentProps<C> ? react__default.ComponentProps<C>[K] extends react__default.JSX.IntrinsicElements[T][K] ? react__default.JSX.IntrinsicElements[T][K] extends react__default.ComponentProps<C>[K] ? K : never : never : K]: react__default.JSX.IntrinsicElements[T][K];
} & {
    [key: `data-${string}`]: string | number | boolean;
} & ("ref" extends keyof react__default.ComponentProps<C> ? {
    ref?: react__default.ComponentProps<C>["ref"];
} : Record<string, never>);
/**
 * Maps to our static attribute definitions from ELEMENT_ATTRIBUTE_MAP
 * @internal
 */
type AttributeMap = typeof ELEMENT_ATTRIBUTE_MAP;
/**
 * Recursively finds the first element that accepts an attribute and returns its type
 * @internal
 */
type GetAttributeTypeForIndex<K extends string, T extends readonly ElementComponentPair[]> = T extends readonly [
    infer First extends ElementComponentPair,
    ...infer Rest extends ElementComponentPair[]
] ? K extends keyof react__default.JSX.IntrinsicElements[First[0]] ? react__default.JSX.IntrinsicElements[First[0]][K] : GetAttributeTypeForIndex<K, Rest> : never;
/**
 * Creates a type containing all valid HTML attributes that can be hoisted to components
 * based on our static attribute maps.
 *
 * @remarks
 * This type creates a union of all attributes from the provided element types,
 * using our static maps to determine valid attributes. When an attribute is present
 * on multiple elements, the type comes from the first element in the list that
 * accepts it.
 *
 * @example
 * ```tsx
 * type AvatarProps = MergedHoistedElementAttributes<[
 *   ["div", typeof AvatarRoot],
 *   ["img", typeof AvatarImage],
 *   ["div", typeof AvatarFallback]
 * ]>;
 * // Results in a type with all div and img attributes from our maps
 * // with types from the first element that accepts each attribute
 * ```
 */
type MergedHoistedElementAttributes<T extends readonly ElementComponentPair[]> = Partial<{
    [K in T[number] extends readonly [infer E, unknown] ? E extends keyof AttributeMap ? (typeof ELEMENT_ATTRIBUTE_MAP)[E & keyof AttributeMap][number] : never : never]: K extends (typeof COMMON_ATTRIBUTES)[number] ? K extends keyof react__default.JSX.IntrinsicElements[T[0][0]] ? react__default.JSX.IntrinsicElements[T[0][0]][K] : never : GetAttributeTypeForIndex<K & string, T>;
} & {
    [K in (typeof COMMON_ATTRIBUTES)[number]]: K extends keyof react__default.JSX.IntrinsicElements[T[0][0]] ? react__default.JSX.IntrinsicElements[T[0][0]][K] : never;
} & {
    [key: `data-${string}`]: string | number | boolean;
    [key: `aria-${string}`]: string | number | boolean;
}>;

declare const primitiveClassName: (props?: ({
    gap?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "14" | "16" | "18" | "20" | "24" | "28" | "32" | "36" | "40" | "44" | "48" | "52" | "56" | "60" | "64" | "72" | "80" | "96" | "250" | "px" | "0.25" | "0.5" | "0.75" | "1.5" | "2.5" | "3.5" | "density-xxs" | "density-xs" | "density-sm" | "density-md" | "density-lg" | "density-xl" | "density-2xl" | "density-3xl" | "density-4xl" | "density-5xl" | null | undefined;
    padding?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "14" | "16" | "18" | "20" | "24" | "28" | "32" | "36" | "40" | "44" | "48" | "52" | "56" | "60" | "64" | "72" | "80" | "96" | "250" | "px" | "0.25" | "0.5" | "0.75" | "1.5" | "2.5" | "3.5" | "density-xxs" | "density-xs" | "density-sm" | "density-md" | "density-lg" | "density-xl" | "density-2xl" | "density-3xl" | "density-4xl" | "density-5xl" | null | undefined;
    paddingX?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "14" | "16" | "18" | "20" | "24" | "28" | "32" | "36" | "40" | "44" | "48" | "52" | "56" | "60" | "64" | "72" | "80" | "96" | "250" | "px" | "0.25" | "0.5" | "0.75" | "1.5" | "2.5" | "3.5" | "density-xxs" | "density-xs" | "density-sm" | "density-md" | "density-lg" | "density-xl" | "density-2xl" | "density-3xl" | "density-4xl" | "density-5xl" | null | undefined;
    paddingY?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "14" | "16" | "18" | "20" | "24" | "28" | "32" | "36" | "40" | "44" | "48" | "52" | "56" | "60" | "64" | "72" | "80" | "96" | "250" | "px" | "0.25" | "0.5" | "0.75" | "1.5" | "2.5" | "3.5" | "density-xxs" | "density-xs" | "density-sm" | "density-md" | "density-lg" | "density-xl" | "density-2xl" | "density-3xl" | "density-4xl" | "density-5xl" | null | undefined;
    paddingTop?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "14" | "16" | "18" | "20" | "24" | "28" | "32" | "36" | "40" | "44" | "48" | "52" | "56" | "60" | "64" | "72" | "80" | "96" | "250" | "px" | "0.25" | "0.5" | "0.75" | "1.5" | "2.5" | "3.5" | "density-xxs" | "density-xs" | "density-sm" | "density-md" | "density-lg" | "density-xl" | "density-2xl" | "density-3xl" | "density-4xl" | "density-5xl" | null | undefined;
    paddingRight?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "14" | "16" | "18" | "20" | "24" | "28" | "32" | "36" | "40" | "44" | "48" | "52" | "56" | "60" | "64" | "72" | "80" | "96" | "250" | "px" | "0.25" | "0.5" | "0.75" | "1.5" | "2.5" | "3.5" | "density-xxs" | "density-xs" | "density-sm" | "density-md" | "density-lg" | "density-xl" | "density-2xl" | "density-3xl" | "density-4xl" | "density-5xl" | null | undefined;
    paddingBottom?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "14" | "16" | "18" | "20" | "24" | "28" | "32" | "36" | "40" | "44" | "48" | "52" | "56" | "60" | "64" | "72" | "80" | "96" | "250" | "px" | "0.25" | "0.5" | "0.75" | "1.5" | "2.5" | "3.5" | "density-xxs" | "density-xs" | "density-sm" | "density-md" | "density-lg" | "density-xl" | "density-2xl" | "density-3xl" | "density-4xl" | "density-5xl" | null | undefined;
    paddingLeft?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "14" | "16" | "18" | "20" | "24" | "28" | "32" | "36" | "40" | "44" | "48" | "52" | "56" | "60" | "64" | "72" | "80" | "96" | "250" | "px" | "0.25" | "0.5" | "0.75" | "1.5" | "2.5" | "3.5" | "density-xxs" | "density-xs" | "density-sm" | "density-md" | "density-lg" | "density-xl" | "density-2xl" | "density-3xl" | "density-4xl" | "density-5xl" | null | undefined;
    spacing?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "14" | "16" | "18" | "20" | "24" | "28" | "32" | "36" | "40" | "44" | "sm" | "md" | "lg" | "xl" | "2xl" | "xs" | "3xl" | "4xl" | "5xl" | "48" | "52" | "56" | "60" | "64" | "72" | "80" | "96" | "250" | "px" | "0.25" | "0.5" | "0.75" | "1.5" | "2.5" | "3.5" | null | undefined;
    spacingX?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "14" | "16" | "18" | "20" | "24" | "28" | "32" | "36" | "40" | "44" | "sm" | "md" | "lg" | "xl" | "2xl" | "xs" | "3xl" | "4xl" | "5xl" | "48" | "52" | "56" | "60" | "64" | "72" | "80" | "96" | "250" | "px" | "0.25" | "0.5" | "0.75" | "1.5" | "2.5" | "3.5" | null | undefined;
    spacingY?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "14" | "16" | "18" | "20" | "24" | "28" | "32" | "36" | "40" | "44" | "sm" | "md" | "lg" | "xl" | "2xl" | "xs" | "3xl" | "4xl" | "5xl" | "48" | "52" | "56" | "60" | "64" | "72" | "80" | "96" | "250" | "px" | "0.25" | "0.5" | "0.75" | "1.5" | "2.5" | "3.5" | null | undefined;
    spacingTop?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "14" | "16" | "18" | "20" | "24" | "28" | "32" | "36" | "40" | "44" | "sm" | "md" | "lg" | "xl" | "2xl" | "xs" | "3xl" | "4xl" | "5xl" | "48" | "52" | "56" | "60" | "64" | "72" | "80" | "96" | "250" | "px" | "0.25" | "0.5" | "0.75" | "1.5" | "2.5" | "3.5" | null | undefined;
    spacingRight?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "14" | "16" | "18" | "20" | "24" | "28" | "32" | "36" | "40" | "44" | "sm" | "md" | "lg" | "xl" | "2xl" | "xs" | "3xl" | "4xl" | "5xl" | "48" | "52" | "56" | "60" | "64" | "72" | "80" | "96" | "250" | "px" | "0.25" | "0.5" | "0.75" | "1.5" | "2.5" | "3.5" | null | undefined;
    spacingBottom?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "14" | "16" | "18" | "20" | "24" | "28" | "32" | "36" | "40" | "44" | "sm" | "md" | "lg" | "xl" | "2xl" | "xs" | "3xl" | "4xl" | "5xl" | "48" | "52" | "56" | "60" | "64" | "72" | "80" | "96" | "250" | "px" | "0.25" | "0.5" | "0.75" | "1.5" | "2.5" | "3.5" | null | undefined;
    spacingLeft?: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "11" | "12" | "14" | "16" | "18" | "20" | "24" | "28" | "32" | "36" | "40" | "44" | "sm" | "md" | "lg" | "xl" | "2xl" | "xs" | "3xl" | "4xl" | "5xl" | "48" | "52" | "56" | "60" | "64" | "72" | "80" | "96" | "250" | "px" | "0.25" | "0.5" | "0.75" | "1.5" | "2.5" | "3.5" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare const primitive: (args?: Parameters<typeof primitiveClassName>[0]) => string;
type PrimitiveVariantProps = VariantProps<typeof primitive>;
type PrimitiveProps<E extends react__default.ElementType> = PrimitivePropsWithRef$1<E>;
interface PrimitiveComponentProps {
    /**
     * When true, renders the immediate child instead of the default element,
     * merging this component's props with the child's props.
     *
     * @example
     * ```tsx
     * // Without asChild - renders as a button
     * <Button>Content</Button>
     *
     * // With asChild - renders as an anchor with merged props
     * <Button asChild>
     *   <a>Content</a>
     * </Button>
     * ```
     */
    asChild?: boolean;
    /**
     * Sets spacing between flex and grid items.
     */
    gap?: PrimitiveVariantProps["gap"];
    /**
     * Sets padding.
     * @deprecated Use `padding` instead.
     */
    spacing?: PrimitiveVariantProps["spacing"];
    /**
     * Sets padding.
     */
    padding?: PrimitiveVariantProps["padding"];
    /**
     * Sets horizontal padding.
     * @deprecated Use `paddingX` instead.
     */
    spacingX?: PrimitiveVariantProps["spacingX"];
    /**
     * Sets horizontal padding.
     */
    paddingX?: PrimitiveVariantProps["paddingX"];
    /**
     * Sets vertical padding.
     * @deprecated Use `paddingY` instead.
     */
    spacingY?: PrimitiveVariantProps["spacingY"];
    /**
     * Sets vertical padding.
     */
    paddingY?: PrimitiveVariantProps["paddingY"];
    /**
     * Sets top padding.
     * @deprecated Use `paddingTop` instead.
     */
    spacingTop?: PrimitiveVariantProps["spacingTop"];
    /**
     * Sets top padding.
     */
    paddingTop?: PrimitiveVariantProps["paddingTop"];
    /**
     * Sets right padding.
     * @deprecated Use `paddingRight` instead.
     */
    spacingRight?: PrimitiveVariantProps["spacingRight"];
    /**
     * Sets right padding.
     */
    paddingRight?: PrimitiveVariantProps["paddingRight"];
    /**
     * Sets bottom padding.
     * @deprecated Use `paddingBottom` instead.
     */
    spacingBottom?: PrimitiveVariantProps["spacingBottom"];
    /**
     * Sets bottom padding.
     */
    paddingBottom?: PrimitiveVariantProps["paddingBottom"];
    /**
     * Sets left padding.
     * @deprecated Use `paddingLeft` instead.
     */
    spacingLeft?: PrimitiveVariantProps["spacingLeft"];
    /**
     * Sets left padding.
     */
    paddingLeft?: PrimitiveVariantProps["paddingLeft"];
}
type PrimitivePropsWithRef<E extends react__default.ElementType> = react__default.ComponentPropsWithRef<E> & {
    /**
     * When true, renders the immediate child instead of the default element,
     * merging this component's props with the child's props.
     *
     * @example
     * ```tsx
     * // Without asChild - renders as a button
     * <Button>Content</Button>
     *
     * // With asChild - renders as an anchor with merged props
     * <Button asChild>
     *   <a>Content</a>
     * </Button>
     * ```
     */
    asChild?: boolean;
    /**
     * The child node to render inside the component.
     */
    children?: react__default.ReactNode;
};

interface AccordionContentProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * Content of an {@link AccordionItem}. It is hidden by default and shown when the parent {@link AccordionTrigger} is activated.
 * Must be used within an {@link AccordionItem}.
 * @param props - props to be passed to the {@link AccordionContent} component
 * @see {@link AccordionContentProps}
 *
 * @example
 * ```tsx
 * <Accordion>
 *   <AccordionItem>
 *     ...
 *     <AccordionContent>
 *       ...
 *		 </AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 * ```
 */
declare const AccordionContent: react__default.ForwardRefExoticComponent<Omit<AccordionContentProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

interface AccordionItemProps extends PrimitivePropsWithRef<"div"> {
    /**
     * If true, the accordion item will be disabled and interaction will be prevented.
     */
    disabled?: boolean;
    /**
     * The unique identifier for the item. This is used to associate an item with state in AccordionRoot.
     */
    value: string;
}
/**
 * Represents an individual item within the {@link AccordionRoot} component. Must be used within an {@link AccordionRoot}.
 * @param props - props to be passed to the {@link AccordionItem} component.
 * @see {@link AccordionItemProps}
 *
 * @example
 * ```tsx
 * <Accordion>
 *   <AccordionItem>
 *     ...
 *   </AccordionItem>
 * </Accordion>
 * ```
 */
declare const AccordionItem: react__default.ForwardRefExoticComponent<Omit<AccordionItemProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

interface AccordionRootPropsBase extends Omit<PrimitivePropsWithRef<"div">, "defaultValue"> {
    /**
     * If true, the accordion will be disabled and interaction will be prevented.
     */
    disabled?: boolean;
}
type AccordionRootSingleAndMultipleProps = {
    /**
     * For single item accordions, this prop controls whether the open item can be clicked to close it.
     * When `collapsible` is false open items cannot be closed by clicking on them.
     *
     * This prop is only applicable to single item accordions, and is ignored when `multiple` is true.
     * @defaultValue true
     */
    collapsible?: boolean;
    /**
     * The default open item(s) in the accordion.
     */
    defaultValue?: string;
    /**
     * @remarks When `multiple` is true the Accordion allows for multiple accordion items to be open at a time.
     * @defaultValue false
     */
    multiple?: false;
    /**
     * Callback triggered when accordion items are opened or closed.
     */
    onValueChange?: (value: string) => void;
    /**
     * The currently open item(s) in the accordion.
     *
     * When setting this prop, you must also set the `onValueChange` prop to control the state of the accordion.
     */
    value?: string;
} | {
    collapsible?: never;
    defaultValue?: string[];
    multiple: true;
    onValueChange?: (value: string[]) => void;
    value?: string[];
};
type AccordionRootProps = AccordionRootPropsBase & AccordionRootSingleAndMultipleProps;
/**
 * Root component for an accordion. This is the container that holds all of the {@link AccordionItem} components
 * and is responsible for maintaining state.
 * @param props - props to be passed to the {@link AccordionRoot} component.
 * @see {@link AccordionRootProps}
 *
 * @example
 * ```tsx
 * <AccordionRoot multiple>
 * 		<AccordionItem value="1">
 * 			<AccordionTrigger>
 * 				Item 1
 * 				<AccordionIcon />
 * 			</AccordionTrigger>
 * 		</AccordionItem>
 * 		<AccordionItem value="2">
 * 			<AccordionTrigger disabled>
 * 				Item 2 (Disabled)
 * 				<AccordionIcon />
 * 			</AccordionTrigger>
 * 		</AccordionItem>
 * </AccordionRoot>
 * ```
 */
declare const AccordionRoot: react__default.ForwardRefExoticComponent<(Omit<AccordionRootPropsBase & {
    /**
     * For single item accordions, this prop controls whether the open item can be clicked to close it.
     * When `collapsible` is false open items cannot be closed by clicking on them.
     *
     * This prop is only applicable to single item accordions, and is ignored when `multiple` is true.
     * @defaultValue true
     */
    collapsible?: boolean;
    /**
     * The default open item(s) in the accordion.
     */
    defaultValue?: string;
    /**
     * @remarks When `multiple` is true the Accordion allows for multiple accordion items to be open at a time.
     * @defaultValue false
     */
    multiple?: false;
    /**
     * Callback triggered when accordion items are opened or closed.
     */
    onValueChange?: (value: string) => void;
    /**
     * The currently open item(s) in the accordion.
     *
     * When setting this prop, you must also set the `onValueChange` prop to control the state of the accordion.
     */
    value?: string;
}, "ref"> | Omit<AccordionRootPropsBase & {
    collapsible?: never;
    defaultValue?: string[];
    multiple: true;
    onValueChange?: (value: string[]) => void;
    value?: string[];
}, "ref">) & react__default.RefAttributes<HTMLDivElement>>;

type SlottablePropsWithRef<E extends react__default.ElementType> = Omit<PrimitivePropsWithRef<E>, "asChild"> & {
    /**
     * When true, treats the immediate child as the host element, merging this component's props
     * with the child's props. The child's children will be slotted into the component's defined
     * content placement.
     *
     * @example
     * ```tsx
     * // Without asChild - renders as a button
     * <Tag>Click me</Tag>
     *
     * // With asChild - renders as a link but maintains Tag's internal structure
     * <Tag asChild>
     *   <Link href="/somewhere">
     *     Click me
     *   </Link>
     * </Tag>
     *
     * // In both cases, "Click me" is placed in Tag's internal content area:
     * // <span class="nv-tag-content">Click me</span>
     * ```
     */
    asChild?: boolean;
};

declare const accordionTrigger: (props?: ({
    iconSide?: "left" | "right" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface AccordionTriggerProps extends SlottablePropsWithRef<"button"> {
    /**
     * Whether the button should be disabled or not. If disabled the accordion trigger will
     * not be clickable, and will render in a disabled state.
     * @defaultValue false
     */
    disabled?: boolean;
    /**
     * What side to render `slotIcon` on. If undefined it will render on the right side by default.
     * @defaultValue "right"
     */
    iconSide?: VariantProps<typeof accordionTrigger>["iconSide"];
    /**
     * The icon to render on the `iconSide` side of the trigger text.
     * @defaultValue `<AccordionIcon />`
     */
    slotIcon?: react__default.ReactNode;
}
/**
 * Trigger for toggling open/close on an individual AccordionItem. Must be used within an AccordionItem.
 * @param props - props to be passed to the {@link AccordionTrigger} component.
 * @see {@link AccordionRootProps}
 *
 * @example
 * ```tsx
 * <AccordionTrigger slotIcon={<AccordionIcon />}>Click me</AccordionTrigger>
 * ```
 */
declare const AccordionTrigger: react__default.ForwardRefExoticComponent<Omit<AccordionTriggerProps, "ref"> & react__default.RefAttributes<HTMLButtonElement>>;

interface AccordionBaseItem {
    /**
     * The content to render in the AccordionTrigger.
     */
    slotTrigger: react__default.ReactNode;
    /**
     * The content to render in the AccordionContent.
     */
    slotContent: react__default.ReactNode;
    /**
     * The value to uniquely reference the item in the accordion.
     * This is applied to the AccordionBaseItem.
     */
    value: string;
    /**
     * Whether or not the item should be disabled.
     * Defaults to `false`. This is applied to the AccordionTrigger.
     */
    disabled?: boolean;
    /**
     * What side the accordion open/close icon should render on.
     * @defaultValue "right"
     */
    iconSide?: AccordionTriggerProps["iconSide"];
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        AccordionItem?: NativeElementAttributes<"div", typeof AccordionItem>;
        AccordionTrigger?: NativeElementAttributes<"button", typeof AccordionTrigger>;
        AccordionContent?: NativeElementAttributes<"div", typeof AccordionContent>;
    };
}
interface AccordionPropsBase extends Omit<NativeElementAttributes<"div", typeof AccordionRoot>, "defaultValue"> {
    /**
     * The items to render in the accordion.
     */
    items: AccordionBaseItem[];
    /**
     * @deprecated Use the `multiple` prop instead for `kind="multiple"`. This will be removed in the next major version.
     */
    kind?: "single" | "multiple";
}
type AccordionProps = AccordionPropsBase & Pick<AccordionRootProps, "collapsible" | "defaultValue" | "multiple" | "onValueChange" | "value">;
/**
 * A ready-to-use accordion component that can be controlled or uncontrolled. It supports single and multiple selection modes.
 * Use this component for the most out-of-the-box solution.
 * @param props - props to be passed to the {@link Accordion} component
 * @see {@link AccordionProps}
 * @example
 * ```tsx
 * // Single selection mode.
 * <Accordion items={[
 *   {slotTrigger: 'Item 1', slotContent: 'Content for item 1', value: '1'},
 *   {slotTrigger: 'Item 2', slotContent: 'Content for item 2', value: '2'}
 * ]} />
 * ```
 *
 * @example
 * ```tsx
 * // Multiple selection mode.
 * <Accordion multiple items={[
 *    {slotTrigger: 'Item 1', slotContent: 'Content for item 1', value: '1'},
 *    {slotTrigger: 'Item 2', slotContent: 'Content for item 2', value: '2'}
 * ]} />
 * ```
 */
declare const Accordion: react__default.ForwardRefExoticComponent<Omit<AccordionProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

interface AccordionIconProps extends react__default.ComponentPropsWithRef<"i"> {
}
/**
 * Icon for an {@link AccordionTrigger} - defaults to {@link AnimatedChevron} pointing down.
 * @param props - props to be passed to the {@link AccordionIcon} component.
 * @see {@link AccordionIconProps}
 */
declare const AccordionIcon: react__default.ForwardRefExoticComponent<Omit<AccordionIconProps, "ref"> & react__default.RefAttributes<HTMLElement>>;

declare const AccordionTestIds: {
    readonly Accordion: "nv-accordion";
    readonly AccordionContent: "nv-accordion-content";
    readonly AccordionHeader: "nv-accordion-header";
    readonly AccordionItem: "nv-accordion-item";
    readonly AccordionRoot: "nv-accordion-root";
    readonly AccordionTrigger: "nv-accordion-trigger";
    readonly AccordionLabel: "nv-accordion-label";
    readonly AccordionIcon: "nv-accordion-icon";
};

declare const text: (props?: ({
    fontFamily?: "sans" | "mono" | null | undefined;
    fontWeight?: "bold" | "light" | "regular" | "semibold" | null | undefined;
    fontStyle?: "normal" | "italic" | null | undefined;
    fontSize?: "10" | "12" | "14" | "16" | "18" | "20" | "22" | "24" | "28" | "32" | "36" | "40" | "44" | "48" | "56" | "60" | "64" | "72" | "80" | "50" | null | undefined;
    underline?: boolean | null | undefined;
    lineHeight?: "100" | "125" | "150" | "175" | null | undefined;
    kind?: "body/bold/2xl" | "body/bold/3xl" | "body/bold/lg" | "body/bold/md" | "body/bold/xl" | "body/bold/sm" | "body/bold/xs" | "body/regular/lg" | "body/regular/md" | "body/regular/sm" | "body/regular/xl" | "body/regular/2xl" | "body/regular/3xl" | "body/regular/xs" | "body/semibold/2xl" | "body/semibold/3xl" | "body/semibold/lg" | "body/semibold/md" | "body/semibold/sm" | "body/semibold/xl" | "body/semibold/xs" | "display/2xl" | "display/xl" | "display/lg" | "display/md" | "display/sm" | "display/xs" | "label/bold/2xl" | "label/bold/3xl" | "label/bold/lg" | "label/bold/md" | "label/bold/sm" | "label/bold/xl" | "label/bold/xs" | "label/light/lg" | "label/light/xl" | "label/light/2xl" | "label/light/3xl" | "label/light/md" | "label/light/sm" | "label/light/xs" | "label/regular/lg" | "label/regular/md" | "label/regular/sm" | "label/regular/xs" | "label/regular/xl" | "label/regular/2xl" | "label/regular/3xl" | "label/semibold/lg" | "label/semibold/md" | "label/semibold/sm" | "label/semibold/xl" | "label/semibold/2xl" | "label/semibold/3xl" | "label/semibold/xs" | "mono/md" | "mono/sm" | "mono/lg" | "mono/xl" | "mono/2xl" | "title/2xl" | "title/xl" | "title/lg" | "title/md" | "title/sm" | "title/xs" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type TextVariantProps = VariantProps<typeof text>;
interface TextProps extends PrimitivePropsWithRef<"span"> {
    /**
     * The kind of text to display. We offer a variety of groupings:
     * - `display` - the largest text on the screen, use for short, important text or numerals
     * - `title` - smaller than `display` - use for medium-emphasis text that remains relatively short
     * - `body` - use for longer passages of text
     * - `label` - use for short labels
     * - `mono` - use for code or technical content
     *
     * Each of these groups has a variety of weights and sizes.
     *
     * @defaultValue "label/regular/md"
     */
    kind?: TextVariantProps["kind"];
    /**
     * The font weight of the text.
     * @defaultValue "regular"
     */
    fontWeight?: TextVariantProps["fontWeight"];
    /**
     * The font family of the text.
     * @defaultValue "sans"
     */
    fontFamily?: TextVariantProps["fontFamily"];
    /**
     * The font style of the text.
     * @defaultValue "normal"
     */
    fontStyle?: TextVariantProps["fontStyle"];
    /**
     * The font size of the text.
     * @defaultValue "md"
     */
    fontSize?: TextVariantProps["fontSize"];
    /**
     * The line-height of the text.
     * @defaultValue "normal"
     */
    lineHeight?: TextVariantProps["lineHeight"];
    /**
     * Whether or not the text should be underlined.
     */
    underline?: boolean;
}
/**
 * A primitive component for displaying text.
 *
 * @see {@link TextProps}
 *
 * @example
 * ```tsx
 * <Text kind="body/regular/sm">The quick brown fox jumps over the lazy dog</Text>
 * ```
 *
 * @example
 * ```tsx
 * // using a semantic heading
 * <Text asChild kind="title/lg">
 *   <h1>The quick brown fox jumps over the lazy dog</h1>
 * </Text>
 * ```
 */
declare const Text: react.ForwardRefExoticComponent<Omit<TextProps, "ref"> & react.RefAttributes<HTMLSpanElement>>;

declare const TextTestIds: {
    readonly Text: "nv-text";
};

declare const anchor: (props?: ({
    kind?: "inline" | "standalone" | null | undefined;
    disabled?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type AnchorVariantProps = VariantProps<typeof anchor>;
interface AnchorProps extends PrimitivePropsWithRef<"a">, Pick<TextProps, "fontWeight" | "fontFamily" | "fontStyle" | "fontSize" | "lineHeight" | "underline"> {
    /**
     * The kind of anchor to render. Use `"standalone"` when you don't want the anchor to have an underline.
     * @defaultValue "inline"
     */
    kind?: AnchorVariantProps["kind"];
    /**
     * The kind of text to display.
     * @defaultValue "body/regular/md"
     */
    textKind?: TextProps["kind"];
    /**
     * Whether the anchor is disabled.
     * @defaultValue false
     */
    disabled?: AnchorVariantProps["disabled"];
}
/**
 * A styled anchor element that provides consistent link styling across applications.
 * Supports both inline and standalone variants.
 * @param props - The component props
 * @see {@link AnchorProps}
 *
 * @example
 * <Anchor href="https://nvidia.com" kind="standalone">
 *   Visit Nvidia
 * </Anchor>
 *
 * @example
 * // using custom link component
 * <Anchor asChild kind="standalone">
 *   <NextLink href="https://nvidia.com">
 *     Visit Nvidia
 *   </NextLink>
 * </Anchor>
 */
declare const Anchor: react.ForwardRefExoticComponent<Omit<AnchorProps, "ref"> & react.RefAttributes<HTMLAnchorElement>>;

declare const AnchorTestIds: {
    readonly Anchor: "nv-anchor";
};

interface AnimatedChevronProps extends react__default.ComponentPropsWithRef<"i"> {
    /**
     * Used for determining whether the Chevron should point up or down, for elements that don't use
     * data-state in the parent component (ex: PolymorphicInput)
     */
    state?: "open" | "closed";
}
/**
 * Animates the ChevronDown icon, which is used in accordion- and menu-related components.
 * @param props - props to be passed to the {@link AnimatedChevron} component
 * @see {@link AnimatedChevronProps}
 *
 * @example
 * ```tsx
 * <AnimatedChevron state={context.open ? "open" : "closed"} />
 * ```
 */
declare const AnimatedChevron: react__default.ForwardRefExoticComponent<Omit<AnimatedChevronProps, "ref"> & react__default.RefAttributes<HTMLElement>>;

declare const AnimatedChevronTestIds: {
    readonly AnimatedChevron: "nv-animated-chevron";
};

interface AppBarProps extends ComponentPropsWithRef<"div"> {
    /**
     * The slot for the expander of the AppBar.
     * Note this is just placed above of `slotLeft` - this slot is for convenience of adding an expander
     * and not modifying the default logo. For more control, just use `slotLeft`.
     */
    slotExpander?: React.ReactNode;
    /**
     * The slot for the left side of the AppBar. Defaults to an NVIDIA logo.
     */
    slotLeft?: React.ReactNode;
    /**
     * The slot for the center of the AppBar.
     */
    slotCenter?: React.ReactNode;
    /**
     * The slot for the right side of the AppBar.
     */
    slotRight?: React.ReactNode;
}
/**
 * The App Bar provides an organized set of content and actions related to an entire product.
 * Also known as: header, masthead, navbar, navigation bar.
 * @param props - props to be passed to the {@link AppBar} component
 * @see {@link AppBarProps}
 *
 * @example
 * ```tsx
 *  <AppBar
 *     slotLeft={<Logo kind="standard">}
 *     slotCenter={<h1>Title</h1>}
 *     slotRight={<Button>Action</Button>}
 *  />
 * ```
 */
declare const AppBar: react.ForwardRefExoticComponent<Omit<AppBarProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare const button: (props?: ({
    size?: "small" | "medium" | "large" | "tiny" | null | undefined;
    kind?: "primary" | "secondary" | "tertiary" | null | undefined;
    color?: "brand" | "neutral" | "danger" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type ButtonVariantProps = VariantProps<typeof button>;
interface ButtonProps extends Omit<PrimitivePropsWithRef<"button">, "color"> {
    /**
     * The color of the button
     * @defaultValue "neutral"
     */
    color?: ButtonVariantProps["color"];
    /**
     * Whether the button should be disabled or not. If disabled the button will
     * not be clickable, and will render in a disabled state.
     */
    disabled?: boolean;
    /**
     * The kind of button - primary, secondary, tertiary
     * @defaultValue "primary"
     */
    kind?: ButtonVariantProps["kind"];
    /**
     * The size of the button.
     * @defaultValue "medium"
     */
    size?: ButtonVariantProps["size"];
    /**
     * @deprecated Use `kind` instead.
     */
    tone?: ButtonVariantProps["kind"];
}
/**
 * A button component.
 * @param props - props to be passed to the {@link Button} component
 * @see {@link ButtonProps}
 * @example
 * ```tsx
 * // a small secondary dangerous button
 * <Button color="danger" kind="secondary" size="small" />
 * ```
 * @example
 * ```tsx
 * // a disabled button with an icon in the beginning
 * <Button disabled onClick={handleClose}>
 *   <CommonClose />
 *   Close
 * </Button>
 * ```
 */
declare const Button: react__default.ForwardRefExoticComponent<Omit<ButtonProps, "ref"> & react__default.RefAttributes<HTMLButtonElement>>;

declare const AppBarExpanderButton: react.ForwardRefExoticComponent<Omit<ButtonProps, "ref"> & react.RefAttributes<HTMLButtonElement>>;

declare const logo: (props?: ({
    color?: "brand" | "neutral" | null | undefined;
    size?: "small" | "medium" | "large" | "xlarge" | "xxlarge" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type LogoVariantProps = VariantProps<typeof logo>;
declare const logoMap: Record<NonNullable<LogoProps["kind"]>, react__default.ElementType>;
interface LogoProps extends Omit<ComponentPropsWithRef<"div">, "children" | "color"> {
    /**
     * The color of the logo.
     */
    color?: LogoVariantProps["color"];
    /**
     * The type of the logo to render.
     * @defaultValue "horizontal"
     */
    kind?: "horizontal" | "vertical" | "logo-only";
    /**
     * The size of the logo. By default the logo is fluid in size and will fill the container.
     */
    size?: LogoVariantProps["size"];
}
/**
 * A Logo component.
 * @param props - props to be passed to the {@link Logo} component
 * @see {@link LogoProps}
 * @example
 * ```tsx
 * // a standard logo with green nv logo and NVIDIA text
 * <Logo kind="horizontal" />
 * ```
 */
declare const Logo: react__default.ForwardRefExoticComponent<Omit<LogoProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

/**
 * @remarks
 * This component is used to render the logo in the AppBar.
 * It renders a horizontal logo for small screens and a logo-only logo for larger screens.
 *
 * @example
 * ```tsx
 * <AppBar slotLeft={<AppBarLogo />} />
 * ```
 */
declare function AppBarLogo({ className, ...props }: LogoProps): react_jsx_runtime.JSX.Element;

declare const AppBarTestIds: {
    AppBarRoot: string;
    AppBarSlotLeft: string;
    AppBarSlotCenter: string;
    AppBarSlotRight: string;
};
/**
 * The height of the AppBar in pixels.
 */
declare const AppBarHeight = 48;
/**
 * The CSS variable name for the AppBar height.
 */
declare const AppBarHeightVariable = "--nv-app-bar-height";

interface AvatarFallbackProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * A fallback component for the Avatar that only renders when no image is loaded
 * @param props - props to be passed to the {@link AvatarFallback} component
 * @see {@link AvatarFallbackProps}
 * @example
 * ```tsx
 * <AvatarRoot size="large">
 *   <AvatarImage src={src} alt={alt} />
 *   <AvatarFallback>{fallback}</AvatarFallback>
 * </AvatarRoot>
 * ```
 */
declare const AvatarFallback: react__default.ForwardRefExoticComponent<Omit<AvatarFallbackProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

interface AvatarImageProps extends PrimitivePropsWithRef<"img"> {
}
/**
 * The Image used within the Avatar component
 * @param props - props to be passed to the {@link AvatarImage} component
 * @see {@link AvatarImageProps}
 * @example
 * ```tsx
 * <AvatarRoot size="large">
 *   <AvatarImage src={src} alt={alt} />
 *   <AvatarFallback>{fallback}</AvatarFallback>
 * </AvatarRoot>
 * ```
 */
declare const AvatarImage: react__default.ForwardRefExoticComponent<Omit<AvatarImageProps, "ref"> & react__default.RefAttributes<HTMLImageElement>>;

declare const avatar: (props?: ({
    size?: "small" | "medium" | "large" | "xlarge" | "xxlarge" | null | undefined;
    interactive?: boolean | null | undefined;
    kind?: "outline" | "solid" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type AvatarVariants = VariantProps<typeof avatar>;
interface AvatarRootProps extends PrimitivePropsWithRef<"span"> {
    /**
     * The size of the avatar.
     * @defaultValue "medium"
     */
    size?: AvatarVariants["size"];
    /**
     * The style of the avatar, either "outline" or "solid" (no outline).
     * @defaultValue "outline"
     */
    kind?: AvatarVariants["kind"];
    /**
     * If true, the avatar will have hover and active interactions and pointer styling.
     * These styles are automatically applied if an `onClick` is present, but can override.
     */
    interactive?: boolean;
}
/**
 * Root component for the Avatar component and and determines the component size
 * @param props - props to be passed to the {@link AvatarRoot} component
 * @see {@link AvatarImageProps}
 * @example
 * ```tsx
 * <AvatarRoot size="large">
 *   <AvatarImage src={src} alt={alt} />
 *   <AvatarFallback>{fallback}</AvatarFallback>
 * </AvatarRoot>
 * ```
 */
declare const AvatarRoot: react__default.ForwardRefExoticComponent<Omit<AvatarRootProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

interface AvatarProps extends Pick<AvatarRootProps, "size" | "interactive" | "kind">, MergedHoistedElementAttributes<[
    [
        "div",
        typeof AvatarRoot
    ],
    [
        "img",
        typeof AvatarImage
    ],
    [
        "div",
        typeof AvatarFallback
    ]
]> {
    /**
     * The source of the image for the users Avatar
     * */
    src?: string;
    /**
     * Alt text for the Avatar image
     */
    alt?: string;
    /**
     * Fallback text displayed in the event of no image source, or the image fails to load
     */
    fallback: react__default.ReactNode;
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        AvatarImage?: NativeElementAttributes<"img", typeof AvatarImage>;
        AvatarFallback?: NativeElementAttributes<"div", typeof AvatarFallback>;
    };
}
/**
 * Use an avatar whenever it's helpful to quickly identify a user. Prioritize images over text to improve clarity.
 * The user’s initial is a fallback when no image is available.
 * @param props - the props to be passed to the {@link Avatar} component
 * @see {@link AvatarProps}
 * @example
 * ```tsx
 * <Avatar size="large" src="https://nv/logo" fallback="N" />
 * ``` */
declare const Avatar: react__default.ForwardRefExoticComponent<AvatarProps & react__default.RefAttributes<HTMLDivElement>>;

declare const AvatarTestIds: {
    Avatar: string;
    AvatarFallback: string;
    AvatarImage: string;
    AvatarRoot: string;
};

declare const badge: (props?: ({
    kind?: "outline" | "solid" | null | undefined;
    color?: "blue" | "green" | "red" | "yellow" | "purple" | "teal" | "gray" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type BadgeVariantProps = VariantProps<typeof badge>;
interface BadgeProps extends Omit<PrimitivePropsWithRef<"span">, "color"> {
    /**
     * The badge color
     * @defaultValue "blue"
     */
    color?: BadgeVariantProps["color"];
    /**
     * The style of the badge
     * @defaultValue "outline"
     */
    kind?: BadgeVariantProps["kind"];
    /**
     * The type of the badge
     * @deprecated use `kind` instead
     */
    type?: "outline" | "solid" | "bold";
}
/**
 * A badge is a small label that uses color-coding to draw attention to an item’s status or metadata.
 * @param props - props to be passed to the {@link Badge} component
 * @see {@link BadgeProps}
 *
 * @example
 * ```tsx
 * <Badge kind="solid" color="purple">
 *   <InfoCircle />
 *   Badge
 * </Badge>
 * ```
 */
declare const Badge: react.ForwardRefExoticComponent<Omit<BadgeProps, "ref"> & react.RefAttributes<HTMLSpanElement>>;

interface BannerContentProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * Content wrapper component for a banner. This is the container that holds all of the child components
 * within the content of the banner.
 * @param props - props to be passed to the {@link BannerContent} component
 * @see {@link BannerContentProps}
 * @example
 * ```tsx
 * <BannerContent>
 *   <BannerIcon />
 *   <BannerHeader>
 *     <BannerHeader>Global banner title</BannerHeader>
 *     <BannerSubheading>Global banner description</BannerSubheading>
 *   </BannerHeader>
 *   <Button color="neutral" kind="secondary" size="tiny">Button</Button>
 * </BannerContent>
 * ```
 */
declare const BannerContent: react__default.ForwardRefExoticComponent<Omit<BannerContentProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

interface BannerHeaderProps extends PrimitivePropsWithRef<"div"> {
    /**
     * The content of the BannerHeader.
     * This will usually be composed of components such as BannerHeader and BannerSubheading.
     * For Global Banners and Inline banners, it is recommended to use BannerSubheading only and omit BannerHeader.
     */
    children?: react__default.ReactNode;
}
/**
 * Text wrapper component for a banner. This is the container that holds all of the child components
 * within the content of the banner. It will wrap the and style the header and text of the banner.
 * @param props - props to be passed to the {@link BannerHeader} component
 * @see {@link BannerHeaderProps}
 * @example
 * ```tsx
 * // Banners that contain a title and description
 * <BannerHeader>
 *   <BannerHeading>Global banner title</BannerHeading>
 *   <BannerSubheading>Global banner description</BannerSubheading>
 * </BannerHeader>
 * ```
 * @example
 * ```tsx
 * // Banners that contain only a subheading
 * <BannerHeader>
 * 	<BannerSubheading>Global banner description</BannerSubheading>
 * </BannerHeader>
 * ```
 */
declare const BannerHeader: react__default.ForwardRefExoticComponent<Omit<BannerHeaderProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

interface BannerHeadingProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * Main heading component for any banner.
 * @param props - props to be passed to the {@link BannerHeading} component
 * @see {@link BannerHeadingProps}
 */
declare const BannerHeading: react__default.ForwardRefExoticComponent<Omit<BannerHeadingProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

interface BannerIconProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * Icon component for any of the {@link BannerRoot} components.
 * It is recommended to use the NvidiaGUIIcon component from the `@nv-brand-assets` package.
 * {@link https://brand-assets.gitlab-master-pages.nvidia.com/nvidia-gui-icons/}
 *
 * Guidance for icon sizes (will be applied via css based on the kind passed to {@link BannerRoot}):
 * - Header: 24px
 * - Global: 16px
 * - Banner: 16px
 *
 * @param props - props to be passed to the {@link BannerIcon} component
 * @see {@link BannerIconProps}
 */
declare const BannerIcon: react__default.ForwardRefExoticComponent<Omit<BannerIconProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

declare const bannerRoot: (props?: ({
    status?: "error" | "warning" | "success" | "info" | null | undefined;
    kind?: "header" | "inline" | "global" | null | undefined;
    actionsPosition?: "right" | "bottom" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type BannerRootVariantProps = VariantProps<typeof bannerRoot>;
interface BannerRootProps extends PrimitivePropsWithRef<"div"> {
    /**
     * The kind of banner to render.
     * @defaultValue "global"
     */
    kind?: BannerRootVariantProps["kind"];
    /**
     * The status of the banner.
     * @defaultValue "info"
     */
    status?: BannerRootVariantProps["status"];
    /**
     * The position of the actions to render in the banner. If undefined, the actions will be rendered
     * on the right until the banner is too small. Then they will move to the bottom.
     */
    actionsPosition?: "right" | "bottom";
}
declare const BannerRoot: react__default.ForwardRefExoticComponent<Omit<BannerRootProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

interface BannerSubheadingProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * Text component for any banner.
 * @param props - props to be passed to the {@link BannerSubheading} component
 * @see {@link BannerSubheadingProps}
 */
declare const BannerSubheading: react__default.ForwardRefExoticComponent<Omit<BannerSubheadingProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

interface HeaderBannerProps {
    /**
     * The kind of banner to render.
     * - `inline`: A banner that is inline with the content.
     * - `header`: A banner with a bolded heading and optional subheading.
     * - `global`: A banner that spans the full width of the viewport.
     *
     * @defaultValue `inline`
     */
    kind: "header";
    /**
     * "header" kind banners render their `children` as the heading - `slotSubheading` is used to render
     * the (smaller) subheading text.
     *
     * @example
     * ```tsx
     * <Banner
     *   kind="header"
     *   status="error"
     *   slotSubheading="The request failed to process. If this problem persists, please contact support."
     * >
     *   Error Processing Request
     * </Banner>
     * ```
     */
    slotSubheading: react__default.ReactNode;
}
interface OtherBannerProps {
    kind: Exclude<BannerRootProps["kind"], "header">;
    /**
     * The subheading of the banner. This is only rendered for header kind banners.
     */
    slotSubheading?: never;
}
/**
 * Base banner props shared by all banner types
 */
interface BannerBaseProps extends Pick<BannerRootProps, "status" | "actionsPosition">, NativeElementAttributes<"div", typeof BannerRoot> {
    /**
     * The heading text of the banner. Currently optional, but once we remove `slotHeading`, this will be required.
     *
     * @example
     * ```tsx
     * <Banner status="error">
     *   Error Processing Request
     * </Banner>
     * ```
     */
    children?: react__default.ReactNode;
    /**
     * Slot for the icon to render in the banner. By default, the icon rendered is based on the status
     * prop of the banner.
     * To render no icon, pass `null` to this prop.
     */
    slotIcon?: react__default.ReactNode;
    /**
     * @deprecated Replace with `children` - no other changes are required. Will be removed in the next major version and
     * `children` will become a required prop.
     */
    slotHeading?: react__default.ReactNode;
    /**
     * The actions to render in the banner.
     */
    slotActions?: react__default.ReactNode;
    /**
     * The close button handler. If provided, the banner will render a close button.
     */
    onClose?: () => void;
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        BannerContent?: NativeElementAttributes<"div", typeof BannerContent>;
        BannerHeader?: NativeElementAttributes<"div", typeof BannerHeader>;
        BannerHeading?: NativeElementAttributes<"div", typeof BannerHeading>;
        BannerSubheading?: NativeElementAttributes<"div", typeof BannerSubheading>;
        BannerIcon?: NativeElementAttributes<"div", typeof BannerIcon>;
        BannerCloseButton?: NativeElementAttributes<"button", typeof Button>;
    };
}
/**
 * Banner props type that handles different requirements based on banner kind
 */
type BannerProps = BannerBaseProps & (HeaderBannerProps | OtherBannerProps);
/**
 * Banners communicate important messages and actions that draw the user's attention.
 * @param props - props to be passed to the {@link Banner} component
 * @see {@link BannerProps}
 * @example
 * ```tsx
 * // Global banner
 * <Banner
 *  kind="global"
 *  status="info"
 *  slotIcon={<CommonLockClosed />}
 *  slotHeading="Banner Title"
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Header banner with actions and close button
 * <Banner
 *  kind="header"
 *  status="info"
 *  slotIcon={<CommonLockClosed />}
 *  slotHeading="Banner Heading"
 *  slotSubheading="Banner Subheading"
 *  actionsPosition="bottom"
 *  slotActions={
 *    <>
 *    	<Button color="neutral" kind="secondary" size="tiny">Action 1</Button>,
 *    	<Button color="neutral" kind="secondary" size="tiny">Action 2</Button>
 *    </>
 *  }
 * />
 * ```
 */
declare const Banner: react__default.ForwardRefExoticComponent<(Omit<BannerBaseProps & HeaderBannerProps, "ref"> | Omit<BannerBaseProps & OtherBannerProps, "ref">) & react__default.RefAttributes<HTMLDivElement>>;

interface BannerActionsSectionProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * Contains the actions for the banner. This wrapper will ensure the actions are laid out in the
 * correct position based on the banner actions position property.
 * @param props - props to be passed to the {@link BannerActionsSection} component
 * @example
 * ```tsx
 * <BannerActionsSection>
 *   <Button color="neutral" kind="secondary" size="tiny">Button</Button>
 *   <Button color="neutral" kind="secondary" size="tiny">Button</Button>
 * </BannerActionsSection>
 * ```
 */
declare const BannerActionsSection: react__default.ForwardRefExoticComponent<Omit<BannerActionsSectionProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

interface BannerCloseButtonSectionProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * Contains the close button for the banner. This wrapper will ensure the close button is laid out in the
 * correct position based on the banner actions position property.
 * @param props - props to be passed to the {@link BannerCloseButtonSection} component
 * @example
 * ```tsx
 * <BannerCloseButtonSection>
 *   <Button color="neutral" kind="secondary" size="tiny"><Close /></Button>
 * </BannerCloseButtonSection>
 * ```
 */
declare const BannerCloseButtonSection: react__default.ForwardRefExoticComponent<Omit<BannerCloseButtonSectionProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

interface BannerLayoutProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * Manages the layout of the banner.
 * @param props - props to be passed to the {@link BannerLayout} component
 * @example
 * ```tsx
 * <BannerLayout>
 *   <BannerContent>
 *     <BannerIcon />
 *     <BannerHeader>
 *       <BannerHeading>Banner Heading</BannerHeading>
 *       <BannerSubheading>Banner Subheading</BannerSubheading>
 *     </BannerHeader>
 *     <BannerActionsSection>
 *       <Button color="neutral" kind="secondary" size="tiny">Button</Button>
 *     </BannerActionsSection>
 *     <BannerCloseButtonSection>
 *       <Button color="neutral" kind="secondary" size="tiny"><Close /></Button>
 *     </BannerCloseButtonSection>
 *   </BannerContent>
 * </BannerLayout>
 * ```
 */
declare const BannerLayout: react__default.ForwardRefExoticComponent<Omit<BannerLayoutProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

declare const BannerTestIds: {
    readonly BannerRoot: "nv-banner-root";
    readonly BannerLayout: "nv-banner-layout";
    readonly BannerActionsSection: "nv-banner-actions-section";
    readonly BannerCloseButtonSection: "nv-banner-close-button-section";
    readonly BannerContent: "nv-banner-content";
    readonly BannerIcon: "nv-banner-icon";
    readonly BannerHeader: "nv-banner-header";
    readonly BannerHeading: "nv-banner-heading";
    readonly BannerSubheading: "nv-banner-subheading";
    readonly BannerCloseButton: "nv-banner-close-button";
};

declare const block: (props?: ({
    overflow?: "hidden" | "clip" | "auto" | "scroll" | "visible" | null | undefined;
    overflowX?: "hidden" | "clip" | "auto" | "scroll" | "visible" | null | undefined;
    overflowY?: "hidden" | "clip" | "auto" | "scroll" | "visible" | null | undefined;
    textOverflow?: "clip" | "ellipsis" | null | undefined;
    textWrap?: "wrap" | "nowrap" | "balance" | "pretty" | null | undefined;
    truncate?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type BlockVariantProps = VariantProps<typeof block>;
type BlockProps = react__default.ComponentPropsWithRef<"div"> & PrimitiveComponentProps & {
    /**
     * Sets content overfow handling.
     * See https://developer.mozilla.org/en-US/docs/Web/CSS/overflow for more.
     */
    overflow?: BlockVariantProps["overflow"];
    /**
     * Sets content overfow handling for a block level element's left and right edges.
     * See https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-x for more.
     */
    overflowX?: BlockVariantProps["overflowX"];
    /**
     * Sets content overfow handling for a block level element's top and bottom edges.
     * See https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-y for more.
     */
    overflowY?: BlockVariantProps["overflowY"];
    /**
     * Sets text overflow handling.
     * See https://developer.mozilla.org/en-US/docs/Web/CSS/text-overflow for more.
     */
    textOverflow?: BlockVariantProps["textOverflow"];
    /**
     * Sets text wrap.
     * See https://developer.mozilla.org/en-US/docs/Web/CSS/text-wrap for more.
     */
    textWrap?: BlockVariantProps["textWrap"];
    /**
     * Enables text truncation handling.
     * Same as setting `{ wrap: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }`
     */
    truncate?: BlockVariantProps["truncate"];
};
/**
 * A primitive div component.
 * @param props - props to be passed to the {@link Block} component
 * @see {@link BlockProps}
 * @example
 * ```tsx
 * <Block>Wood is superior to cardboard when considering box materials</Block>
 * ```
 */
declare const Block: react__default.ForwardRefExoticComponent<Omit<BlockProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

declare const BlockTestIds: {
    readonly Block: "nv-block";
};

interface BreadcrumbsItemProps extends PrimitivePropsWithRef<"div"> {
    /**
     * Determines whether the item is active (e.g., current page).
     */
    active?: boolean;
}
/**
 * Represents a single breadcrumb link or item.
 * @param props - props to be passed to the {@link BreadcrumbsItem} component
 * @see {@link BreadcrumbsItem}
 * @example
 * ```tsx
 * <BreadcrumbsItem active={true}>Home</BreadcrumbsItem>
 * ```
 */
declare const BreadcrumbsItem: react__default.ForwardRefExoticComponent<Omit<BreadcrumbsItemProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

interface BreadcrumbsRootProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * Container component for Breadcrumbs.
 * Handles the base layout of the breadcrumb items and separators.
 * @param props - props to be passed to the {@link BreadcrumbsRoot} component
 * @see {@link BreadcrumbsRootProps}
 * @example
 * ```tsx
 * <BreadcrumbsRoot separator="custom">
 *   <BreadcrumbsItem>Home</BreadcrumbsItem>
 *   <BreadcrumbsSeparator />
 *   <BreadcrumbsItem>About</BreadcrumbsItem>
 * </BreadcrumbsRoot>
 * ```
 */
declare const BreadcrumbsRoot: react__default.ForwardRefExoticComponent<Omit<BreadcrumbsRootProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

interface BreadcrumbsSeparatorProps extends Omit<PrimitivePropsWithRef<"div">, "children"> {
    /**
     * Custom icon to be used as a separator.
     * @defaultValue `<ChevronRight />`
     */
    children?: react__default.ReactNode;
}
/**
 * Separator between breadcrumb items.
 * Defaults to a Chevron icon if no custom icon is provided.
 * @param props - props to be passed to the {@link BreadcrumbsSeparator} component
 * @see {@link BreadcrumbsSeparatorProps}
 * @example
 * ```tsx
 * <BreadcrumbsSeparator />
 * <BreadcrumbsSeparator>
 *   <CustomIcon />
 * </BreadcrumbsSeparator>
 * ```
 */
declare const BreadcrumbsSeparator: react__default.ForwardRefExoticComponent<Omit<BreadcrumbsSeparatorProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

type BreadcrumbsItemFieldProps = {
    /**
     * Content to be rendered within the breadcrumb anchor tag. Useful for rendering links with icons.
     */
    slotLabel: react__default.ReactNode;
    /**
     * URL to navigate to when the breadcrumb item is clicked.
     */
    href: string;
    /**
     * Custom trigger to be rendered within the breadcrumb item. Not valid if `href` is provided.
     */
    slotTrigger?: never;
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        BreadcrumbsItem?: NativeElementAttributes<"div", typeof BreadcrumbsItem>;
        BreadcrumbsSeparator?: NativeElementAttributes<"div", typeof BreadcrumbsSeparator>;
    };
} | {
    /**
     * Custom trigger to be rendered within the breadcrumb item. Not valid if `href` is provided.
     */
    slotLabel?: never;
    /**
     * URL to navigate to when the breadcrumb item is clicked.
     */
    href?: never;
    /**
     * Content to be rendered within the breadcrumb item. Useful for rendering custom elements.
     */
    slotTrigger: NonNullable<react__default.ReactNode>;
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        BreadcrumbsItem?: NativeElementAttributes<"div", typeof BreadcrumbsItem>;
        BreadcrumbsSeparator?: NativeElementAttributes<"div", typeof BreadcrumbsSeparator>;
    };
};
interface BreadcrumbsProps extends NativeElementAttributes<"div", typeof BreadcrumbsRoot> {
    /**
     * Array of items to be rendered as breadcrumbs.
     */
    items: BreadcrumbsItemFieldProps[];
    /**
     * Replaces the default separator icon with custom rendered content.
     */
    slotSeparator?: ReactNode;
}
/**
 * Breadcrumbs component that renders a list of breadcrumb items with separators.
 * Can render items as links or custom elements.
 * @param props - props to be passed to the {@link Breadcrumbs} component
 * @see {@link BreadcrumbsProps}
 * @example
 * ```tsx
 * <Breadcrumbs
 *   items={[
 *     { slotLabel: "Home", value: "/" },
 *     { slotLabel: "Category", value: "/category" },
 *     { slotLabel: "Current Page", value: "#" }, // Last item is plain text
 *   ]}
 * />
 * ```
 */
declare const Breadcrumbs: react__default.ForwardRefExoticComponent<Omit<BreadcrumbsProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

declare const group: (props?: ({
    kind?: "border" | "gap" | "flush" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type GroupVariantProps = VariantProps<typeof group>;
interface GroupProps extends Omit<PrimitivePropsWithRef<"div">, "color"> {
    /**
     * @remarks
     * The kind of divider to render for the group. By default groups are rendered as "flush" groups with no divider.
     *
     * Use `gap` to render a group with a gap between items.
     *
     * Use `border` to render a group with a border between items. Use this when the group items don't have a border or clear ending.
     *
     * @defaultValue "flush"
     */
    kind?: GroupVariantProps["kind"];
}
/**
 * Group is a utility component that groups items together.
 * @param props - props to be passed to the {@link Group} component
 * @see {@link GroupProps}
 *
 * @example
 * ```tsx
 * <Group>
 *   <Item>Item 1</Item>
 *   <Item>Item 2</Item>
 *   <Item>Item 3</Item>
 * </Group>
 * ```
 */
declare const Group: react.ForwardRefExoticComponent<Omit<GroupProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare const GroupTestIds: {
    readonly Group: "nv-group";
};

type ButtonGroupItem = ButtonProps & ({
    /**
     * The text to render in the button. If passing something other than a string, make sure to pass a `value` prop.
     */
    children: string;
    /**
     * If `children` cannot be used as a key, use this prop to provide a unique identifier for the button.
     * We use this as the key for the button when iterating over `items`.
     */
    key?: string;
} | {
    children: Exclude<React.ReactNode, "string" | "number">;
    key: string;
});
interface ButtonGroupProps extends Omit<GroupProps, "kind" | "color"> {
    /**
     * Whether or not the button group is disabled.
     */
    disabled?: boolean;
    /**
     * The kind of group to render
     */
    groupKind?: GroupProps["kind"];
    /**
     * The items to render in the button group. Either use this or the `children` prop.
     */
    items?: ButtonGroupItem[];
    /**
     * The size of the individual buttons in the group
     */
    size?: ButtonProps["size"];
    /**
     * The kind of buttons in the group
     * @defaultValue "primary"
     */
    kind?: ButtonProps["kind"];
    /**
     * The color of the buttons in the group
     */
    color?: ButtonProps["color"];
}
/**
 * ButtonGroup is a layout component that groups buttons together.
 * @param props - props to be passed to the {@link ButtonGroup} component
 * @see {@link ButtonGroupProps}
 *
 * @example
 * ```tsx
 * <ButtonGroup>
 *   <Button>Button 1</Button>
 *   <Button>Button 2</Button>
 *   <Button>Button 3</Button>
 * </ButtonGroup>
 * ```
 */
declare const ButtonGroup: react.ForwardRefExoticComponent<Omit<ButtonGroupProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare const ButtonGroupTestIds: {
    readonly ButtonGroup: "nv-button-group";
};

interface CardContentProps extends ComponentPropsWithRef<"div"> {
}
/**
 * Content of a {@link Card}. Use to contain main body text, tags, etc
 * @param props - props to be passed to the {@link CardContent} component
 * @see {@link CardContentProps}
 */
declare const CardContent: react__default.ForwardRefExoticComponent<Omit<CardContentProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

interface CardMediaProps extends SlottablePropsWithRef<"div"> {
    /**
     * The header content that will overlay on top of the CardMedia.
     */
    slotHeader?: react__default.ReactNode;
}
/**
 * Media element of a card. Typically used to include an image at the top of the card.
 * @param props - props to be passed to the {@link CardMedia} component
 * @see {@link CardMediaProps}
 */
declare const CardMedia: react__default.ForwardRefExoticComponent<Omit<CardMediaProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

/**
 * Density variants for our density aware components.
 *
 * For any components that are density aware, you can use this constant to set the density of the
 * component. We should not assign a defaultVariant/defaultValue for density - `undefined` will allow
 * the component to inherit the density from the parent.
 *
 * @example
 * ```ts
 * const menuStyles = cva("nv-menu", {
 * 	variants: {
 * 		density: densityVariant,
 * 	},
 * });
 * ```
 */
declare const densityVariant: {
    compact: "nv-density-compact";
    standard: "nv-density-standard";
    spacious: "nv-density-spacious";
};
interface DensityVariantProps {
    /**
     * The "density" of the component. This affects the padding/spacing of the component and its children.
     *
     * - Setting to `null` or `undefined` will allow the component to inherit density from its parent.
     * - Setting to `compact` will reduce the padding/spacing of the component and its children.
     * - Setting to `standard` will use the standard padding/spacing of the component and its children.
     * - Setting to `spacious` will increase the padding/spacing of the component and its children.
     *
     * @see {@link https://virtual-front-end-initiative.gitlab-master-pages.nvidia.com/kaizen-ui-foundations/kaizen-ui/guides/theming#density-themes | Density Documentation}
     *
     * @defaultValue `undefined` - by default, the component will inherit density from its parent, which
     * is usually `standard`.
     */
    density?: keyof typeof densityVariant | null;
}

declare const cardRoot: (props?: ({
    density?: "compact" | "standard" | "spacious" | null | undefined;
    interactive?: boolean | null | undefined;
    kind?: "solid" | "gradient" | "float" | null | undefined;
    layout?: "horizontal" | "vertical" | null | undefined;
    selected?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface CardRootProps extends PrimitivePropsWithRef<"div">, DensityVariantProps {
    /**
     * @remarks
     * If true, the card will be interactive and will show a hover effect.
     * @defaultValue false
     */
    interactive?: boolean;
    /**
     * @remarks
     * How we want the card to look. `solid` will show the media and content in a solid background.
     * `gradient` will show the media with a blur and content in a solid background. `float` will
     * border the media but render the content without a background.
     * @defaultValue "solid"
     */
    kind?: VariantProps<typeof cardRoot>["kind"];
    /**
     * @remarks
     * Sets the orientation of the card. `horizontal` will place the media to the left of the content.
     * @defaultValue "vertical"
     */
    layout?: VariantProps<typeof cardRoot>["layout"];
    /**
     * @remarks
     * If true, the card will be "selected" and will show a selected state.
     * @defaultValue false
     */
    selected?: boolean;
}
/**
 * Container of a {@link Card}.
 * @param props - props to be passed to the {@link CardRoot} component
 * @see {@link CardRootProps}
 */
declare const CardRoot: react__default.ForwardRefExoticComponent<Omit<CardRootProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

interface CardProps extends PropsWithChildren<Pick<CardRootProps, "asChild" | "interactive" | "kind" | "layout" | "selected" | "density"> & NativeElementAttributes<"div", typeof CardRoot>> {
    /**
     * @remarks
     * The header content of the Card. If `slotMedia` is provided, this will be rendered on top of the media.
     */
    slotHeader?: React.ReactNode;
    /**
     * @remarks
     * The media content of the Card.
     */
    slotMedia?: React.ReactNode;
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        CardContent?: NativeElementAttributes<"div", typeof CardContent>;
        CardMedia?: NativeElementAttributes<"div", typeof CardMedia>;
    };
}
/**
 * A card contain content and actions about a single subject.
 * @param props - props to be passed to the {@link Card} component
 * @see {@link CardProps}
 *
 * @example
 * ```tsx
 * <Card
 *   interactive
 *   slotHeader={<p>Header</p>}
 *   slotMedia={<img src="https://picsum.photos/id/43/900/600" alt="new york" />}
 * >
 *   <p>Your Card Content</p>
 * </Card>
 * ```
 */
declare const Card: react.ForwardRefExoticComponent<Omit<CardProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare const CardTestIds: {
    readonly CardRoot: "nv-card-root";
    readonly CardContent: "nv-card-content";
    readonly CardMedia: "nv-card-media";
};

type CheckedState = RadixCheckbox.CheckedState;
interface CheckboxBoxProps extends Omit<PrimitivePropsWithRef<"button">, "defaultChecked"> {
    /**
     * The checked state of the checkbox when it is initially rendered. Use when you do not need to control its checked state.
     */
    defaultChecked?: boolean;
    /**
     * The controlled checked state of the checkbox. Must be used in conjunction with `onCheckedChange`.
     */
    checked?: CheckedState;
    /**
     * Event handler called when the checked state of the checkbox changes.
     */
    onCheckedChange?: (checked: CheckedState) => void;
    /**
     * If true. Shoes the checkbox in its error state.
     */
    error?: boolean;
    /**
     * If true. Puts the checkbox into a disabled state.
     */
    disabled?: boolean;
    /**
     * The name of the slider. Submitted with its owning form as part of a name/value pair.
     */
    name?: string;
}
/**
 * The box portion of the Checkbox component
 * @param props - props to be passed to the {@link CheckboxBox} component
 * @see {@link CheckboxBoxProps}
 */
declare const CheckboxBox: react__default.ForwardRefExoticComponent<Omit<CheckboxBoxProps, "ref"> & react__default.RefAttributes<HTMLButtonElement>>;

declare const checkboxIndicator: (props?: ({
    error?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface CheckboxIndicatorProps extends Omit<ComponentPropsWithRef<"svg">, "children"> {
    /**
     * The current state of the check
     */
    checked?: CheckedState;
    /**
     * If true. Shoes the Icon in its error state.
     */
    error?: boolean;
}
/**
 * A Checkbox indicator. Either a check or dash based on the state
 * @param props - props to be passed to the {@link CheckboxIndicator} component
 * @see {@link CheckboxIndicatorProps}
 */
declare const CheckboxIndicator: react__default.ForwardRefExoticComponent<Omit<CheckboxIndicatorProps, "ref"> & react__default.RefAttributes<SVGSVGElement>>;

declare const checkboxRoot: (props?: ({
    labelSide?: "left" | "right" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface CheckboxRootProps extends PrimitivePropsWithRef<"div"> {
    /**
     * The side of the label to render the checkbox on.
     * @default "right"
     */
    labelSide?: VariantProps<typeof checkboxRoot>["labelSide"];
}
/**
 * Checkbox root
 * @param props - props to be passed to the {@link CheckboxRoot} component
 * @see {@link CheckboxRootProps}
 */
declare const CheckboxRoot: react__default.ForwardRefExoticComponent<Omit<CheckboxRootProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

declare const LabelTestId: {
    Label: string;
};

declare const label: (props?: ({
    disabled?: boolean | null | undefined;
    size?: "small" | "medium" | "large" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface LabelProps extends PrimitivePropsWithRef<"label"> {
    /**
     * The id of the element the label is associated with.
     */
    htmlFor?: string;
    /**
     * Sets the label into a disabled state. Adjusting styles and removing click events.
     */
    disabled?: boolean;
    /**
     * The size of the label.
     * @defaultValue "medium"
     */
    size?: VariantProps<typeof label>["size"];
}
/**
 * A label component for forms and inputs.
 * @param props - props to be passed to the {@link Label} component
 * @see {@link LabelProps}
 */
declare const Label: react__default.ForwardRefExoticComponent<Omit<LabelProps, "ref"> & react__default.RefAttributes<HTMLLabelElement>>;

interface CheckboxProps extends Pick<CheckboxRootProps, "labelSide">, Pick<CheckboxBoxProps, "checked" | "defaultChecked" | "disabled" | "error" | "onCheckedChange">, Omit<MergedHoistedElementAttributes<[
    [
        "div",
        typeof CheckboxRoot
    ],
    [
        "button",
        typeof CheckboxBox
    ],
    [
        "div",
        typeof CheckboxIndicator
    ],
    [
        "label",
        typeof Label
    ]
]>, "defaultChecked"> {
    /**
     * A semantic label for the checkbox. Goes on either the right or left side of the checkbox
     * can be changed using the `labelSide` property.
     */
    slotLabel?: react__default.ReactNode;
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        CheckboxBox?: NativeElementAttributes<"button", typeof CheckboxBox>;
        CheckboxIndicator?: NativeElementAttributes<"div", typeof CheckboxIndicator>;
        Label?: NativeElementAttributes<"label", typeof Label>;
    };
}
/**
 * Checkboxes allow users to select one or more items
 * @param props - props to be passed to the {@link Checkbox} component
 * @see {@link CheckboxProps}
 * @example
 * ```tsx
 * const [checked, setChecked] = useState<CheckedState>(false);
 *
 * return (
 *   <Checkbox
 *     {...props}
 *     checked={checked}
 *     onCheckedChange={setChecked}
 *   />
 * );
 * ```
 */
declare const Checkbox: react__default.ForwardRefExoticComponent<CheckboxProps & react__default.RefAttributes<HTMLButtonElement>>;

declare const CheckboxTestIds: {
    Root: string;
    Box: string;
    Indicator: string;
};

declare const dividerElement: (props?: ({
    orientation?: "horizontal" | "vertical" | null | undefined;
    width?: "small" | "medium" | "large" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type DividerElementVariantProps = VariantProps<typeof dividerElement>;
interface DividerElementProps extends PrimitivePropsWithRef<"div"> {
    /** The orientation of the divider element
     * @defaultValue "horizontal"
     */
    orientation?: DividerElementVariantProps["orientation"];
    /** The width/thickness of the divider element
     * @defaultValue "small"
     */
    width?: DividerElementVariantProps["width"];
}
/**
 * The DividerElement component represents a line that visually separates content
 * within a list or other container. It can be customized in terms of orientation
 * (horizontal or vertical) and width (small, medium, or large).
 *
 * @param props - Props to be passed to the {@link DividerElement} component,
 * @see {@link DividerElementProps}
 *
 * @example
 * ```tsx
 * <DividerElement orientation="horizontal" width="medium" />
 * ```
 */
declare const DividerElement: react.ForwardRefExoticComponent<Omit<DividerElementProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare const dividerRoot: (props?: ({
    orientation?: "horizontal" | "vertical" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type DividerRootVariantProps = VariantProps<typeof dividerRoot>;
interface DividerRootProps extends PrimitivePropsWithRef<"div">, Pick<PrimitiveComponentProps, "padding" | "paddingX" | "paddingY" | "paddingTop" | "paddingRight" | "paddingBottom" | "paddingLeft" | "spacingX" | "spacingY" | "spacingTop" | "spacingRight" | "spacingBottom" | "spacingLeft"> {
    orientation?: DividerRootVariantProps["orientation"];
}
/**
 * The DividerRoot component serves as a container for the Divider element,
 * providing spacing and layout properties to ensure proper separation
 * between content. It can be customized with various spacing props
 * to control the amount of space around the divider.
 *
 * @param props - Props to be passed to the {@link DividerRoot} component,
 * @see {@link DividerRootProps}
 *
 * @example
 * ```tsx
 * <DividerRoot paddingX="2" paddingY="2" />
 * ```
 */
declare const DividerRoot: react.ForwardRefExoticComponent<Omit<DividerRootProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface DividerProps extends React.ComponentPropsWithRef<"div">, Pick<PrimitiveComponentProps, "padding" | "paddingX" | "paddingY" | "paddingTop" | "paddingRight" | "paddingBottom" | "paddingLeft" | "spacingX" | "spacingY" | "spacingTop" | "spacingRight" | "spacingBottom" | "spacingLeft"> {
    /** Whether to render the divider as a child element
     * @defaultValue false
     */
    asChild?: boolean;
    /** The orientation of the divider
     * @defaultValue "horizontal"
     */
    orientation?: "horizontal" | "vertical";
    /** The width/thickness of the divider
     * @defaultValue "small"
     */
    width?: "small" | "medium" | "large";
    /** Additional attributes to be passed to the divider element */
    attributes?: {
        DividerRoot?: NativeElementAttributes<"div", typeof DividerRoot>;
        DividerElement?: NativeElementAttributes<"div", typeof DividerElement>;
    };
}
/**
 * A divider is a horizontal or vertical line that separates content.
 * @param props - props to be passed to the {@link Divider} component
 * @see {@link DividerProps}
 *
 * @example
 * ```tsx
 * <Divider orientation="horizontal" width="medium" />
 * ```
 */
declare const Divider: react.ForwardRefExoticComponent<Omit<DividerProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare const DividerTestIds: {
    readonly DividerRoot: "nv-divider-root";
    readonly DividerElement: "nv-divider-element";
};

interface RadioGroupItemProps extends Omit<SlottablePropsWithRef<"button">, "value"> {
    /**
     * If true, the radio group item will show a danger state. Note that this looks identical to the
     * error state and should not be used in conjunction with the `error` prop on the radio group.
     */
    danger?: boolean;
    /**
     * If true, the radio group item will be disabled
     */
    disabled?: boolean;
    /**
     * The side the label is rendered on relative to the radio button
     * @defaultValue "right"
     */
    labelSide?: "left" | "right";
    /**
     * When true, indicates that the user must check the radio item before the owning form can be submitted.
     */
    required?: boolean;
    /**
     * When true, indicates that the radio item will show an indicator.
     * @defaultValue true
     */
    showIndicator?: boolean;
    /**
     * The value of the radio group item
     */
    value: string;
}
/**
 * A radio item in the group that can be checked. An input will also render when used within a form
 * to ensure events propagate correctly.
 *
 * @see {@link RadioGroupItemProps}
 *
 * {@link https://virtual-front-end-initiative.gitlab-master-pages.nvidia.com/kaizen-ui-foundations/kaizen-ui/components/radio-group RadioGroup Documentation}
 *
 * @example
 * <RadioGroupItem value="1" />
 *
 * @example
 * <RadioGroupItem value="1" labelSide="left">
 *   <Label>Option 1</Label>
 * </RadioGroupItem>
 */
declare const RadioGroupItem: react.ForwardRefExoticComponent<Omit<RadioGroupItemProps, "ref"> & react.RefAttributes<HTMLButtonElement>>;

interface RadioGroupRootProps extends PrimitivePropsWithRef<"div"> {
    /**
     *	The accessible name for the radio group.
     */
    name: string;
    /**
     * The value of the radio group when it is initially rendered. Use when you do not need to control the value of the radio group.
     */
    defaultValue?: string;
    /**
     * The controlled value of the radio group. Must be used in conjunction with `onValueChange`.
     */
    value?: string;
    /**
     * Event handler called when the value of the radio group changes.
     */
    onValueChange?: (value: string) => void;
    /**
     * If true, the radio group will be disabled.
     */
    disabled?: boolean;
    /**
     * When true, indicates that the user must check a radio item before the owning form can be submitted.
     */
    required?: boolean;
    /**
     * If true, the radio group will show an error state
     */
    error?: boolean;
    /**
     * The orientation of the radio group. Determines the layout of the radio items and keyboard navigation behavior.
     * @defaultValue "vertical"
     */
    orientation?: "horizontal" | "vertical";
}
/**
 * The parent component for a radio group. This manages the current value of the radio group.
 *
 * @see {@link RadioGroupRootProps}
 *
 * {@link https://virtual-front-end-initiative.gitlab-master-pages.nvidia.com/kaizen-ui-foundations/kaizen-ui/components/radio-group RadioGroup Documentation}
 *
 * @example
 * <RadioGroupRoot name="color" defaultValue="red">
 *   <RadioGroupItem value="red" />
 *   <RadioGroupItem value="blue" />
 *   <RadioGroupItem value="green" />
 * </RadioGroupRoot>
 *
 * @example
 * <RadioGroupRoot name="color" orientation="horizontal">
 *   <RadioGroupItem value="red" />
 *   <RadioGroupItem value="blue" />
 *   <RadioGroupItem value="green" />
 * </RadioGroupRoot>
 */
declare const RadioGroupRoot: react.ForwardRefExoticComponent<Omit<RadioGroupRootProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface RadioGroupProps extends Pick<RadioGroupRootProps, "name" | "defaultValue" | "value" | "onValueChange" | "disabled" | "required" | "error" | "orientation">, Omit<NativeElementAttributes<"div", typeof RadioGroupRoot>, "defaultValue"> {
    /**
     * Which side of the checkbox the label renders on.
     * @defaultValue "right"
     */
    labelSide?: "left" | "right";
    /**
     * The items to render in the radio group.
     */
    items: (Pick<RadioGroupItemProps, "danger" | "disabled" | "required" | "value"> & {
        /**
         * The label of the radio group item
         */
        children: React.ReactNode;
        /**
         * The native HTML attributes to apply to the internal composed components.
         */
        attributes?: {
            RadioGroupItem?: NativeElementAttributes<"button", typeof RadioGroupItem>;
            Label?: NativeElementAttributes<"label", typeof Label>;
        };
    })[];
}
/**
 * A set of checkable buttons — known as radio buttons — where no more than one of the buttons can
 * be checked at a time.
 *
 * @see {@link RadioGroupProps}
 *
 * {@link https://virtual-front-end-initiative.gitlab-master-pages.nvidia.com/kaizen-ui-foundations/kaizen-ui/components/radio-group RadioGroup Documentation}
 *
 * @example
 * <RadioGroup
 *   defaultValue="blue"
 *   name="color"
 *   items={[
 *     { children: "Red", value: "red" },
 *     { children: "Blue", value: "blue" },
 *     { children: "Green", value: "green" },
 *   ]}
 * />
 */
declare const RadioGroup: react.ForwardRefExoticComponent<Omit<RadioGroupProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare const RadioGroupTestIds: {
    readonly RadioGroupRoot: "nv-radio-group-root";
    readonly RadioGroupItem: "nv-radio-group-item";
    readonly RadioGroupInput: "nv-radio-group-input";
    readonly RadioGroupIndicator: "nv-radio-group-indicator";
};

interface MenuItemProps extends Omit<PrimitivePropsWithRef<"li">, "onSelect" | "defaultChecked"> {
    /**
     * Whether or not a specific menu item's associated action is destructive.
     * When true, renders the item with a red background to indicate that the action is dangerous.
     */
    danger?: boolean;
    /**
     * Whether or not a specific menu item is disabled.
     * When true, renders the item in a disabled state and prevents the item from being interacted with.
     */
    disabled?: boolean;
    /**
     * The value to use for filtering an item in a menu. This should correspond to the string equivalent
     * of whatever is being rendered in the menu item. If this isn't provided we will calculate it from
     * `children` and fallback to `value` if necessary.
     *
     * To make a menu item "unfilterable" i.e. always rendered, set `filterValue={null}`
     */
    filterValue?: string | null;
    /**
     * Event handler called when the item is selected.
     */
    onSelect?: (event: Event) => void;
    /**
     * Icon/component placed to the left of the MenuItem label; usually used to imply functionality or
     * add related visual indicators.
     *
     * Used in MenuCheckboxItem and MenuRadioItem to place corresponding elements; or to place a checkmark
     * for single select items and to automatically indent non-selected items in the same menu.
     */
    slotLeft?: ReactNode;
    /**
     * Icon/component placed to the right of the MenuItem label; usually used to indicate the existence of a
     * submenu when used with a ChevronRight icon, for example.
     *
     * Used in DropdownSubTrigger to show that a submenu can be opened on hover.
     */
    slotRight?: ReactNode;
    /**
     * A unique value associated with the menu item. This is used to identify the menu item when it is
     * selected. Required for `Combobox` and `Select` components.
     */
    value?: string;
}
/**
 * A simple menu item entry.
 *
 * @see {@link MenuItemProps}
 *
 * @example
 * <MenuItem>My Menu Item</MenuItem>
 */
declare const MenuItem: react.ForwardRefExoticComponent<Omit<MenuItemProps, "ref"> & react.RefAttributes<HTMLLIElement>>;

interface MenuCheckboxItemProps extends Pick<MenuItemProps, "children" | "danger" | "onSelect" | "disabled" | "filterValue">, Omit<React.ComponentPropsWithoutRef<"li">, "onSelect" | "defaultChecked" | "value"> {
    /**
     * The controlled checked state of the item. Must be used in conjunction with `onCheckedChange`.
     */
    checked?: CheckboxBoxProps["checked"];
    /**
     * Event handler called when the checked state changes.
     */
    onCheckedChange?: CheckboxBoxProps["onCheckedChange"];
    /**
     * The checked state of the checkbox when it is initially rendered. Use when you do not need to control its checked state.
     */
    defaultChecked?: CheckedState;
}
/**
 * A menu item with a checkbox.
 * @param props - props to be passed to the {@link MenuCheckboxItem} component
 * @see {@link MenuCheckboxItemProps}
 *
 * @example
 * ```tsx
 * <MenuCheckboxItem>Active Item</MenuCheckboxItem>
 * ```
 */
declare const MenuCheckboxItem: react.ForwardRefExoticComponent<MenuCheckboxItemProps & react.RefAttributes<HTMLLIElement>>;

interface MenuHeadingProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * Heading for a menu section.
 * @param props - props to be passed to the {@link MenuHeading} component
 * @see {@link MenuHeadingProps}
 *
 * @example
 * ```tsx
 * <MenuHeading>Menu Group Title</MenuHeading>
 * ```
 */
declare const MenuHeading: react.ForwardRefExoticComponent<Omit<MenuHeadingProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface MenuRadioGroupProps extends PrimitivePropsWithRef<"div"> {
    /**
     *	The accessible name for the radio group.
     */
    name: string;
    /**
     * The value of the radio group when it is initially rendered. Use when you do not need to control the value of the radio group.
     * @defaultValue ""
     */
    defaultValue?: string;
    /**
     * The controlled value of the radio group. Must be used in conjunction with `onValueChange`.
     */
    value?: string;
    /**
     * Event handler called when the value of the radio group changes.
     */
    onValueChange?: (value: string) => void;
    /**
     * If true, the radio group will be disabled.
     */
    disabled?: boolean;
    /**
     * When true, indicates that the user must check a radio item before the owning form can be submitted.
     */
    required?: boolean;
    /**
     * If true, the radio group will show an error state
     */
    error?: boolean;
}
/**
 * A group of radio buttons that can be checked inside a menu.
 * @param props - props to be passed to the {@link MenuRadioGroup} component
 * @see {@link MenuRadioGroupProps}
 *
 * @example
 * ```tsx
 * <MenuRadioGroup>
 * 	<MenuHeading>Heading</MenuHeading>
 * 	<MenuItem>Item 1</MenuItem>
 * 	<MenuItem>Item 2</MenuItem>
 * 	<MenuItem>Item 3</MenuItem>
 * </MenuRadioGroup>
 * ```
 */
declare const MenuRadioGroup: react.ForwardRefExoticComponent<Omit<MenuRadioGroupProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface MenuRadioGroupItemProps extends Pick<MenuItemProps, "danger" | "onSelect" | "filterValue">, Omit<React.ComponentPropsWithoutRef<"li">, "onSelect"> {
    /**
     * The value of the radio group item.
     *
     * @remarks
     * Avoid using an empty string value as this will conflict with the default value of the radio group.
     */
    value: string;
    /**
     * If true, the radio group item will be disabled
     */
    disabled?: boolean;
    /**
     * When true, indicates that the user must check the radio item before the owning form can be submitted.
     */
    required?: boolean;
}
/**
 * A menu item with a radio button that can be checked.
 *
 * @see {@link MenuRadioGroupItemProps}
 *
 * {@link https://virtual-front-end-initiative.gitlab-master-pages.nvidia.com/kaizen-ui-foundations/kaizen-ui/components/menu|Menu Documentation}
 *
 * @example
 * <MenuRadioGroup name="group" defaultValue="1">
 *   <MenuHeading>Heading</MenuHeading>
 *   <MenuRadioGroupItem value="1">Item 1</MenuRadioGroupItem>
 *   <MenuRadioGroupItem value="2">Item 2</MenuRadioGroupItem>
 *   <MenuRadioGroupItem value="3">Item 3</MenuRadioGroupItem>
 * </MenuRadioGroup>
 */
declare const MenuRadioGroupItem: react.ForwardRefExoticComponent<MenuRadioGroupItemProps & react.RefAttributes<HTMLLIElement>>;

interface MenuRootProps extends PrimitivePropsWithRef<"menu">, DensityVariantProps {
    /**
     * Callback function that is called when the menu is scrolled to the bottom. Useful for loading
     * more items.
     */
    onScrollToBottom?: () => void;
}
/**
 * Component that contains all elements of the menu.
 * @param props - props to be passed to the {@link MenuRoot} component
 * @see {@link MenuRootProps}
 *
 * @example
 * <MenuRoot>
 *  ...
 * </MenuRoot>
 */
declare const MenuRoot: react__default.ForwardRefExoticComponent<Omit<MenuRootProps, "ref"> & react__default.RefAttributes<HTMLMenuElement>>;

interface TextInputElementProps extends Omit<PrimitivePropsWithRef<"input">, "type" | "disabled" | "defaultValue" | "readOnly" | "value"> {
    /**
     * The type of the input. This is a subset of the HTML input types.
     * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#input_types
     * @defaultValue "text"
     */
    type?: "text" | "email" | "password" | "tel" | "url" | "search" | "number";
}
declare const TextInputElement: react.ForwardRefExoticComponent<Omit<TextInputElementProps, "ref"> & react.RefAttributes<HTMLInputElement>>;

declare const polymorphicInput: (props?: ({
    size?: "small" | "medium" | "large" | null | undefined;
    status?: "error" | "success" | null | undefined;
    kind?: "flat" | "floating" | null | undefined;
    disabled?: boolean | null | undefined;
    readOnly?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type PolymorphicInputVariantProps = VariantProps<typeof polymorphicInput>;
type PolymorphicInputProps<T extends React.ElementType = "div"> = SlottablePropsWithRef<T> & {
    /**
     * Controls the size of the input.
     * @defaultValue "medium"
     */
    size?: PolymorphicInputVariantProps["size"];
    /**
     * Sets the status of the input.
     */
    status?: PolymorphicInputVariantProps["status"];
    /**
     * The visual kind of the input.
     * @defaultValue "flat"
     */
    kind?: PolymorphicInputVariantProps["kind"];
    /**
     * Whether the input is disabled.
     */
    disabled?: boolean;
    /**
     * Whether the input is read-only.
     */
    readOnly?: boolean;
    /**
     * Defines the value of the input. Used to determine how to style the text content. Redundant if you're rendering an `input` or `textarea` element with a placeholder.
     */
    value?: unknown;
    /**
     * Content to render on the left side of the input.
     */
    slotLeft?: React.ReactNode;
    /**
     * Content to render on the right side of the input.
     */
    slotRight?: React.ReactNode;
    /**
     * Determines which expand/collapse icon to show. Will only show if `expanded` is `true` or `false`.
     */
    expanded?: boolean;
    /**
     * Determines whether the expand/collapse chevron should be shown.
     */
    showChevron?: boolean;
    /**
     * Whether to show a dismiss/clear button when the input has a value.
     */
    dismissible?: boolean;
    /**
     * Callback when dismiss button is clicked.
     */
    onDismiss?: () => void;
    /**
     * Accessible label for the dismiss button.
     * @defaultValue "Clear"
     */
    dismissLabel?: string;
};

interface TextInputRootProps extends Omit<ComponentPropsWithRef<"input">, "size">, Pick<PolymorphicInputProps, "disabled" | "readOnly" | "dismissible" | "size" | "status" | "kind" | "slotLeft" | "slotRight"> {
    /**
     * The value of the text input when initially rendered. Use when you do not need to control the state of the text input.
     * @defaultValue ""
     */
    defaultValue?: string;
    /**
     * The controlled value of the text input. Must be used in conjunction with `onValueChange`.
     */
    value?: string;
    /**
     * Callback fired when the value changes.
     */
    onValueChange?: (value: string) => void;
}
/**
 * TextInput root element. Acts as a wrapper around the input allowing for iconography and rich content.
 * @param props - props to be passed to the {@link TextInputRoot} component
 * @see {@link TextInputRootProps}
 *
 * @example
 * ```tsx
 * <TextInputRoot size="medium">
 *   <TextInputValue />
 * </TextInputRoot>
 * ```
 */
declare const TextInputRoot: react.ForwardRefExoticComponent<Omit<TextInputRootProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface TextInputProps extends Pick<TextInputRootProps, "value" | "defaultValue" | "onValueChange" | "readOnly" | "disabled" | "dismissible" | "status" | "slotLeft" | "slotRight" | "kind" | "size">, Pick<TextInputElementProps, "type" | "placeholder" | "onChange">, Omit<MergedHoistedElementAttributes<[
    ["div", typeof TextInputRoot],
    ["input", typeof TextInputElement]
]>, "defaultValue" | "value" | "size" | "type" | "onChange"> {
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        TextInputValue?: NativeElementAttributes<"input", typeof TextInputElement>;
    };
}
/**
 * A browser text input with additional capabilities such as icons and status.
 * @remarks This component is a composition of the `TextInputRoot` and `TextInputValue` components. The `ref` and HTML attributes are applied to the inner `TextInputValue` component. You can still apply attributes to the outer `TextInputRoot` component using the `attributes` prop.
 * @param props - Component props
 * @see {@link TextInputProps}
 *
 * @example
 * ```tsx
 * <TextInput size="medium" placeholder="Enter a value" />
 * ```
 */
declare const TextInput: react.ForwardRefExoticComponent<TextInputProps & react.RefAttributes<HTMLInputElement>>;

declare const TextInputTestIds: {
    readonly TextInputRoot: "nv-text-input-root";
    readonly TextInputElement: "nv-text-input-element";
};

interface MenuSearchProps extends TextInputProps {
}
/**
 * A text input for searching within a menu.
 * @param props - props to be passed to the {@link MenuSearch} component
 * @see {@link MenuSearchProps}
 *
 * @example
 * ```tsx
 * <MenuSearch placeholder="Filter items" />
 * ```
 */
declare const MenuSearch: react.ForwardRefExoticComponent<MenuSearchProps & react.RefAttributes<HTMLInputElement>>;

/**
 * The handlers for the menu search context.
 */
interface MenuSearchHandlersContextStore {
    setValue: (newValue: string) => void;
}
declare const MenuSearchHandlersContext: react__default.Context<MenuSearchHandlersContextStore | undefined>;
/**
 * The value for the menu search context.
 */
interface MenuSearchValueContextStore {
    matchFn: "disable" | ((matchTerm: string, value: string) => boolean);
    value: string | undefined;
}
declare const MenuSearchValueContext: react__default.Context<MenuSearchValueContextStore | undefined>;
/**
 * Handlers to manage the menu search context.
 */
declare function useMenuSearchHandlers(): MenuSearchHandlersContextStore | undefined;
/**
 * The value for the menu search context. This value is deferred and so will not updating during
 * heavy updates.
 *
 * Expects a `filterValue` to use to evaluate against the search value, but also accepts `value` and
 * `children` as fallbacks.
 *
 * `filterValue` is the preferred way to provide a value to use for filtering. Takes priority over
 * `value` and `children`.
 *
 * If `children` is a string, that is the next fallback value. Otherwise, `value` is used. This is done
 * because search should be matched against the visible text of the item, not the value which may not
 * always align with the visible text.
 */
declare function useMenuSearchIsMatch(filterValue: string | undefined | null, value: string | undefined, children?: react__default.ReactNode): boolean | undefined;
/**
 * A basic match function that ignores case and diacritics.
 */
declare const DEFAULT_MATCH_FN: (matchTerm: string | undefined, value: string) => boolean;
interface MenuSearchProviderProps {
    children: react__default.ReactNode;
    defaultValue?: string;
    matchFn?: MenuSearchValueContextStore["matchFn"];
    onValueChange?: (value: string) => void;
    value?: string;
}
/**
 * Wrap this component around any section of a `Menu` you would like to make
 * searchable/filterable. This will provide a context that `MenuSearch` will automatically
 * update with your search value, and it will automatically filter `MenuItem`'s rendered
 * within its context.
 *
 * By default this uses a basic filter strategy, ignoring case and diacritics.
 * To customize this behavior, pass a custom `matchFn` to the `MenuSearchProvider`.
 *
 * @example
 * <MenuSearchProvider>
 *   <MenuSearch />
 * 	 <MenuItem value="1">My Menu Item</MenuItem>
 * 	 <MenuItem value="2">My Menu Item</MenuItem>
 * 	 <MenuItem value="3">My Menu Item</MenuItem>
 * </MenuSearchProvider>
 */
declare function MenuSearchProvider({ children, defaultValue, matchFn, onValueChange, value, }: MenuSearchProviderProps): react_jsx_runtime.JSX.Element;

interface MenuSectionProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * A section or group of items within a menu.
 * @param props - props to be passed to the {@link MenuSection} component
 * @see {@link MenuSectionProps}
 *
 * @example
 * ```tsx
 * <MenuSection>
 * 	<MenuHeading>Heading</MenuHeading>
 * 	<MenuItem>Item 1</MenuItem>
 * 	<MenuItem>Item 2</MenuItem>
 * 	<MenuItem>Item 3</MenuItem>
 * </MenuSection>
 * ```
 */
declare const MenuSection: react.ForwardRefExoticComponent<Omit<MenuSectionProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

type MenuKind = "default" | "checkbox" | "radio" | "section" | "divider";
interface BaseMenuItem extends Pick<MenuItemProps, "children" | "filterValue" | "disabled" | "onSelect" | "slotLeft" | "slotRight" | "danger"> {
    /**
     * The value to uniquely reference the item in the menu.
     * This is applied to the MenuItemEntry.
     */
    filterValue?: string | null;
}
interface MenuDefaultItemEntry extends BaseMenuItem, Pick<MenuItemProps, "slotLeft" | "slotRight"> {
    /**
     * The kind of menu item to render.
     * @defaultValue "default"
     */
    kind?: "default";
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        MenuItem?: NativeElementAttributes<"li", typeof MenuItem>;
    };
}
interface MenuCheckboxItemEntry extends BaseMenuItem, Pick<CheckboxBoxProps, "defaultChecked" | "checked" | "onCheckedChange" | "error"> {
    /**
     * The kind of menu item to render.
     */
    kind: "checkbox";
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        MenuCheckboxItem?: NativeElementAttributes<"li", typeof MenuCheckboxItem>;
    };
}
interface MenuRadioItemEntry extends BaseMenuItem, Pick<RadioGroupItemProps, "danger" | "value" | "defaultValue" | "required"> {
    /**
     * The kind of menu item to render.
     */
    kind?: never;
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        MenuRadioGroupItem?: NativeElementAttributes<"li", typeof MenuRadioGroupItem>;
    };
}
interface MenuRadioGroupEntry extends Pick<RadioGroupRootProps, "name" | "defaultValue" | "value" | "onValueChange" | "disabled" | "required" | "error"> {
    /**
     * The kind of menu item to render.
     */
    kind: "radio";
    /**
     * The heading of the section in the menu.
     */
    slotHeading: ReactNode;
    /**
     * The items to render in the radio group.
     */
    items: MenuRadioItemEntry[];
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        MenuRadioGroup?: NativeElementAttributes<"div", typeof MenuRadioGroup>;
        MenuHeading?: NativeElementAttributes<"div", typeof MenuHeading>;
    };
}
interface MenuSectionEntry {
    /**
     * The kind of menu item to render.
     */
    kind?: never;
    /**
     * The heading of the section in the menu.
     */
    slotHeading: ReactNode;
    /**
     * The text to render in the menu item.
     */
    children?: never;
    /**
     * The items to render in the section.
     */
    items: (MenuDefaultItemEntry | MenuCheckboxItemEntry | MenuDividerItemEntry)[];
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        MenuSection?: NativeElementAttributes<"div", typeof MenuSection>;
        MenuHeading?: NativeElementAttributes<"div", typeof MenuHeading>;
    };
    /**
     * The text value of the menu item used for filtering.
     */
    filterValue?: never;
}
interface MenuDividerItemEntry {
    /**
     * The kind of menu item to render.
     */
    kind: "divider";
    /**
     * The width/thickness of the divider
     * @defaultValue "small"
     */
    width?: "small" | "medium" | "large";
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        Divider?: NativeElementAttributes<"div", typeof Divider>;
    };
    /**
     * The text value of the menu item used for filtering.
     */
    filterValue?: never;
}
type MenuEntry = string | MenuDefaultItemEntry | MenuCheckboxItemEntry | MenuRadioGroupEntry | MenuSectionEntry | MenuRadioItemEntry | MenuDividerItemEntry;
interface MenuProps extends Pick<MenuRootProps, "density">, NativeElementAttributes<"menu", typeof MenuRoot> {
    /**
     * This sets the default value of the menu search input.
     */
    defaultFilterValue?: string;
    /**
     * Whether the menu is filterable.
     * @defaultValue false
     */
    filterable?: boolean;
    /**
     * The items to render in the menu.
     */
    items: MenuEntry[];
    /**
     * Callback fired when the search value changes.
     */
    onFilterChange?: (value: string) => void;
    /**
     * Callback fired when a menu item's checked state changes
     */
    onItemCheckedChange?: (item: MenuCheckboxItemEntry, checked: CheckedState) => void;
    /**
     * Callback fired when a menu item is selected
     */
    onItemSelect?: (event: Event, item: MenuDefaultItemEntry | MenuCheckboxItemEntry | MenuRadioItemEntry) => void;
    /**
     * The controlled value of the menu search input. Must be used in conjunction with `onFilterChange`.
     */
    filterValue?: string;
    /**
     * The function to use to match items against the search value.
     */
    filterMatchFn?: MenuSearchProviderProps["matchFn"];
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        MenuSearch?: NativeElementAttributes<"input", typeof MenuSearch>;
    };
}
/**
 * A menu component that displays a list of items.
 *
 * Note: if you're looking for a menu that can be used as a dropdown, see the `Dropdown` component.
 * This is the menu component itself, not a dropdown.
 *
 * @see {@link MenuProps}
 *
 * {@link https://virtual-front-end-initiative.gitlab-master-pages.nvidia.com/kaizen-ui-foundations/kaizen-ui/components/menu Menu Documentation}
 *
 * @example
 * ```tsx
 * <Menu
 * 	items={[
 * 		{ children: "Item 1", slotLeft: <InfoCircleIcon /> },
 * 		{ children: "Item 2" },
 * 	]}
 * />
 * ```
 */
declare const Menu: react.ForwardRefExoticComponent<Omit<MenuProps, "ref"> & react.RefAttributes<HTMLMenuElement>>;

declare const MenuTestIds: {
    readonly MenuRoot: "nv-menu-root";
    readonly MenuHeading: "nv-menu-heading";
    readonly MenuItem: "nv-menu-item";
    readonly MenuSearch: "nv-menu-search";
    readonly MenuSection: "nv-menu-section";
    readonly MenuRadioGroup: "nv-menu-radio-group";
    readonly MenuRadioGroupItem: "nv-menu-radio-group-item";
    readonly MenuCheckboxItem: "nv-menu-checkbox-item";
};

interface ComboboxItemProps extends MenuItemProps, MenuCheckboxItemProps {
    /**
     * The value given as data when submitted with a name. Also used to match against the users search
     * value if `filterValue` is not provided.
     */
    value: string;
}
/**
 * Renders a combobox item inside `ComboboxContent`. If the item is determined to not match the
 * filter value, it will not be rendered.
 *
 * @see {@link ComboboxItemProps}
 *
 * {@link https://virtual-front-end-initiative.gitlab-master-pages.nvidia.com/kaizen-ui-foundations/kaizen-ui/components/combobox Combobox Documentation}
 *
 * @example
 * <ComboboxItem value="1">Item 1</ComboboxItem>
 *
 * @example
 * <ComboboxItem filterValue="Item 1" value="1">
 *   <Badge>Item 1</Badge>
 * </ComboboxItem>
 */
declare const ComboboxItem: react__default.ForwardRefExoticComponent<Omit<ComboboxItemProps, "ref"> & react__default.RefAttributes<HTMLLIElement>>;

/**
 * A Combobox item/entry that is a default item with a value and a matchValue for filtering.
 */
interface ComboboxDefaultItem extends ComboboxItemProps {
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        ComboboxItem?: NativeElementAttributes<"li", typeof ComboboxItem>;
    };
}
/**
 * A Combobox item/entry that is a section with a title and a list of items.
 */
interface ComboboxSectionEntry extends Omit<MenuSectionEntry, "items"> {
    /**
     * The items to render in the section.
     */
    items: (string | ComboboxDefaultItem)[];
}
/**
 * What can be passed to the Combobox in the `items` array:
 * - a string which is resolved into a menu item
 * - a ComboboxDefaultItem which is a menu item with children and a value
 * - a ComboboxSectionEntry which is a section with a title and a list of items
 */
type ComboboxEntry = string | ComboboxDefaultItem | ComboboxSectionEntry;
interface SingleComboboxProps {
    /**
     * The value of the combobox when initially rendered. Use when you do not need to control the
     * state of the combobox.
     *
     * Use a string for single value comboboxes and an array of strings for multiple value comboboxes.
     */
    defaultSelectedValue?: string;
    /**
     * @remarks When `mutiple` is true the Combobox allows for multiple values to be selected.
     */
    multiple?: false;
    /**
     * Callback when the selected value of the combobox changes.
     *
     * @param value - The `value` of the selected item. For multiple value comboboxes, this will
     * be an array of `value`s.
     */
    onSelectedValueChange?: (value: string) => void;
    /**
     * Controls the rendering of the selected combobox value in the trigger.
     *
     * By default the combobox will render the children of the selected item for a single value combobox.
     * For a multiple value combobox, the combobox renders the count of selected items.
     */
    renderSelectedValue?: (args: {
        selectedValue: string;
        setSelectedValue: (value: string | ((prev: string) => string)) => void;
    }) => React.ReactNode;
    /**
     * The controlled value of the combobox. Must be used in conjunction with `onValueChange`.
     */
    selectedValue?: string;
}
/**
 * The props that overlap between the single and multiple value comboboxes but differ in type. This
 * union allows us to ensure that props are not mixed and matched in types between the two.
 */
type ComboboxSingleAndMultipleProps = SingleComboboxProps | {
    defaultSelectedValue?: string[];
    multiple: true;
    onSelectedValueChange?: (value: string[]) => void;
    renderSelectedValue?: (args: {
        selectedValue: string[];
        setSelectedValue: (value: string[] | ((prev: string[]) => string[])) => void;
    }) => React.ReactNode;
    selectedValue?: string[];
} | {
    defaultSelectedValue?: string[];
    kind: "multiple";
    multiple?: true;
    onSelectedValueChange?: (value: string[]) => void;
    renderSelectedValue?: (args: {
        selectedValue: string[];
        setSelectedValue: (value: string[] | ((prev: string[]) => string[])) => void;
    }) => React.ReactNode;
    selectedValue?: string[];
};

interface ComboboxContentProps extends Omit<MenuRootProps, "asChild"> {
    /**
     * Whether the combobox trigger should be focused on hide.
     * @defaultValue `true`
     */
    autoFocusOnHide?: boolean;
    /**
     * Whether the combobox content should be hidden when the escape key is pressed. Also accepts a function
     * that you can use to set `event.stopPropagation()`.
     * @defaultValue `true`
     */
    hideOnEscape?: ComboboxPopoverProps["hideOnEscape"];
    /**
     * Whether the combobox content should be rendered in a portal. This is useful when the combobox content is a child of a fixed container.
     * @defaultValue true
     */
    portal?: boolean;
    /**
     * The combobox to render the modal content in when `portal` is true.
     * @defaultValue document.body
     */
    portalContainer?: ComboboxPopoverProps["portalElement"];
}
/**
 * The component that pops out when the combobox is open.
 *
 * @see {@link ComboboxContentProps}
 *
 * {@link https://virtual-front-end-initiative.gitlab-master-pages.nvidia.com/kaizen-ui-foundations/kaizen-ui/components/combobox|Combobox Documentation}
 *
 * @example
 * ```tsx
 * <ComboboxContent>
 *   <ComboboxItem value="1">Item 1</ComboboxItem>
 *   <ComboboxItem value="2">Item 2</ComboboxItem>
 * </ComboboxContent>
 * ```
 *
 * @example
 * ```tsx
 * // using ComboboxContent in a modal
 * <ComboboxContent portalContainer={modalRoot}>
 *   <ComboboxItem value="1">Item 1</ComboboxItem>
 *   <ComboboxItem value="2">Item 2</ComboboxItem>
 * </ComboboxContent>
 * ```
 */
declare const ComboboxContent: react.ForwardRefExoticComponent<Omit<ComboboxContentProps, "ref"> & react.RefAttributes<HTMLMenuElement>>;

interface ComboboxInputProps extends react__default.ComponentPropsWithRef<"input"> {
    /**
     * On input blur, if the input value is different from the selected value, set the input value to the selected value.
     *
     * @defaultValue true
     */
    resetValueOnBlur?: boolean;
}
/**
 * The text input for the combobox. Should be used inside the `ComboboxTrigger` component.
 * @param props - props to be passed to the {@link ComboboxInput} component
 * @see {@link ComboboxInputProps}
 *
 * {@link https://virtual-front-end-initiative.gitlab-master-pages.nvidia.com/kaizen-ui-foundations/kaizen-ui/components/combobox Combobox Documentation}
 *
 * @example
 * ```tsx
 * <ComboboxTrigger>
 * 	<ComboboxInput />
 * </ComboboxTrigger>
 * ```
 */
declare const ComboboxInput: react__default.ForwardRefExoticComponent<Omit<ComboboxInputProps, "ref"> & react__default.RefAttributes<HTMLInputElement>>;

interface ComboboxRootProps extends react__default.PropsWithChildren, Pick<ComboboxSingleAndMultipleProps, "defaultSelectedValue" | "multiple" | "selectedValue" | "onSelectedValueChange"> {
    /**
     * The initial open state of the combobox.
     */
    defaultOpen?: boolean;
    /**
     * The initial value of the combobox input.
     *
     * Note this is the value of the input, not the selected value. Use `defaultSelectedValue` for
     * the selected value.
     */
    defaultValue?: string;
    /**
     * The disabled state of the combobox.
     */
    disabled?: boolean;
    /**
     * The callback to be called when the combobox is opened or closed. Use in conjunction with `open`.
     */
    onOpenChange?: (open: boolean) => void;
    /**
     * The callback to be called when the value of the combobox input changes.
     *
     * Note this is the value of the input, not the selected value. Use `onSelectedValueChange` for
     * the selected value.
     */
    onValueChange?: (value: string) => void;
    /**
     * The controlled open state of the combobox. Must be used in conjunction with `onOpenChange`.
     */
    open?: boolean;
    /**
     * Whether the combobox is read-only. A read-only combobox will not allow the user to change the
     * selected value or view the menu.
     */
    readOnly?: boolean;
    /**
     * The side the combobox menu will be positioned.
     * @defaultValue "bottom"
     */
    side?: "bottom" | "top" | "left" | "right";
    /**
     * The size of the combobox trigger. By default this will also control the `density` of the
     * `ComboboxContent` - to override this, use the `density` prop.
     * @defaultValue "medium"
     */
    size?: "small" | "medium" | "large";
    /**
     * The value of the combobox input.
     *
     * Note this is the value of the input, not the selected value. Use `selectedValue` for the
     * selected value.
     */
    value?: string;
    /**
     * Whether to use custom value rendering. If true, the value entered into the input will be cleared
     * when the popover is hidden so that something else can be used to manage the rendering of the
     * selected value.
     *
     * @defaultValue false
     */
    withCustomValueRendering?: boolean;
}
/**
 * Provider component for the Combobox. This should wrap the `ComboboxTrigger` and `ComboboxContent`
 * components. This provides necessary context for the combobox to function.
 *
 * This component does not render a DOM element.
 *
 * @see {@link ComboboxRootProps}
 *
 * @see [`Combobox Documentation`](https://virtual-front-end-initiative.gitlab-master-pages.nvidia.com/kaizen-ui-foundations/kaizen-ui/components/combobox)
 *
 * @example
 * <ComboboxRoot>
 * 	<ComboboxTrigger>
 *    <ComboboxInput />
 * 	</ComboboxTrigger>
 * 	<ComboboxContent>
 * 		<ComboboxItem value="Apple" />
 * 		<ComboboxItem value="Banana" />
 * 		<ComboboxItem value="Orange" />
 * 	</ComboboxContent>
 * </ComboboxRoot>
 */
declare function ComboboxRoot({ children, defaultOpen, defaultSelectedValue, defaultValue, disabled, multiple, onOpenChange, onSelectedValueChange, onValueChange, open, readOnly, selectedValue, side, size, value, withCustomValueRendering, }: ComboboxRootProps): react_jsx_runtime.JSX.Element;
declare namespace ComboboxRoot {
    var displayName: string;
}

interface ComboboxSearchProviderProps extends Pick<MenuSearchProviderProps, "children" | "matchFn"> {
}
/**
 * A combobox specific implementation of the MenuSearchProvider. Combobox is slightly different because
 * we already have a separate store for the search value that we want to plug into, so we create
 * a separate context.
 */
declare function ComboboxSearchProvider({ children, matchFn, }: ComboboxSearchProviderProps): react_jsx_runtime.JSX.Element;

declare const tagRoot: (props?: ({
    color?: "blue" | "green" | "red" | "yellow" | "purple" | "teal" | "gray" | null | undefined;
    density?: "compact" | "standard" | "spacious" | null | undefined;
    kind?: "outline" | "solid" | null | undefined;
    selected?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type TagRootVariants = VariantProps<typeof tagRoot>;
interface TagProps extends Omit<PrimitivePropsWithRef<"button">, "color">, TagRootVariants, DensityVariantProps {
    /**
     * The color of the tag.
     * @defaultValue "blue"
     */
    color?: TagRootVariants["color"];
    /**
     * The kind of tag. Can be either `solid` or `outline`.
     * @defaultValue "solid"
     */
    kind?: TagRootVariants["kind"];
    /**
     * Whether the tag is read-only. This will prevent the tag from being interacted with.
     */
    readOnly?: boolean;
    /**
     * Whether or not the tag is selected.
     */
    selected?: TagRootVariants["selected"];
}
/**
 * Tags are used to categorize, label, or group items using text and optional icons, providing users
 * with quick, contextual information.
 * @param props - props to be passed to the {@link Tag} component
 * @see {@link TagProps}
 *
 * @example
 * ```tsx
 * <Tag kind="outline" color="red">
 *   <Icon />
 *   Tag Text
 * </Tag>
 * ```
 *
 * @example
 * ```tsx
 * <Tag
 *   color="green"
 *   disabled // to disable the tag
 *   selected // for "selected" state tags
 *   readOnly // to prevent the tag from being interacted with
 * >
 *   <Icon />
 *   Tag Text
 * </Tag>
 * ```
 *
 * @example
 * ```tsx
 * // tag as a link
 * <Tag asChild>
 *   <Link href="/">
 *     Tag as a Link
 *     <OpenExternal />
 *   </Link>
 * </Tag>
 * ```
 */
declare const Tag: react.ForwardRefExoticComponent<Omit<TagProps, "ref"> & react.RefAttributes<HTMLButtonElement>>;

interface ComboboxSelectedValueProps extends Omit<TagProps, "children"> {
    /**
     * To control rendering of selected value(s) you can pass a function that receives the selected
     * value(s) as an argument. The function also receives a `setSelectedValue` function that can be
     * used to set the selected value(s) to create custom dismissable items.
     *
     * @example
     * <ComboboxSelectedValue>
     * 	{({ selectedValue }) => <span>{selectedValue}</span>}
     * </ComboboxSelectedValue>
     */
    children?: (args: {
        selectedValue: string | string[];
        setSelectedValue: (value: string | string[]) => void;
    }) => react__default.ReactNode;
    /**
     * Callback triggered when the selected value tag is clicked to be dismissed.
     */
    onDismiss?: () => void;
}
/**
 * Renders the selected value(s) of the combobox. By default it only renders for multiple selection
 * comboboxes and when there are selected values. It does also provide the selected value(s) as an
 * argument to the `children` prop to handle rendering custom items.
 *
 * @param props - props to be passed to the {@link ComboboxSelectedValue} component
 * @see {@link ComboboxSelectedValueProps}
 *
 * @see [`Combobox Documentation`](https://virtual-front-end-initiative.gitlab-master-pages.nvidia.com/kaizen-ui-foundations/kaizen-ui/components/combobox)
 *
 * @example
 * ```tsx
 * // single selection combobox
 * <ComboboxSelectedValue>
 * 	{({selectedValue}) => <span>{selectedValue}</span>}
 * </ComboboxSelectedValue>
 *
 * // multiple selection combobox
 * <ComboboxSelectedValue>
 * 	{({selectedValue}) => <span>{selectedValue.join(", ")}</span>}
 * </ComboboxSelectedValue>
 *
 * // multiple selection combobox with custom dismissable items
 * <ComboboxSelectedValue>
 * 	{({selectedValue, setSelectedValue}) => <span>{selectedValue.map(value => <Tag key={value} color="gray" onClick={() => setSelectedValue(selectedValue.filter(v => v !== value))}>{value}</Tag>)}</span>}
 * </ComboboxSelectedValue>
 * ```
 */
declare const ComboboxSelectedValue: react__default.ForwardRefExoticComponent<Omit<ComboboxSelectedValueProps, "ref"> & react__default.RefAttributes<HTMLButtonElement>>;

interface ComboboxTriggerProps extends Pick<PolymorphicInputProps<"div">, "children" | "className" | "dismissLabel" | "dismissible" | "kind" | "onDismiss" | "slotLeft" | "slotRight" | "status"> {
}
/**
 * The combobox trigger. This wraps the combobox input itself and acts as the combobox menu's anchor.
 * This manages the combobox's open/status/disabled states, meeting our consistent input trigger states.
 *
 * @see {@link ComboboxTriggerProps}
 *
 * {@link https://virtual-front-end-initiative.gitlab-master-pages.nvidia.com/kaizen-ui-foundations/kaizen-ui/components/combobox Combobox Documentation}
 *
 * @example
 * <ComboboxTrigger>
 * 	<ComboboxInput />
 * </ComboboxTrigger>
 */
declare const ComboboxTrigger: react__default.ForwardRefExoticComponent<ComboboxTriggerProps & react__default.RefAttributes<HTMLDivElement>>;

interface BaseComboboxProps extends Pick<ComboboxRootProps, "defaultOpen" | "defaultValue" | "disabled" | "onOpenChange" | "onValueChange" | "open" | "readOnly" | "side" | "size" | "value">, Pick<ComboboxTriggerProps, "dismissible" | "slotLeft" | "slotRight" | "status">, Pick<ComboboxInputProps, "resetValueOnBlur">, Pick<ComboboxContentProps, "autoFocusOnHide" | "density" | "hideOnEscape" | "portal" | "portalContainer" | "onScrollToBottom">, Omit<MergedHoistedElementAttributes<[
    ["input", typeof ComboboxTrigger],
    ["menu", typeof ComboboxContent]
]>, "defaultValue" | "value" | "size"> {
    /**
     * @deprecated Use `multiple` instead. This prop will be removed in the next major version.
     */
    kind?: "single" | "multiple";
    /**
     * The kind of the combobox trigger. Used to determine whether or not to render background colors and borders.
     * @defaultValue "flat"
     */
    triggerKind?: "floating" | "flat";
    /**
     * The function used to match items against the search value. Use this to customize the filtering
     * behavior.
     *
     * To disable the built-in filtering, set this to `"disable"`.
     */
    filterMatchFn?: ComboboxSearchProviderProps["matchFn"];
    /**
     * The items to render in the combobox.
     */
    items: ComboboxEntry[];
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        ComboboxContent?: NativeElementAttributes<"menu", typeof ComboboxContent>;
        ComboboxInput?: NativeElementAttributes<"input", typeof ComboboxInput>;
        ComboboxSelectedValue?: NativeElementAttributes<"span", typeof ComboboxSelectedValue>;
        ComboboxTrigger?: NativeElementAttributes<"button", typeof ComboboxTrigger>;
    };
}
type ComboboxProps = BaseComboboxProps & ComboboxSingleAndMultipleProps;
/**
 * A combobox is a dropdown that allows the user to select a value from a list of options.
 * @param props - props to be passed to the {@link Combobox} component
 * @see {@link ComboboxProps}
 *
 * {@link https://virtual-front-end-initiative.gitlab-master-pages.nvidia.com/kaizen-ui-foundations/kaizen-ui/components/combobox Combobox Documentation}
 *
 * @example
 * ```tsx
 * // single select
 * <Combobox items={["a", "b", "c"]} />
 * ```
 *
 * @example
 * ```tsx
 * // floating multi select
 * <Combobox items={["a", "b", "c"]} multiple triggerKind="floating" />
 * ```
 */
declare const Combobox: react__default.ForwardRefExoticComponent<ComboboxProps & react__default.RefAttributes<HTMLInputElement>>;

declare const ComboboxTestIds: {
    readonly ComboboxRoot: "nv-combobox-root";
    readonly ComboboxTrigger: "nv-combobox-trigger";
    readonly ComboboxTriggerButton: "nv-combobox-trigger-button";
    readonly ComboboxContent: "nv-combobox-content";
    readonly ComboboxSection: "nv-combobox-section";
    readonly ComboboxHeading: "nv-combobox-heading";
    readonly ComboboxDismissButton: "nv-combobox-dismiss-button";
};

interface DropdownCheckboxItemProps extends Omit<MenuCheckboxItemProps, "onSelect"> {
    /**
     * When true, the dropdown menu will close when the user selects an item.
     */
    closeMenuOnSelect?: boolean;
    /**
     * Event handler called when the user selects an item (via mouse or keyboard). Calling `event.preventDefault` in this handler will prevent the dropdown menu from closing when selecting that item.
     */
    onSelect?: (event: Event) => void;
}
/**
 * An item that can be controlled and rendered like a checkbox.
 * @param props - props to be passed to the {@link DropdownCheckboxItem} component
 * @see {@link DropdownCheckboxItemProps}
 *
 * @example
 * ```tsx
 * <DropdownContent>
 *   <DropdownCheckboxItem>My Checkbox Item</DropdownCheckboxItem>
 * </DropdownContent>
 * ```
 */
declare const DropdownCheckboxItem: react.ForwardRefExoticComponent<DropdownCheckboxItemProps & react.RefAttributes<HTMLLIElement>>;

interface DropdownContentProps extends MenuRootProps {
    /**
     * Whether the dropdown content should be rendered in a portal. This is useful when the dropdown content is a child of a fixed container.
     * @defaultValue true
     */
    portal?: boolean;
    /**
     * The dropdown to render the modal content in when `portal` is true.
     * @defaultValue document.body
     */
    portalContainer?: Element | DocumentFragment | null;
    /**
     * Event handler called when focus moves to the trigger after closing. It can be prevented by calling `event.preventDefault`.
     */
    onCloseAutoFocus?: (event: Event) => void;
    /**
     * Event handler called when the escape key is down. It can be prevented by calling `event.preventDefault`.
     */
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    /**
     * Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling `event.preventDefault`.
     */
    onPointerDownOutside?: (event: Event) => void;
    /**
     * Event handler called when an interaction event occurs outside the bounds of the component. It can be prevented by calling `event.preventDefault`.
     */
    onInteractOutside?: (event: Event) => void;
    /**
     * The alignment of the dropdown content relative to the trigger.
     * @defaultValue "center"
     */
    align?: "start" | "end" | "center";
    /**
     * The preferred side of the trigger to render against when open. Will be reversed when collisions occur.
     * @defaultValue "bottom"
     */
    side?: "top" | "bottom" | "left" | "right";
    /**
     * Forces the content to be mounted in the DOM regardless of the `open` state.
     * When true, this overrides the default visibility behavior and keeps content mounted,
     * making it useful for custom animation control with React animation libraries.
     * @defaultValue undefined
     */
    forceMount?: true;
}
/**
 * The component that pops out when the dropdown is open.
 * @param props - props to be passed to the {@link DropdownContent} component
 * @see {@link DropdownContentProps}
 *
 * @example
 * ```tsx
 * <DropdownRoot>
 *   <DropdownContent>
 *     <DropdownItem>Item 1</DropdownItem>
 *     <DropdownItem>Item 2</DropdownItem>
 *   </DropdownContent>
 * </DropdownRoot>
 * ```
 */
declare const DropdownContent: react.ForwardRefExoticComponent<Omit<DropdownContentProps, "ref"> & react.RefAttributes<HTMLMenuElement>>;

interface DropdownHeadingProps extends MenuHeadingProps {
    /**
     * Indicates this component is polymorphic and its behavior should be merged with the
     * immediate child to create only a single output node in the DOM. If true,
     * merges props and behavior with the child.
     */
    asChild?: boolean;
}
/**
 * Used to render a label. It won't be focusable using arrow keys. Particularly useful for adding a label to a group of items.
 * @param props - props to be passed to the {@link DropdownHeading} component
 * @see {@link DropdownHeadingProps}
 *
 * @example
 * ```tsx
 * <DropdownGroup>
 *	 <DropdownHeading>My Label</DropdownHeading>
 *   <DropdownItem>Item 1</DropdownItem>
 *   <DropdownItem>Item 2</DropdownItem>
 * </DropdownGroup>
 * ```
 */
declare const DropdownHeading: react.ForwardRefExoticComponent<Omit<DropdownHeadingProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface DropdownItemProps extends Omit<MenuItemProps, "onSelect"> {
    /**
     * Event handler called when the user selects an item (via mouse or keyboard). Calling `event.preventDefault` in this handler will prevent the dropdown menu from closing when selecting that item.
     */
    onSelect?: (event: Event) => void;
}
/**
 * The component that contains the dropdown items.
 * @param props - props to be passed to the {@link DropdownItem} component
 * @see {@link DropdownItemProps}
 *
 * @example
 * ```tsx
 * <DropdownContent>
 *   <DropdownItem>My Dropdown Item</DropdownItem>
 * </DropdownContent>
 * ```
 */
declare const DropdownItem: react.ForwardRefExoticComponent<Omit<DropdownItemProps, "ref"> & react.RefAttributes<HTMLLIElement>>;

interface DropdownRadioGroupProps extends MenuRadioGroupProps {
}
/**
 * Used to group multiple radio items together in a dropdown.
 * @param props - props to be passed to the {@link DropdownRadioGroup} component
 * @see {@link DropdownRadioGroupProps}
 *
 * @example
 * ```tsx
 * <DropdownRadioGroup>
 *   <DropdownRadioGroupItem>Item 1</DropdownRadioGroupItem>
 *   <DropdownRadioGroupItem>Item 2</DropdownRadioGroupItem>
 * </DropdownRadioGroup>
 * ```
 */
declare const DropdownRadioGroup: react.ForwardRefExoticComponent<Omit<DropdownRadioGroupProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface DropdownRadioGroupItemProps extends Omit<MenuRadioGroupItemProps, "onSelect"> {
    /**
     * When true, the dropdown menu will close when the user selects an item.
     */
    closeMenuOnSelect?: boolean;
    /**
     * Event handler called when the user selects an item (via mouse or keyboard). Calling `event.preventDefault` in this handler will prevent the dropdown menu from closing when selecting that item.
     */
    onSelect?: (event: Event) => void;
}
/**
 * A dropdown item with a radio button that can be checked.
 * @param props - props to be passed to the {@link DropdownRadioGroupItem} component
 * @see {@link DropdownRadioGroupItemProps}
 *
 * @example
 * ```tsx
 * <DropdownContent>
 * 	<DropdownRadioGroup name="my-radio-group">
 *   	<DropdownRadioGroupItem>My Checkbox Item</DropdownRadioGroupItem>
 * 	</DropdownRadioGroup>
 * </DropdownContent>
 * ```
 */
declare const DropdownRadioGroupItem: react.ForwardRefExoticComponent<DropdownRadioGroupItemProps & react.RefAttributes<HTMLLIElement>>;

interface DropdownRootProps extends PropsWithChildren {
    /**
     * The open state of the dropdown when it is initially rendered. Use when you do not need to control its open state.
     * @defaultValue false
     */
    defaultOpen?: boolean;
    /**
     * The controlled open state of the dropdown. Must be used in conjunction with `onOpenChange`.
     */
    open?: boolean;
    /**
     * Event handler called when the open state of the dropdown changes.
     */
    onOpenChange?: (open: boolean) => void;
    /**
     * The modality of the dropdown. When set to true, interaction with outside elements will be disabled and only menu content will be visible to screen readers.
     * Modality is disabled by default to minimize performance impact.
     * @defaultValue false
     */
    modal?: boolean;
    /**
     * The size of the dropdown and its trigger.
     * @defaultValue "medium"
     */
    size?: "small" | "medium" | "large";
}
/**
 * Contains all the parts of a dropdown.
 * @param props - props to be passed to the {@link DropdownRoot} component
 * @see {@link DropdownRootProps}
 *
 * @example
 * ```tsx
 * <DropdownRoot>
 *  <DropdownTrigger>
 *    <Button>Click me</Button>
 *  </DropdownTrigger>
 *  <DropdownContent>
 *    ...
 *  </DropdownContent>
 * </DropdownRoot>
 * ```
 */
declare const DropdownRoot: {
    ({ open, onOpenChange, size, defaultOpen, modal, children, }: DropdownRootProps): react_jsx_runtime.JSX.Element;
    displayName: string;
};

interface DropdownSectionProps extends PrimitivePropsWithRef<"section"> {
    /**
     * Indicates this component is polymorphic and its behavior should be merged with the
     * immediate child to create only a single output node in the DOM. If true,
     * merges props and behavior with the child.
     */
    asChild?: boolean;
}
/**
 * Used to group multiple dropdown items together (optional). Particularly useful when you need to separate items into different sections.
 * @param props - props to be passed to the {@link DropdownSection} component
 * @see {@link DropdownSectionProps}
 *
 * @example
 * ```tsx
 * <DropdownSection>
 *   <DropdownItem>Item 1</DropdownItem>
 *   <DropdownItem>Item 2</DropdownItem>
 * </DropdownSection>
 * ```
 */
declare const DropdownSection: react.ForwardRefExoticComponent<Omit<DropdownSectionProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface DropdownSubProps extends PropsWithChildren {
    /**
     * The open state of the submenu when it is initially rendered. Use when you do not need to control its open state.
     */
    defaultOpen?: boolean;
    /**
     * The controlled open state of the submenu. Must be used in conjunction with `onOpenChange`.
     */
    open?: boolean;
    /**
     * Event handler called when the open state changes.
     */
    onOpenChange?: (open: boolean) => void;
}
/**
 * Contains all the parts of a submenu.
 * @param props - props to be passed to the {@link DropdownSub} component
 * @see {@link DropdownSubProps}
 *
 * @example
 * ```tsx
 * <DropdownContent>
 *   <DropdownSub>
 *     <DropdownSubTrigger>Submenu</DropdownSubTrigger>
 *     <DropdownSubContent>
 *       <DropdownItem>Item 1</DropdownItem>
 *			 <DropdownItem>Item 2</DropdownItem>
 *     </DropdownSubContent>
 *   </DropdownSub>
 * </DropdownContent>
 * ```
 */
declare const DropdownSub: {
    (props: DropdownSubProps): react_jsx_runtime.JSX.Element;
    displayName: string;
};

interface DropdownSubContentProps extends PrimitivePropsWithRef<"menu">, DensityVariantProps {
    /**
     * Whether the dropdown content should be rendered in a portal. This is useful when the dropdown content is a child of a fixed container.
     * @defaultValue true
     */
    portal?: boolean;
    /**
     * The dropdown to render the modal content in when `portal` is true.
     * @defaultValue document.body
     */
    portalContainer?: Element | DocumentFragment | null;
    /**
     * Event handler called when the escape key is down. It can be prevented by calling `event.preventDefault`.
     */
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    /**
     * Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling `event.preventDefault`.
     */
    onPointerDownOutside?: (event: Event) => void;
    /**
     * Forces the content to be mounted in the DOM regardless of the `open` state.
     * When true, this overrides the default visibility behavior and keeps content mounted,
     * making it useful for custom animation control with React animation libraries.
     * @defaultValue undefined
     */
    forceMount?: true;
}
/**
 * The component that pops out when a submenu is open. Must be rendered inside a DropdownSub component.
 * @param props - props to be passed to the {@link DropdownSubContent} component
 * @see {@link DropdownSubContentProps}
 *
 * @example
 * ```tsx
 * <DropdownContent>
 *   <DropdownSub>
 *     <DropdownSubTrigger>Submenu</DropdownSubTrigger>
 *     <DropdownSubContent>
 *       <DropdownItem>Item 1</DropdownItem>
 *			 <DropdownItem>Item 2</DropdownItem>
 *     </DropdownSubContent>
 *   </DropdownSub>
 * </DropdownContent>
 * ```
 */
declare const DropdownSubContent: react.ForwardRefExoticComponent<Omit<DropdownSubContentProps, "ref"> & react.RefAttributes<HTMLMenuElement>>;

interface DropdownSubTriggerProps extends MenuItemProps {
}
/**
 * An item that opens a submenu. Must be rendered inside a DropdownSub component.
 * @param props - props to be passed to the {@link DropdownSubTrigger} component
 * @see {@link DropdownSubTriggerProps}
 *
 * @example
 * ```tsx
 * <DropdownContent>
 *   <DropdownSub>
 *     <DropdownSubTrigger>Submenu</DropdownSubTrigger>
 *     <DropdownSubContent>
 *       <DropdownItem>Item 1</DropdownItem>
 *			 <DropdownItem>Item 2</DropdownItem>
 *     </DropdownSubContent>
 *   </DropdownSub>
 * </DropdownContent>
 * ```
 */
declare const DropdownSubTrigger: react.ForwardRefExoticComponent<Omit<DropdownSubTriggerProps, "ref"> & react.RefAttributes<HTMLLIElement>>;

interface DropdownTriggerProps extends ButtonProps {
    /**
     * When true, shows the chevron icon showing the current state of the dropdown.
     * @defaultValue true
     */
    showChevron?: boolean;
}
/**
 * The button that toggles the dropdown. By default, the DropdownContent will position itself against the trigger.
 * @param props - props to be passed to the {@link DropdownTrigger} component
 * @see {@link DropdownTriggerProps}
 *
 * @example
 * ```tsx
 * <DropdownTrigger>
 *   Click me
 * </DropdownTrigger>
 * ```
 *
 * @example
 * ```tsx
 * // custom button trigger
 * <DropdownTrigger asChild>
 *   <Button color="danger">
 *     Delete User
 *   </Button>
 * </DropdownTrigger>
 * ```
 *
 * @example
 * ```tsx
 * // no chevron
 * <DropdownTrigger showChevron={false}>
 *   Click me
 * </DropdownTrigger>
 * ```
 */
declare const DropdownTrigger: react.ForwardRefExoticComponent<Omit<DropdownTriggerProps, "ref"> & react.RefAttributes<HTMLButtonElement>>;

type DropdownKind = MenuKind | "sub";
interface BaseDropdownItem extends BaseMenuItem {
}
interface DropdownDefaultItemEntry extends Omit<MenuDefaultItemEntry, "attributes"> {
    /**
     * Provide a URL to navigate to when the dropdown item is clicked. This will render a <a> element
     * - see {@link DropdownProps.renderLink} to use a custom link component.
     */
    href?: string;
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        DropdownItem?: NativeElementAttributes<"li", typeof DropdownItem>;
    };
}
interface DropdownCheckboxItemEntry extends Omit<MenuCheckboxItemEntry, "attributes"> {
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        DropdownCheckboxItem?: NativeElementAttributes<"li", typeof DropdownCheckboxItem>;
    };
}
interface DropdownRadioItemEntry extends Omit<MenuRadioItemEntry, "attributes"> {
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        DropdownRadioGroupItem?: NativeElementAttributes<"li", typeof DropdownRadioGroupItem>;
    };
}
interface DropdownDividerItemEntry extends Omit<MenuDividerItemEntry, "attributes"> {
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        Divider?: NativeElementAttributes<"div", typeof Divider>;
    };
}
interface DropdownRadioGroupEntry extends Omit<MenuRadioGroupEntry, "attributes" | "items"> {
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        DropdownRadioGroup?: NativeElementAttributes<"div", typeof DropdownRadioGroup>;
        DropdownHeading?: NativeElementAttributes<"div", typeof DropdownHeading>;
    };
    /**
     * The items to render in the radio group.
     */
    items: DropdownRadioItemEntry[];
}
interface DropdownSubSection extends BaseDropdownItem, Pick<DropdownSubProps, "open" | "defaultOpen" | "onOpenChange">, Pick<DropdownSubContentProps, "onPointerDownOutside" | "onEscapeKeyDown" | "portal" | "portalContainer" | "forceMount"> {
    /**
     * The kind of dropdown item to render.
     */
    kind: "sub";
    /**
     * The node to render in the dropdown sub trigger.
     */
    children: ReactNode;
    /**
     * The items to render in the dropdown.
     */
    items: (DropdownDefaultItemEntry | DropdownCheckboxItemEntry | DropdownRadioGroupEntry | DropdownDividerItemEntry | (Omit<DropdownSectionEntry, "items"> & {
        items: (DropdownDefaultItemEntry | DropdownCheckboxItemEntry | DropdownDividerItemEntry)[];
    }))[];
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        DropdownSubTrigger?: NativeElementAttributes<"li", typeof DropdownSubTrigger>;
        DropdownSubContent?: NativeElementAttributes<"menu", typeof DropdownSubContent>;
    };
}
interface DropdownSectionEntry extends Omit<MenuSectionEntry, "items" | "attributes"> {
    /**
     * The items to render in the section.
     */
    items: (DropdownDefaultItemEntry | DropdownCheckboxItemEntry | DropdownSubSection | DropdownDividerItemEntry)[];
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        DropdownSection?: NativeElementAttributes<"div", typeof DropdownSection>;
        DropdownHeading?: NativeElementAttributes<"div", typeof DropdownHeading>;
    };
}
type DropdownEntry = DropdownDefaultItemEntry | DropdownCheckboxItemEntry | DropdownRadioGroupEntry | DropdownSubSection | DropdownSectionEntry | DropdownDividerItemEntry;
interface DropdownProps extends PropsWithChildren<Pick<DropdownRootProps, "open" | "defaultOpen" | "modal" | "onOpenChange" | "size"> & Pick<DropdownContentProps, "density" | "portal" | "portalContainer" | "onPointerDownOutside" | "onInteractOutside" | "onEscapeKeyDown" | "align" | "side" | "onCloseAutoFocus" | "forceMount"> & Pick<DropdownTriggerProps, "asChild" | "showChevron"> & NativeElementAttributes<"button", typeof DropdownTrigger>> {
    /**
     * Render a custom link component - useful if your framework has a custom link component i.e. Next.js Link.
     * @example
     * ```tsx
     * <Dropdown renderLink={(item) => <Link href={item.href}>{item.children}</Link>} />
     * ```
     */
    renderLink?: (item: DropdownDefaultItemEntry) => ReactNode;
    /**
     * When true, prevents the user from interacting with the dropdown.
     */
    disabled?: boolean;
    /**
     * The alignment of the dropdown content relative to the trigger.
     */
    align?: "start" | "end";
    /**
     * The items to render in the dropdown.
     */
    items: DropdownEntry[];
    /**
     * Callback fired when a dropdown item's checked state changes.
     */
    onItemCheckedChange?: (item: DropdownCheckboxItemEntry, checked: CheckedState) => void;
    /**
     * Callback fired when a dropdown item is selected.
     */
    onItemSelect?: (event: Event, item: DropdownDefaultItemEntry | DropdownCheckboxItemEntry | DropdownRadioItemEntry) => void;
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        DropdownContent?: NativeElementAttributes<"menu", typeof DropdownContent>;
    };
}
/**
 * A simple dropdown displaying a list of actions or operations for a user.
 * @param props - props to be passed to the {@link Dropdown} component
 * @see {@link DropdownProps}
 *
 * @example
 * ```tsx
 * <Dropdown items={myItems}>
 *   Click me
 * </Dropdown>
 * ```
 */
declare const Dropdown: react.ForwardRefExoticComponent<Omit<DropdownProps, "ref"> & react.RefAttributes<HTMLButtonElement>>;

declare const DropdownTestIds: {
    readonly DropdownRoot: "nv-dropdown-root";
    readonly DropdownTrigger: "nv-dropdown-trigger";
    readonly DropdownHeading: "nv-dropdown-heading";
    readonly DropdownItem: "nv-dropdown-item";
    readonly DropdownSection: "nv-dropdown-section";
    readonly DropdownCheckboxItem: "nv-dropdown-checkbox-item";
    readonly DropdownItemIndicator: "nv-dropdown-item-indicator";
    readonly DropdownRadioGroup: "nv-dropdown-radio-group";
    readonly DropdownRadioGroupItem: "nv-dropdown-radio-group-item";
    readonly DropdownSub: "nv-dropdown-sub";
    readonly DropdownContent: "nv-dropdown-content";
    readonly DropdownSubTrigger: "nv-dropdown-sub-trigger";
    readonly DropdownSubContent: "nv-dropdown-sub-content";
    readonly DropdownSeparator: "nv-dropdown-separator";
};

interface DatePickerCalendarDropdownProps extends DropdownProps {
    /**
     * Distinguishes the type of calendar dropdown, either month or year.
     * Necessary for setting the appropriate default properties and behavior.
     */
    kind: "month" | "year";
}
/**
 * A dropdown component specifically designed for month and year selection in the DatePicker calendar.
 * This component sets sensible defaults for usage within the `DatePickerCalendar` component.
 * @param props - props to be passed to the {@link DatePickerCalendarDropdown} component
 * @see {@link DatePickerCalendarDropdownProps}
 *
 * @see {@link Dropdown}
 */
declare const DatePickerCalendarDropdown: react.ForwardRefExoticComponent<Omit<DatePickerCalendarDropdownProps, "ref"> & react.RefAttributes<HTMLButtonElement>>;

interface DatePickerCalendarProps extends Omit<ComponentPropsWithRef<"div">, "children" | "role"> {
    /**
     * Custom function to render the dropdown for month and year selection.
     * Use this to customize the appearance or behavior of the month/year dropdown menus.
     * The props passed to this function use the standard DropdownProps interface.
     */
    renderDropdown?: (props: DatePickerCalendarDropdownProps) => React.JSX.Element;
    /**
     * The visible month in the datepicker calendar when initially rendered. Use when you do not need to control the month of the datepicker calendar.
     * @defaultValue Current month
     */
    defaultMonth?: Date;
    /**
     * The earliest month that can be selected from in the datepicker calendar.
     */
    startMonth?: Date;
    /**
     * The latest month that can be selected from in the datepicker calendar.
     */
    endMonth?: Date;
    /**
     * The controlled value of the month in the datepicker calendar. Must be used in conjunction with `onMonthChange`.
     * Use this when you need to programmatically control which month is displayed.
     */
    month?: Date;
    /**
     * Event handler called when the month changes through navigation or dropdown selection.
     * Use this to track or respond to month navigation within the calendar.
     */
    onMonthChange?: (month: Date) => void;
}
interface DatePickerCalendarDayProps extends DayButtonProps {
}
/**
 * The calendar interface component that displays the month view, navigation controls, and date selection interface.
 * Automatically adapts its layout and behavior based on the DatePickerRoot context (single vs range mode).
 * Includes navigation buttons, month/year dropdowns, and a "Today" button for quick navigation.
 * @param props - props to be passed to the {@link DatePickerCalendar} component
 * @see {@link DatePickerCalendarProps}
 *
 * @example
 * ```tsx
 * // Basic calendar within datepicker content
 * <DatePickerRoot>
 *   <DatePickerTrigger />
 *   <DatePickerContent>
 *     <DatePickerCalendar />
 *   </DatePickerContent>
 * </DatePickerRoot>
 * ```
 *
 * @example
 * ```tsx
 * // Calendar with custom month control and day click handler
 * <DatePickerRoot>
 *   <DatePickerTrigger />
 *   <DatePickerContent>
 *     <DatePickerCalendar
 *       month={displayMonth}
 *       onMonthChange={setDisplayMonth}
 *       onDayClick={(day) => console.log('Clicked day:', day)}
 *     />
 *   </DatePickerContent>
 * </DatePickerRoot>
 * ```
 */
declare const DatePickerCalendar: react.ForwardRefExoticComponent<Omit<DatePickerCalendarProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface PopoverContentProps extends PrimitiveProps<"div"> {
    /**
     * Whether the popover content should be rendered in a portal. This is useful when the popover content is a child of a fixed container.
     * @defaultValue true
     */
    portal?: boolean;
    /**
     * The popover to render the modal content in when `portal` is true.
     * @defaultValue document.body
     */
    portalContainer?: Element | DocumentFragment | null;
    /**
     * Event handler called when focus moves to the trigger after closing. It can be prevented by calling `event.preventDefault`.
     */
    onCloseAutoFocus?: (event: Event) => void;
    /**
     * Event handler called when focus moves into the component after opening. It can be prevented by calling `event.preventDefault`.
     */
    onOpenAutoFocus?: (event: Event) => void;
    /**
     * Event handler called when the escape key is down. It can be prevented by calling `event.preventDefault`.
     */
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    /**
     * Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling `event.preventDefault`.
     */
    onPointerDownOutside?: (event: Event) => void;
    /**
     * Event handler called when an interaction event occurs outside the bounds of the component. It can be prevented by calling `event.preventDefault`.
     */
    onInteractOutside?: (event: Event) => void;
    /**
     * The alignment of the popover content relative to the trigger.
     * @defaultValue "center"
     */
    align?: "start" | "end" | "center";
    /**
     * The preferred side of the trigger to render against when open. Will be reversed when collisions occur.
     * @defaultValue "bottom"
     */
    side?: "top" | "bottom" | "left" | "right";
    /**
     * Forces the content to be mounted in the DOM regardless of the `open` state.
     * When true, this overrides the default visibility behavior and keeps content mounted,
     * making it useful for custom animation control with React animation libraries.
     * @defaultValue undefined
     */
    forceMount?: true;
}
/**
 * The component that pops out when the popover is open.
 * @param props - props to be passed to the {@link PopoverContent} component
 * @see {@link PopoverContentProps}
 *
 * @example
 * ```tsx
 * <PopoverRoot>
 * 	...
 * 	<PopoverContent>Some content</PopoverContent>
 * </PopoverRoot>
 * ```
 */
declare const PopoverContent: react.ForwardRefExoticComponent<Omit<PopoverContentProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface PopoverRootProps extends PropsWithChildren {
    /**
     * The open state of the popover when it is initially rendered. Use when you do not need to control its open state.
     */
    defaultOpen?: boolean;
    /**
     * The controlled open state of the popover. Must be used in conjunction with `onOpenChange`.
     */
    open?: boolean;
    /**
     * Event handler called when the open state of the popover changes.
     */
    onOpenChange?: (open: boolean) => void;
    /**
     * The modality of the popover. When set to true, interaction with outside elements will be disabled and only popover content will be visible to screen readers.
     * Modality is disabled by default to minimize performance impact.
     * @defaultValue false
     */
    modal?: boolean;
}
/**
 * Contains all the parts of a popover.
 * @param props - props to be passed to the {@link PopoverRoot} component
 * @see {@link PopoverRootProps}
 *
 * @example
 * ```tsx
 * <PopoverRoot>
 *  ...
 * </PopoverRoot>
 * ```
 */
declare const PopoverRoot: ({ defaultOpen, open, onOpenChange, modal, children, }: PopoverRootProps) => react_jsx_runtime.JSX.Element;

interface PopoverTriggerProps extends PrimitivePropsWithRef<"button"> {
}
/**
 * The button that toggles the popover. By default, the popover content will position itself against the trigger.
 * @param props - props to be passed to the {@link PopoverTrigger} component
 * @see {@link PopoverTriggerProps}
 *
 * @example
 * ```tsx
 * <PopoverRoot>
 *   <PopoverTrigger>
 *     Open Popover
 *   </PopoverTrigger>
 *   ...
 * </PopoverRoot>
 * ```
 */
declare const PopoverTrigger: react.ForwardRefExoticComponent<Omit<PopoverTriggerProps, "ref"> & react.RefAttributes<HTMLButtonElement>>;

interface PopoverProps extends PropsWithChildren<Pick<PopoverContentProps, "portal" | "portalContainer" | "onPointerDownOutside" | "onInteractOutside" | "onEscapeKeyDown" | "align" | "side" | "onCloseAutoFocus" | "onOpenAutoFocus" | "forceMount">>, NativeElementAttributes<"div", typeof PopoverContent>, Pick<PopoverRootProps, "open" | "defaultOpen" | "onOpenChange" | "modal"> {
    /**
     * When true, prevents the user from interacting with the popover.
     */
    disabled?: boolean;
    /**
     * The content that displays when the popover is open.
     */
    slotContent: React.ReactNode;
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        PopoverTrigger?: NativeElementAttributes<"button", typeof PopoverTrigger>;
    };
}
/**
 * Displays rich content in a portal, triggered by a button.
 * @param props - props to be passed to the {@link Popover} component
 * @see {@link PopoverProps}
 *
 * @example
 * ```tsx
 * <Popover slotContent={<div>Popover content</div>}>
 *   Click me!
 * </Popover>
 * ```
 */
declare const Popover: react.ForwardRefExoticComponent<Omit<PopoverProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface PopoverAnchorProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * An optional element to position the popover content against. If this part is not used, the content will position alongside the popover trigger.
 * @param props - props to be passed to the {@link PopoverAnchor} component
 * @see {@link PopoverAnchorProps}
 *
 * @example
 * ```tsx
 * <PopoverRoot>
 * 	<PopoverTrigger>
 * 		Open Popover
 * 	</PopoverTrigger>
 * 	<PopoverAnchor>
 * 		Popover content attaches to this element
 * 	</PopoverAnchor>
 * 	<PopoverContent>
 * 		Some content
 * 	</PopoverContent>
 * </PopoverRoot>
 * ```
 */
declare const PopoverAnchor: react.ForwardRefExoticComponent<Omit<PopoverAnchorProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare const PopoverTestIds: {
    readonly PopoverRoot: "nv-popover-root";
    readonly PopoverTrigger: "nv-popover-trigger";
    readonly PopoverAnchor: "nv-popover-anchor";
    readonly PopoverContent: "nv-popover-content";
};

interface DatePickerContentProps extends PopoverContentProps {
    /**
     * Whether the datepicker content should be rendered in a portal. This is useful when the datepicker content is a child of a fixed container.
     * When false, the content will be rendered inline which may cause z-index or overflow issues.
     * @defaultValue true
     */
    portal?: boolean;
    /**
     * The container element to render the datepicker content in when `portal` is true.
     * Useful for controlling the stacking context or when working within specific DOM boundaries.
     * @defaultValue document.body
     */
    portalContainer?: Element | DocumentFragment | null;
    /**
     * Event handler called when focus moves to the trigger after closing. It can be prevented by calling `event.preventDefault`.
     * Use this to control focus behavior when the datepicker closes.
     */
    onCloseAutoFocus?: (event: Event) => void;
    /**
     * Event handler called when the escape key is down. It can be prevented by calling `event.preventDefault`.
     * Use this to override the default behavior of closing the datepicker on escape.
     */
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    /**
     * Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling `event.preventDefault`.
     * Use this to prevent the datepicker from closing when clicking outside.
     */
    onPointerDownOutside?: (event: Event) => void;
    /**
     * Event handler called when an interaction event occurs outside the bounds of the component. It can be prevented by calling `event.preventDefault`.
     * This includes focus, pointer, and other interaction events outside the datepicker.
     */
    onInteractOutside?: (event: Event) => void;
    /**
     * The alignment of the datepicker content relative to the trigger.
     * - "start": Aligns to the start edge of the trigger
     * - "center": Centers relative to the trigger
     * - "end": Aligns to the end edge of the trigger
     * @defaultValue "start"
     */
    align?: "start" | "end" | "center";
    /**
     * The preferred side of the trigger to render against when open. Will be reversed when collisions occur.
     * @defaultValue "bottom"
     */
    side?: "top" | "bottom" | "left" | "right";
    /**
     * Forces the content to be mounted in the DOM regardless of the `open` state.
     * When true, this overrides the default visibility behavior and keeps content mounted,
     * making it useful for custom animation control with React animation libraries.
     * @defaultValue undefined
     */
    forceMount?: true;
}
/**
 * Describe DatePickerContent here
 * @param props - props to be passed to the {@link DatePickerContent} component
 * @see {@link DatePickerContentProps}
 *
 * @example
 * ```tsx
 * <DatePickerContent />
 * ```
 */
declare const DatePickerContent: react.ForwardRefExoticComponent<Omit<DatePickerContentProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface DatePickerInputProps extends Omit<ComponentPropsWithRef<"input">, "value" | "defaultValue" | "disabled" | "readOnly" | "min" | "max" | "size" | "placeholder" | "type"> {
}
/**
 * A low-level input component for manual date entry with automatic parsing and formatting.
 * Handles text input, validates dates on blur, and manages the display format according to the DatePickerRoot context.
 * This component is used internally by DatePickerTrigger and DatePickerRangeTriggerField.
 * @param props - props to be passed to the {@link DatePickerInput} component
 * @see {@link DatePickerInputProps}
 *
 * @example
 * ```tsx
 * // Basic date input within a DatePickerRoot context
 * <DatePickerInput />
 * ```
 *
 * @example
 * ```tsx
 * // Input with custom formatting set at root level
 * <DatePickerRoot placeholder="Enter your birthday">
 *   <DatePickerInput />
 * </DatePickerRoot>
 * ```
 */
declare const DatePickerInput: react.ForwardRefExoticComponent<Omit<DatePickerInputProps, "ref"> & react.RefAttributes<HTMLInputElement>>;

interface DatePickerRangeTriggerProps extends Omit<ComponentPropsWithRef<"div">, "value" | "defaultValue" | "disabled" | "readOnly"> {
}
/**
 * The trigger component for date range selection that visually combines two input fields (from/to) and opens the calendar popup on interaction.
 * This component serves as the container for {@link DatePickerRangeTriggerField} components and handles opening the calendar when clicked or focused.
 * @param props - props to be passed to the {@link DatePickerRangeTrigger} component
 * @see {@link DatePickerRangeTriggerProps}
 *
 * @example
 * ```tsx
 * // Basic range trigger with two fields
 * <DatePickerRoot kind="range">
 *   <DatePickerRangeTrigger>
 *     <DatePickerRangeTriggerField field="from" />
 *     <DatePickerRangeTriggerField field="to" />
 *   </DatePickerRangeTrigger>
 *   <DatePickerContent>
 *     <DatePickerCalendar />
 *   </DatePickerContent>
 * </DatePickerRoot>
 * ```
 *
 * @example
 * ```tsx
 * // Range trigger with custom placeholder set at root level
 * <DatePickerRoot kind="range" placeholder="Select date range">
 *   <DatePickerRangeTrigger>
 *     <DatePickerRangeTriggerField field="from" />
 *     <DatePickerRangeTriggerField field="to" />
 *   </DatePickerRangeTrigger>
 *   <DatePickerContent>
 *     <DatePickerCalendar />
 *   </DatePickerContent>
 * </DatePickerRoot>
 * ```
 */
declare const DatePickerRangeTrigger: react.ForwardRefExoticComponent<Omit<DatePickerRangeTriggerProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface DatePickerRangeTriggerFieldProps extends Omit<ComponentPropsWithRef<"div">, "value" | "defaultValue" | "disabled" | "readOnly" | "min" | "max" | "size" | "placeholder"> {
    /**
     * Identifies which field of the date range this input represents.
     * - "from": The start date of the range (displays calendar icon)
     * - "to": The end date of the range (displays expand/collapse icon)
     */
    field: "to" | "from";
}
/**
 * A wrapper component for individual input fields within a date range picker.
 * The "from" field displays a calendar icon, while the "to" field shows an expand/collapse indicator.
 * The actual input field is rendered separately and passed as children.
 * @param props - props to be passed to the {@link DatePickerRangeTriggerField} component
 * @see {@link DatePickerRangeTriggerFieldProps}
 *
 * @example
 * ```tsx
 * // Start date field with calendar icon
 * <DatePickerRangeTriggerField field="from">
 *   <DatePickerInput />
 * </DatePickerRangeTriggerField>
 * ```
 *
 * @example
 * ```tsx
 * // End date field with expand icon
 * <DatePickerRangeTriggerField field="to">
 *   <DatePickerInput />
 * </DatePickerRangeTriggerField>
 * ```
 */
declare const DatePickerRangeTriggerField: react.ForwardRefExoticComponent<Omit<DatePickerRangeTriggerFieldProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

/**
 * DatePickerType describes the type of datepicker.
 * It can be a single date or a date range.
 */
type DatePickerType = "single" | "range";
/**
 * Helper type to determine the value type based on DatePickerType.
 */
type ValueForType<T extends DatePickerType> = T extends "single" ? Date | undefined : T extends "range" ? DateRange | undefined : never;
/**
 * Helper type to determine the placeholder type based on DatePickerType.
 * For single mode, it's a simple string. For range mode, it can be a string or an object with from/to properties.
 */
type PlaceholderForType<T extends DatePickerType> = T extends "single" ? string | undefined : T extends "range" ? string | {
    from?: string;
    to?: string;
} | undefined : never;

interface DatePickerRootProps<T extends DatePickerType = "single"> extends PopoverRootProps, Pick<PolymorphicInputProps, "disabled" | "readOnly" | "size" | "status" | "dismissible"> {
    /**
     * The date format string using `date-fns` format syntax. Used to format the date displayed in the input field and as the default placeholder text.
     * When `formatFn` is provided, this prop is ignored in favor of the custom formatting function.
     * @see {@link https://date-fns.org/v2.29.3/docs/format}
     * @defaultValue "M/d/yyyy"
     * @example "MM/dd/yyyy", "dd-MM-yyyy", "yyyy-MM-dd"
     */
    format?: string;
    /**
     * Custom formatting function for displaying dates in the input field.
     * When provided, this takes precedence over the `format` prop.
     * It's recommended to set a relevant `placeholder` when supplying a custom format function.
     * @param date - The date to format
     * @returns The formatted date string
     * @example
     * ```ts
     * (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
     * ```
     */
    formatFn?: (date: Date) => string;
    /**
     * The open state of the datepicker when it is initially rendered. Use when you do not need to control its open state.
     * @defaultValue false
     */
    defaultOpen?: boolean;
    /**
     * The controlled open state of the datepicker. Must be used in conjunction with `onOpenChange`.
     */
    open?: boolean;
    /**
     * Event handler called when the open state of the datepicker changes.
     */
    onOpenChange?: (open: boolean) => void;
    /**
     * The modality of the datepicker. When set to true, interaction with outside elements will be disabled and only datepicker content will be visible to screen readers.
     * Modality is disabled by default to minimize performance impact.
     * @defaultValue false
     */
    modal?: boolean;
    /**
     * The value of the datepicker when initially rendered. Use when you do not need to control the state of the datepicker.
     * For single date pickers, provide a Date object. For range pickers, provide a DateRange object with `from` and/or `to` properties.
     */
    defaultValue?: ValueForType<T>;
    /**
     * The controlled value of the datepicker. Must be used in conjunction with `onValueChange`.
     * For single date pickers, provide a Date object. For range pickers, provide a DateRange object with `from` and/or `to` properties.
     * @example
     * ```tsx
     * // For kind="single" (default)
     * <DatePickerRoot value={new Date()} />
     * // For kind="range"
     * <DatePickerRoot kind="range" value={{ from: new Date(), to: new Date() }} />
     * ```
     */
    value?: ValueForType<T>;
    /**
     * Event handler called when the value of the datepicker changes.
     * The `value` parameter is typed according to the `kind` prop - Date for single mode, DateRange for range mode.
     */
    onValueChange?: (value?: ValueForType<T>) => void;
    /**
     * The kind of datepicker. This determines the type of the `value` and `onValueChange` props.
     * - "single": Allows selection of a single date
     * - "range": Allows selection of a date range with start and end dates
     * @defaultValue "single"
     */
    kind?: T;
    /**
     * Minimum number of days in a date range. When set, users cannot select a range shorter than this value.
     * @remarks This prop is only available for "range" kind.
     */
    min?: T extends "single" ? never : number;
    /**
     * Maximum number of days in a date range. When set, users cannot select a range longer than this value.
     * @remarks This prop is only available for "range" kind.
     */
    max?: T extends "single" ? never : number;
    /**
     * When true, excludes disabled dates from the selected range. This will prevent the user from selecting a range that includes disabled dates.
     * @remarks This prop is only available for "range" kind.
     * @defaultValue false
     */
    excludeDisabledDates?: T extends "range" ? boolean : never;
    /**
     * Matcher for disabled dates. This can be a single matcher or an array of matchers.
     * @example
     * ```tsx
     * // Disable all dates
     * <DayPicker disabledMatcher />
     *
     * // Disable a specific date
     * <DayPicker disabledMatcher={new Date(2023, 9, 1)} />
     *
     * // Disable an array of dates
     * <DayPicker disabledMatcher={[new Date(2023, 9, 1), new Date(2023, 9, 2)]} />
     *
     * // Disable a range of dates
     * <DayPicker disabledMatcher={{ from: new Date(2023, 9, 1), to: new Date(2023, 9, 5) }} />
     *
     * // Disable specific days of the week
     * <DayPicker disabledMatcher={{ dayOfWeek: [0, 6] }} /> // disable weekends
     *
     * // Disable dates before a specific date
     * <DayPicker disabledMatcher={{ before: new Date(2023, 9, 1) }} />
     *
     * // Disable dates after a specific date
     * <DayPicker disabledMatcher={{ after: new Date(2023, 9, 5) }} />
     *
     * // Disable dates between two dates
     * <DayPicker disabledMatcher={{ before: new Date(2023, 9, 1), after: new Date(2023, 9, 5) }} />
     * ```
     */
    disabledMatcher?: Matcher | Matcher[];
    /**
     * The placeholder text for the date input fields. When a custom `formatFn` is provided,
     * this should be set to provide clear guidance to users about the expected format.
     * For range pickers, can be a string (applied to both fields) or an object with `from` and `to` properties.
     * @defaultValue The format string (e.g., "MM/dd/yyyy") or empty when using custom formatFn
     * @example
     * ```tsx
     * // Single picker
     * <DatePickerRoot placeholder="Select date" />
     *
     * // Range picker with same placeholder for both fields
     * <DatePickerRoot kind="range" placeholder="MM/dd/yyyy" />
     *
     * // Range picker with different placeholders
     * <DatePickerRoot kind="range" placeholder={{ from: "Start date", to: "End date" }} />
     * ```
     */
    placeholder?: PlaceholderForType<T>;
    /**
     * The time zone (IANA or UTC offset) to use.
     * @see — https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
     * @example
     * ```tsx
     * <DatePickerRoot timeZone="America/New_York" />
     * <DatePickerRoot timeZone="-05:00" />
     * ```
     *
     */
    timeZone?: string;
}
/**
 * The root container for the DatePicker component that manages its state and provides context to child components.
 * This component handles the core date picker logic including open/close state, value management, and validation.
 * It leverages a generic type based on the `kind` prop to ensure type safety for `value` and `onValueChange`.
 * @param props - props to be passed to the {@link DatePickerRoot} component
 * @see {@link DatePickerRootProps}
 *
 * @example
 * ```tsx
 * // Single date picker with controlled state
 * <DatePickerRoot
 *   kind="single"
 *   open={open}
 *   onOpenChange={setOpen}
 *   value={selectedDate}
 *   onValueChange={setSelectedDate}
 * >
 *   <DatePickerTrigger />
 *   <DatePickerContent>
 *     <DatePickerCalendar />
 *   </DatePickerContent>
 * </DatePickerRoot>
 * ```
 *
 * @example
 * ```tsx
 * // Date range picker with constraints and custom placeholder
 * <DatePickerRoot
 *   kind="range"
 *   value={dateRange}
 *   onValueChange={setDateRange}
 *   min={3}
 *   max={30}
 *   excludeDisabledDates
 *   placeholder="Select date range"
 * >
 *   <DatePickerRangeTrigger>
 *     <DatePickerRangeTriggerField field="from" />
 *     <DatePickerRangeTriggerField field="to" />
 *   </DatePickerRangeTrigger>
 *   <DatePickerContent>
 *     <DatePickerCalendar />
 *   </DatePickerContent>
 * </DatePickerRoot>
 * ```
 */
declare const DatePickerRoot: <T extends DatePickerType = "single">({ defaultValue, value, onValueChange, kind, format, formatFn, defaultOpen, open, onOpenChange, min, max, disabledMatcher, excludeDisabledDates, disabled, readOnly, size, status, placeholder, dismissible, timeZone, ...props }: DatePickerRootProps<T>) => react_jsx_runtime.JSX.Element;

interface DatePickerTriggerProps extends Omit<ComponentPropsWithRef<"div">, "value" | "defaultValue" | "disabled" | "readOnly" | "min" | "max" | "size" | "placeholder"> {
}
/**
 * The trigger wrapper component for single date selection that opens the calendar popup on interaction.
 * Features a calendar icon and expand/collapse indicator, and handles both click and focus events to open the calendar.
 * The actual input field is rendered separately and passed as children.
 * @param props - props to be passed to the {@link DatePickerTrigger} component
 * @see {@link DatePickerTriggerProps}
 *
 * @example
 * ```tsx
 * // Basic single date trigger
 * <DatePickerRoot kind="single">
 *   <DatePickerTrigger>
 *     <DatePickerInput />
 *   </DatePickerTrigger>
 *   <DatePickerContent>
 *     <DatePickerCalendar />
 *   </DatePickerContent>
 * </DatePickerRoot>
 * ```
 */
declare const DatePickerTrigger: react.ForwardRefExoticComponent<Omit<DatePickerTriggerProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface BaseDatePickerProps extends Pick<DatePickerRootProps, "format" | "formatFn" | "disabledMatcher" | "disabled" | "dismissible" | "modal" | "readOnly" | "size" | "defaultOpen" | "open" | "onOpenChange" | "timeZone">, Pick<DatePickerContentProps, "portal" | "portalContainer" | "onPointerDownOutside" | "onInteractOutside" | "onEscapeKeyDown" | "align" | "side" | "onCloseAutoFocus" | "forceMount">, Pick<DatePickerCalendarProps, "defaultMonth" | "startMonth" | "endMonth" | "month" | "onMonthChange" | "renderDropdown"> {
    /**
     * The status of the datepicker.
     */
    status?: "success" | "error";
}
interface SingleDatePickerProps extends BaseDatePickerProps, Omit<DatePickerTriggerProps, "children"> {
    /**
     * The kind of datepicker.
     */
    kind?: "single";
    /**
     * The initial value.
     */
    defaultValue?: Date;
    /**
     * The controlled value.
     */
    value?: Date;
    /**
     * Event handler called when the value changes.
     */
    onValueChange?: (value?: Date) => void;
    /**
     * The placeholder text.
     */
    placeholder?: string;
    /**
     * The native HTML attributes to apply to internal components.
     */
    attributes?: {
        DatePickerContent?: NativeElementAttributes<"div", typeof DatePickerContent>;
        DatePickerCalendar?: NativeElementAttributes<"div", typeof DatePickerCalendar>;
        DatePickerInput?: NativeElementAttributes<"input", typeof DatePickerInput>;
    };
}
interface RangeDatePickerProps extends BaseDatePickerProps, Omit<DatePickerRangeTriggerProps, "children"> {
    /**
     * The kind of datepicker.
     */
    kind: "range";
    /**
     * The initial value.
     */
    defaultValue?: DateRange;
    /**
     * The controlled value.
     */
    value?: DateRange;
    /**
     * Event handler called when the value changes.
     */
    onValueChange?: (value?: DateRange) => void;
    /**
     * The placeholder text.
     */
    placeholder?: string | {
        from?: string;
        to?: string;
    };
    /**
     * Minimum number of days in a range.
     */
    min?: number;
    /**
     * Maximum number of days in a range.
     */
    max?: number;
    /**
     * When true, excludes disabled dates from range.
     */
    excludeDisabledDates?: boolean;
    /**
     * The native HTML attributes to apply to internal components.
     */
    attributes?: {
        DatePickerContent?: NativeElementAttributes<"div", typeof DatePickerContent>;
        DatePickerCalendar?: NativeElementAttributes<"div", typeof DatePickerCalendar>;
        DatePickerInputFrom?: NativeElementAttributes<"input", typeof DatePickerInput>;
        DatePickerInputTo?: NativeElementAttributes<"input", typeof DatePickerInput>;
        DatePickerRangeTriggerFieldFrom?: NativeElementAttributes<"div", typeof DatePickerRangeTriggerField>;
        DatePickerRangeTriggerFieldTo?: NativeElementAttributes<"div", typeof DatePickerRangeTriggerField>;
    };
}
/**
 * A complete date picker component with input field(s) and calendar popup.
 * Supports both single date selection and date range selection modes.
 * The component handles manual date entry through input fields and provides a calendar interface for visual date selection.
 * @param props - props to be passed to the {@link DatePicker} component
 * @see {@link DatePickerProps}
 *
 * @example
 * ```tsx
 * // Single date picker with default settings
 * <DatePicker />
 * ```
 *
 * @example
 * ```tsx
 * // Date range picker with constraints
 * <DatePicker
 *   kind="range"
 *   min={3}
 *   max={30}
 *   placeholder="Select date range"
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Controlled single date picker with custom formatting
 * <DatePicker
 *   value={selectedDate}
 *   onValueChange={setSelectedDate}
 *   formatFn={(date) => date.toLocaleDateString('en-US', {
 *     weekday: 'short',
 *     month: 'short',
 *     day: 'numeric'
 *   })}
 *   status="success"
 *   size="large"
 * />
 * ```
 */
declare const DatePicker: react.ForwardRefExoticComponent<(Omit<SingleDatePickerProps, "ref"> | Omit<RangeDatePickerProps, "ref">) & react.RefAttributes<HTMLDivElement>>;

declare const DatePickerTestIds: {
    readonly DatePickerRoot: "nv-date-picker-root";
    readonly DatePickerTrigger: "nv-date-picker-trigger";
    readonly DatePickerContent: "nv-date-picker-content";
    readonly DatePickerCalendar: "nv-date-picker-calendar";
    readonly DatePickerCalendarDropdown: "nv-date-picker-calendar-dropdown";
    readonly DatePickerCalendarDay: "nv-date-picker-calendar-day";
    readonly DatePickerCalendarNextButton: "nv-date-picker-calendar-next-button";
    readonly DatePickerCalendarPrevButton: "nv-date-picker-calendar-prev-button";
    readonly DatePickerCalendarCancelButton: "nv-date-picker-calendar-cancel-button";
    readonly DatePickerCalendarApplyButton: "nv-date-picker-calendar-apply-button";
    readonly DatePickerCalendarTodayButton: "nv-date-picker-calendar-today-button";
    readonly DatePickerRangeTrigger: "nv-date-picker-range-trigger";
    readonly DatePickerRangeTriggerField: "nv-date-picker-range-trigger-field";
    readonly DatePickerInput: "nv-date-picker-input";
};
declare const DEFAULT_DATE_PICKER_FORMAT = "M/d/yyyy";

declare const flex: (props?: ({
    align?: "center" | "end" | "start" | "baseline" | "stretch" | null | undefined;
    direction?: "col" | "row" | "row-reverse" | "col-reverse" | null | undefined;
    justify?: "center" | "end" | "start" | "stretch" | "normal" | "between" | "around" | "evenly" | null | undefined;
    wrap?: "wrap" | "nowrap" | "wrap-reverse" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type FlexVariantProps = VariantProps<typeof flex>;
interface FlexProps extends react__default.ComponentPropsWithRef<"div">, PrimitiveComponentProps {
    /**
     * Sets the alignment of child items along the block axis.
     * See https://developer.mozilla.org/en-US/docs/Web/CSS/align-items for more.
     * @defaultValue "stretch"
     */
    align?: FlexVariantProps["align"];
    /**
     * Sets the direction in which child items are placed in the flex container.
     * See https://developer.mozilla.org/en-US/docs/Web/CSS/flex-direction for more.
     * @defaultValue "row"
     */
    direction?: FlexVariantProps["direction"];
    /**
     * Sets distribution of space between and around content items along the main axis.
     * See https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content for more.
     * @defaultValue "start"
     */
    justify?: FlexVariantProps["justify"];
    /**
     * Sets the wrapping behavior of the flex container.
     * See https://developer.mozilla.org/en-US/docs/Web/CSS/flex-wrap for more.
     * @defaultValue "nowrap"
     */
    wrap?: FlexVariantProps["wrap"];
}
/**
 * A primitive flex component.
 * @param props - props to be passed to the {@link Flex} component
 * @see {@link FlexProps}
 * @example
 * ```tsx
 * <Flex>
 *  <div>content A</div>
 *  <div>content B</div>
 * </Flex>
 * ```
 */
declare const Flex: react__default.ForwardRefExoticComponent<Omit<FlexProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

interface TooltipContentProps extends SlottablePropsWithRef<"div"> {
    /**
     * The preferred side of the trigger to render the tooltip.
     * @defaultValue "top"
     */
    side?: "top" | "right" | "bottom" | "left";
    /**
     * The preferred alignment against the trigger. May change when collisions occur.
     * @defaultValue "center"
     */
    align?: "center" | "start" | "end";
    /**
     * Whether the dropdown content should be rendered in a portal. This is useful when the dropdown content is a child of a fixed container.
     * @defaultValue true
     */
    portal?: boolean;
    /**
     * The dropdown to render the modal content in when `portal` is true.
     * @defaultValue document.body
     */
    portalContainer?: Element | DocumentFragment | null;
    /**
     * Event handler called when the escape key is down. It can be prevented by calling `event.preventDefault`.
     */
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    /**
     * Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling `event.preventDefault`.
     */
    onPointerDownOutside?: (event: Event) => void;
    /**
     * Forces the content to be mounted in the DOM regardless of the `open` state.
     * When true, this overrides the default visibility behavior and keeps content mounted,
     * making it useful for custom animation control with React animation libraries.
     * @defaultValue undefined
     */
    forceMount?: true;
    /**
     * Whether to show the arrow. We recommend not enabling this to align with the design system.
     * @defaultValue false
     */
    showArrow?: boolean;
}
/**
 * The content of a tooltip.
 * @param props - props to be passed to the {@link TooltipContent} component
 * @see {@link TooltipContentProps}
 */
declare const TooltipContent: react.ForwardRefExoticComponent<Omit<TooltipContentProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface TooltipProviderProps extends PropsWithChildren {
    /**
     * The duration from when the mouse enters a tooltip trigger until the tooltip opens.
     * @defaultValue 100
     */
    openDelayDuration?: number;
    /**
     * How much time a user has to enter another trigger without incurring a delay again.
     * @defaultValue 300
     */
    skipDelayDuration?: number;
}
/**
 * The context is to ensure that every tooltip has a provider, but is not being doubled
 */
declare const TooltipContext: react.Context<boolean>;
/**
 * Wraps your app to provide global functionality to your tooltips. This enables the ability to
 * remove the hover delay when moving between different tooltips
 * @param props - props to be passed to the {@link TooltipProvider} component
 * @see {@link TooltipProviderProps}
 */
declare const TooltipProvider: ({ openDelayDuration, skipDelayDuration, children, }: TooltipProviderProps) => react_jsx_runtime.JSX.Element;

interface TooltipRootProps extends PropsWithChildren {
    /**
     * The open state of the tooltip when it is initially rendered. Use when you do not need to control its open state.
     */
    defaultOpen?: boolean;
    /**
     * The controlled open state of the tooltip. Must be used in conjunction with `onOpenChange`.
     */
    open?: boolean;
    /**
     * Event handler called when the open state of the tooltip changes.
     */
    onOpenChange?: (open: boolean) => void;
    /**
     * Override the duration given to the `Provider` to customise the open delay for a specific tooltip.
     * @defaultValue 700
     */
    openDelayDuration?: number;
}
/**
 * Contains all the parts of a Tooltip.
 * @param props - props to be passed to the {@link TooltipRoot} component
 * @see {@link TooltipRootProps}
 */
declare const TooltipRoot: ({ children, openDelayDuration, defaultOpen, onOpenChange, open, }: TooltipRootProps) => react_jsx_runtime.JSX.Element;

interface TooltipTriggerProps extends PrimitivePropsWithRef<"button"> {
}
/**
 * The button that toggles the tooltip
 * @param props - props to be passed to the {@link TooltipTrigger} component
 * @see {@link TooltipTriggerProps}
 */
declare const TooltipTrigger: react.ForwardRefExoticComponent<Omit<TooltipTriggerProps, "ref"> & react.RefAttributes<HTMLButtonElement>>;

interface TooltipProps extends PropsWithChildren<TooltipRootProps & Pick<TooltipProviderProps, "openDelayDuration"> & Pick<TooltipContentProps, "side" | "align" | "portal" | "portalContainer" | "onEscapeKeyDown" | "onPointerDownOutside" | "showArrow"> & NativeElementAttributes<"div", typeof TooltipContent>> {
    /**
     * The content of the tooltip.
     */
    slotContent?: ReactNode;
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        TooltipTrigger?: NativeElementAttributes<"button", typeof TooltipTrigger>;
    };
}
/**
 * A tooltip displays additional information when users hover or focus on an element.
 * @param props - props to be passed to the {@link Tooltip} component
 * @see {@link TooltipProps}
 *
 * @example
 * ```tsx
 * <Tooltip slotContent="This is some helpful text">
 *   <CommonHelpCircle />
 * </Tooltip>
 * ```
 */
declare const Tooltip: react.ForwardRefExoticComponent<Omit<TooltipProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface FormFieldContentGroupProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * A component that contains the control group and input elements.
 * @param props - props to be passed to the {@link FormFieldContentGroup} component
 * @see {@link FormFieldContentGroupProps}
 *
 * @example
 * ```tsx
 * <FormFieldContentGroup>
 *   <FormFieldControlGroup />
 * </FormFieldContentGroup>
 * ```
 */
declare const FormFieldContentGroup: react.ForwardRefExoticComponent<Omit<FormFieldContentGroupProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface FormFieldControlGroupProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * A component that contains the form input element.
 * @param props - props to be passed to the {@link FormFieldControlGroup} component
 * @see {@link FormFieldControlGroupProps}
 *
 * @example
 * ```tsx
 * <FormFieldControlGroup>
 *   <TextInput />
 * </FormFieldControlGroup>
 * ```
 */
declare const FormFieldControlGroup: react.ForwardRefExoticComponent<Omit<FormFieldControlGroupProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare const formFieldHelper: (props?: ({
    kind?: "error" | "success" | "info" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type FormFieldHelperVariantProps = VariantProps<typeof formFieldHelper>;
interface FormFieldHelperProps extends PrimitivePropsWithRef<"div"> {
    /**
     * The kind of the form field helper. Determines the visual state of the helper text.
     */
    kind?: FormFieldHelperVariantProps["kind"];
}
/**
 * A component that displays help text, error message, or success message for a form field.
 * @param props - props to be passed to the {@link FormFieldHelper} component
 * @see {@link FormFieldHelperProps}
 *
 * @example
 * ```tsx
 * <FormFieldHelper>We'll never share your email with anyone else.</FormFieldHelper>
 * <FormFieldHelper kind="error">Please enter a valid email address.</FormFieldHelper>
 * <FormFieldHelper kind="success">Looks good!</FormFieldHelper>
 * ```
 */
declare const FormFieldHelper: react.ForwardRefExoticComponent<Omit<FormFieldHelperProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface FormFieldLabelGroupProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * A component that contains the label and info icon for a form field.
 * @param props - props to be passed to the {@link FormFieldLabelGroup} component
 * @see {@link FormFieldLabelGroupProps}
 *
 * @example
 * ```tsx
 * <FormFieldLabelGroup>
 *   <Label>Email Address</Label>
 *   <InfoIcon />
 * </FormFieldLabelGroup>
 * ```
 */
declare const FormFieldLabelGroup: react.ForwardRefExoticComponent<Omit<FormFieldLabelGroupProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare const formFieldRoot: (props?: ({
    labelPosition?: "left" | "top" | null | undefined;
    required?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type FormFieldRootVariantProps = VariantProps<typeof formFieldRoot>;
interface FormFieldRootProps extends PrimitivePropsWithRef<"div"> {
    /**
     * The position for the form field label and (optional) info icon.
     * @defaultValue "top"
     */
    labelPosition?: FormFieldRootVariantProps["labelPosition"];
    /**
     * When true, indicates that the user is required to fill out this field. Used to determine whether or not the asterisk is shown next to the label.
     */
    required?: boolean;
}
/**
 * Root component for the FormField which handles the overall layout and structure.
 * @param props - props to be passed to the {@link FormFieldRoot} component
 * @see {@link FormFieldRootProps}
 *
 * @example
 * ```tsx
 * <FormFieldRoot>
 *   {/* Form field content *\/}
 * </FormFieldRoot>
 * ```
 */
declare const FormFieldRoot: react.ForwardRefExoticComponent<Omit<FormFieldRootProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface FormFieldContextArgs {
    /**
     * Name of the element. Used to identify fields in form submits.
     */
    name?: string;
    /**
     * The status of the form field. Determines the visual state of the field.
     */
    status?: "success" | "error";
    /**
     * The ID of the form field (for connecting label and input). The value of this attribute must be unique.
     */
    id: string;
    /**
     * The aria-describedby value for the form control. Identifies the element that describes the element on which the attribute is set.
     * You can customize this by passing an ID to the `FormFieldHelper` element via the attributes API.
     * @example
     * ```tsx
     * <FormField
     *   attributes={{
     *     FormFieldHelper: { id: "helper-id" },
     *   }}
     * >
     *   {(args) => (
     *     <TextInput {...args} />
     *   )}
     * </FormField>
     * ```
     */
    "aria-describedby"?: string;
    /**
     * The aria-labelledby value for the form control. Identifies the element that labels the element it is applied to.
     * You can customize this by passing an ID to the `Label` element via the attributes API.
     * @example
     * ```tsx
     * <FormField
     *   attributes={{
     *     Label: { id: "label-id" },
     *   }}
     * >
     *   {(args) => (
     *     <TextInput {...args} />
     *   )}
     * </FormField>
     * ```
     */
    "aria-labelledby"?: string;
    /**
     * The aria-details value for the form control. Identifies the element that provide additional information related to the object.
     * You can customize this by passing an ID to the `TooltipTrigger` element via the attributes API.
     * @example
     * ```tsx
     * <FormField
     *   attributes={{
     *     TooltipTrigger: { id: "details-id" },
     *   }}
     * >
     *   {(args) => (
     *     <TextInput {...args} />
     *   )}
     * </FormField>
     * ```
     */
    "aria-details"?: string;
    /**
     * When true, indicates that the user is required to fill out this field. Used to determine whether or not the asterisk is shown next to the label.
     */
    required?: boolean;
}
type FormFieldOrientation = "vertical" | "horizontal";
interface FormFieldProps extends Omit<PrimitivePropsWithRef<"div">, "children">, Pick<FormFieldRootProps, "labelPosition" | "required"> {
    /**
     * The ID of the form field (for connecting label and input). The value of this attribute must be unique.
     * If not provided, a unique ID will be generated for you.
     */
    id?: string;
    /**
     * The status of the form field. Determines the visual state of the field.
     */
    status?: "success" | "error";
    /**
     * Name of the element. Used to identify fields in form submits.
     */
    name?: string;
    /**
     * The content to render as the label. This is required for accessibility. It's recommended
     */
    slotLabel?: ReactNode;
    /**
     * The content to render inside of the info icon tooltip.
     */
    slotInfo?: ReactNode;
    /**
     * The content to render as the error message. Visible when status is `"error"`.
     */
    slotError?: ReactNode;
    /**
     * The content to render as the success message. Visible when status is `"success"`.
     */
    slotSuccess?: ReactNode;
    /**
     * The content to render as the help message (visible when status is not `"error"` or `"success"`).
     */
    slotHelp?: ReactNode;
    /**
     * The children of the form field. Can be a render function that receives form field context.
     */
    children?: ReactNode | ((args: FormFieldContextArgs) => ReactElement);
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        Label?: NativeElementAttributes<"label", typeof Label>;
        FormFieldLabelGroup?: NativeElementAttributes<"div", typeof FormFieldLabelGroup>;
        FormFieldContentGroup?: NativeElementAttributes<"div", typeof FormFieldContentGroup>;
        FormFieldControlGroup?: NativeElementAttributes<"div", typeof FormFieldControlGroup>;
        FormFieldHelper?: NativeElementAttributes<"div", typeof FormFieldHelper>;
        TooltipTrigger?: NativeElementAttributes<"div", typeof TooltipTrigger>;
        TooltipContent?: NativeElementAttributes<"div", typeof TooltipContent>;
    };
}
/**
 * A component for displaying a form field with label, description, helper text, and validation messages.
 * @param props - props to be passed to the {@link FormField} component
 * @see {@link FormFieldProps}
 *
 * @example
 * ```tsx
 * <FormField
 *   name="email"
 *   slotLabel="Email Address"
 *   slotHelpMessage="We'll never share your email with anyone else."
 *   slotErrorMessage="Please enter a valid email address"
 *   status="error"
 * >
 *   {({id, status}) => <TextInput id={id} status={status} />}
 * </FormField>
 * ```
 */
declare const FormField: react.ForwardRefExoticComponent<Omit<FormFieldProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare const FormFieldTestIds: {
    readonly FormFieldRoot: "nv-form-field-root";
    readonly FormFieldLabel: "nv-form-field-label";
    readonly FormFieldHelper: "nv-form-field-helper";
    readonly FormFieldLabelGroup: "nv-form-field-label-group";
    readonly FormFieldContentGroup: "nv-form-field-content-group";
    readonly FormFieldControlGroup: "nv-form-field-control-group";
};

type Responsive<T extends string | number> = T | null | undefined | {
    base?: T;
    xs?: T;
    sm?: T;
    md?: T;
    lg?: T;
    xl?: T;
    xxl?: T;
};

declare const grid: (props?: ({
    flow?: string | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type GridVariantProps = VariantProps<typeof grid>;
type GridProps = react__default.ComponentPropsWithRef<"div"> & Pick<PrimitiveComponentProps, "asChild" | "gap" | "padding" | "paddingX" | "paddingY" | "paddingTop" | "paddingRight" | "paddingBottom" | "paddingLeft" | "spacing" | "spacingX" | "spacingY" | "spacingTop" | "spacingRight" | "spacingBottom" | "spacingLeft"> & {
    /**
     * Number of grid columns when working with row flow directions.
     */
    cols?: Responsive<number>;
    /**
     * Number of grid rows when working with column flow directions.
     */
    rows?: Responsive<number>;
    /**
     * Grid auto-flow.
     * See https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-flow for more details.
     */
    flow?: Exclude<GridVariantProps["flow"], object>;
};
/**
 * A primitive grid component.
 * @param props - props to be passed to the {@link Grid} component
 * @see {@link GridProps}
 * @example
 * ```tsx
 * <Grid cols={3}>
 * 	<div>Column A</div>
 *  <div>Column B</div>
 *  <div>Column C</div>
 * </Grid>
 * ```
 */
declare const Grid: react__default.ForwardRefExoticComponent<Omit<GridProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

type OneToTwelve = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
type GridItemProps = react__default.ComponentPropsWithRef<"div"> & Pick<PrimitiveComponentProps, "asChild" | "padding" | "paddingX" | "paddingY" | "paddingTop" | "paddingRight" | "paddingBottom" | "paddingLeft" | "spacing" | "spacingX" | "spacingY" | "spacingTop" | "spacingRight" | "spacingBottom" | "spacingLeft"> & {
    cols?: Responsive<OneToTwelve | "full">;
    rows?: Responsive<OneToTwelve | "full">;
    colStart?: Responsive<OneToTwelve | 13 | "auto">;
    colEnd?: Responsive<OneToTwelve | 13 | "auto">;
    rowStart?: Responsive<OneToTwelve | 13 | "auto">;
    rowEnd?: Responsive<OneToTwelve | 13 | "auto">;
};
/**
 * A Grid item.  This component provides control over grid positioning and sizing.
 * For simple grids where you don't need this control, you may opt to use another component instead.
 * @param props - props to be passed to the {@link GridItem} component
 * @see {@link GridItemProps}
 * @example
 * ```tsx
 * <GridItem cols={12}>Content</GridItem>
 * ```
 */
declare const GridItem: react__default.ForwardRefExoticComponent<Omit<GridItemProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

interface HeroBodyProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * The component for the body of a hero. Usually contains a text message
 * for the hero.
 * @param props - props to be passed to the {@link HeroBody} component
 * @see {@link HeroBodyProps}
 * @example
 * ```tsx
 * <HeroBody>
 *   Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
 * </HeroBody>
 * ```
 */
declare const HeroBody: react.ForwardRefExoticComponent<Omit<HeroBodyProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface HeroContentProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * HeroContent is a component that wraps the content of a hero. Inside the content
 * is usually the header, body, and footer of the hero.
 * @param props - props to be passed to the {@link HeroContent} component
 * @see {@link HeroContentProps}
 * @example
 * ```tsx
 * <HeroContent align={props.align}>
 *   <HeroHeader>
 *     <HeroSubheading>Hero Sub Heading</HeroSubheading>
 *     <HeroHeading>Hero Heading</HeroHeading>
 *   </HeroHeader>
 *   <HeroBody>
 *     Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
 *     eiusmod tempor incididunt ut labore et dolore magna aliqua.
 *   </HeroBody>
 *   <HeroFooter>
 *     <div>
 *       <Button>Build</Button>
 *       <Button>Build</Button>
 *     </div>
 *   </HeroFooter>
 * </HeroContent>
 * ```
 */
declare const HeroContent: react.ForwardRefExoticComponent<Omit<HeroContentProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface HeroFooterProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * HeroFooter is a component for actions or information. At the bottom
 * of the hero. This would usually contain a ButtonGroup or other calls to action.
 * @param props - props to be passed to the {@link HeroFooter} component
 * @see {@link HeroFooterProps}
 * @example
 * ```tsx
 * <HeroFooter>
 *   <Button>Explore</Button>
 *   <Button>Build</Button>
 * </HeroFooter>
 * ```
 */
declare const HeroFooter: react.ForwardRefExoticComponent<Omit<HeroFooterProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface HeroHeadingProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * HeroHeading is the main text title of the hero.
 * @param props - props to be passed to the {@link HeroHeading} component
 * @see {@link HeroHeadingProps}
 * @example
 * ```tsx
 * <HeroHeader>
 *   <HeroHeading>Hero Heading</HeroHeading>
 * </HeroHeader>
 * ```
 */
declare const HeroHeading: react.ForwardRefExoticComponent<Omit<HeroHeadingProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface HeroMediaProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * HeroMedia is a wrapper component for the media in the hero.
 * @param props - props to be passed to the {@link HeroMedia} component
 * @see {@link HeroMediaProps}
 * @example
 * ```tsx
 * <HeroMedia />
 * ```
 */
declare const HeroMedia: react.ForwardRefExoticComponent<Omit<HeroMediaProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface HeroRootProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * The root component for the hero. This component wraps all the other components.
 * @param props - props to be passed to the {@link HeroRoot} component
 * @see {@link HeroRootProps}
 * @example
 * ```tsx
 * <HeroRoot>
 *   {children}
 * </HeroRoot>
 * ```
 */
declare const HeroRoot: react.ForwardRefExoticComponent<Omit<HeroRootProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface HeroSubheadingProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * HeroSubheading is the subheading of the hero component.
 * @param props - props to be passed to the {@link HeroSubheading} component
 * @see {@link HeroSubheadingProps}
 * @example
 * ```tsx
 * <HeroSubheading />
 * ```
 */
declare const HeroSubheading: react.ForwardRefExoticComponent<Omit<HeroSubheadingProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface HeroProps extends NativeElementAttributes<"div", typeof HeroRoot> {
    /**
     * The slot for the heading of the component
     */
    slotHeading: React.ReactNode;
    /**
     * The slot for the optional subheading of the component
     */
    slotSubheading?: React.ReactNode;
    /**
     * The slot for the media of the hero component. See documentation for examples on how to use this slot
     * and proper usage of image heights.
     */
    slotMedia?: React.ReactNode;
    /**
     * The slot for the body of the component
     */
    slotBody: React.ReactNode;
    /**
     * The slot for the action area of the hero component
     */
    slotActions?: React.ReactNode;
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        HeroMedia?: NativeElementAttributes<"div", typeof HeroMedia>;
        HeroContent?: NativeElementAttributes<"div", typeof HeroContent>;
        HeroHeading?: NativeElementAttributes<"div", typeof HeroHeading>;
        HeroSubheading?: NativeElementAttributes<"div", typeof HeroSubheading>;
        HeroBody?: NativeElementAttributes<"div", typeof HeroBody>;
        HeroFooter?: NativeElementAttributes<"div", typeof HeroFooter>;
    };
}
/**
 * A hero is a prominent visual element to promote important information with calls to action.
 * @param props - props to be passed to the {@link Hero} component
 * @see {@link HeroProps}
 * @example
 * ```tsx
 * <Hero align="center" />
 * ```
 */
declare const Hero: react.ForwardRefExoticComponent<Omit<HeroProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare const HeroTestIds: {
    readonly HeroRoot: "nv-hero-root";
    readonly HeroMedia: "nv-hero-media";
    readonly HeroContent: "nv-hero-content";
    readonly HeroSubheading: "nv-hero-subheading";
    readonly HeroHeading: "nv-hero-heading";
    readonly HeroBody: "nv-hero-body";
    readonly HeroFooter: "nv-hero-footer";
};

interface HorizontalNavLinkProps extends PrimitivePropsWithRef<"button"> {
    value: string;
}
/**
 * The HorizontalNavLink component serves as a link that activates a specific section
 * within the HorizontalNav interface. It is built on top of the TabsTrigger component,
 * allowing for seamless integration with the tabbed navigation system. This component
 * enables users to switch between different views or sections in a horizontal layout,
 * providing a clear and accessible navigation experience.
 *
 * @param props - props to be passed to the {@link HorizontalNavLink} component
 * @see {@link HorizontalNavLinkProps}
 *
 * @example
 * ```tsx
 * <HorizontalNavLink value="home">
 *   <Anchor href="/" kind="standalone">
 *     Home
 *   </Anchor>
 * </HorizontalNavLink>
 * ```
 */
declare const HorizontalNavLink: react.ForwardRefExoticComponent<Omit<HorizontalNavLinkProps, "ref"> & react.RefAttributes<HTMLButtonElement>>;

interface TabsContentProps extends PrimitivePropsWithRef<"div"> {
    /**
     * A unique value that associates the content with its trigger
     */
    value: string;
}
/**
 * Content that's associated with a TabsTrigger. Shown when its associated trigger is active.
 *
 * @param props - Props for the tab content
 * @see {@link TabsContentProps}
 *
 * @example
 * ```tsx
 * <TabsContent value="tab1">
 *   Content for tab 1
 * </TabsContent>
 * ```
 */
declare const TabsContent: react__default.ForwardRefExoticComponent<Omit<TabsContentProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

interface TabsListProps extends SlottablePropsWithRef<"div"> {
    /**
     * Visual style variant of the tabs list
     * @defaultValue "primary"
     */
    kind?: "primary" | "secondary" | "tertiary";
    /**
     * Hide the overflow scroll buttons
     * @defaultValue false
     */
    hideOverflowButtons?: boolean;
    /**
     * A range of indices to display, with ellipses for gaps.
     * For example, [1,2,3,8,9,10] would show items 1-3, ellipsis, then 8-10.
     */
    visibleRange?: number[];
}
/**
 * Container for tab triggers.
 * Must wrap all TabsTrigger components.
 *
 * @param props - Props for the {@link TabsList} component
 * @see {@link TabsListProps}
 *
 * @example
 * ```tsx
 * <TabsList kind="secondary">
 *   <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *   <TabsTrigger value="tab2">Tab 2</TabsTrigger>
 * </TabsList>
 * ```
 */
declare const TabsList: react__default.ForwardRefExoticComponent<Omit<TabsListProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

interface TabsRootProps extends PrimitivePropsWithRef<"div"> {
    /**
     * The controlled value of the tabs. Must be used in conjunction with `onValueChange`.
     */
    value?: string;
    /**
     * The value of the tabs when initially rendered. Use when you do not need to control the state of the tabs.
     */
    defaultValue?: string;
    /**
     * Event handler called when the value changes
     */
    onValueChange?: (value: string) => void;
}
/**
 * Root component that contains all the tabs and tab panels.
 * Must wrap all other tab components.
 *
 * @param props - Props for the tabs root
 * @see {@link TabsRootProps}
 *
 * @example
 * ```tsx
 * <TabsRoot defaultValue="tab1">
 *   <TabsList>
 *     <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 *     <TabsTrigger value="tab2">Tab 2</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="tab1">Content 1</TabsContent>
 *   <TabsContent value="tab2">Content 2</TabsContent>
 * </TabsRoot>
 * ```
 */
declare const TabsRoot: react__default.ForwardRefExoticComponent<Omit<TabsRootProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

interface TabsTriggerProps extends PrimitivePropsWithRef<"button"> {
    /**
     * A unique value that associates the trigger with its content
     */
    value: string;
    /**
     * Whether the tab is disabled
     */
    disabled?: boolean;
}
/**
 * Button that activates its associated content. Must be wrapped in a TabsList.
 *
 * @param props - Props for the tab trigger
 * @see {@link TabsTriggerProps}
 *
 * @example
 * ```tsx
 * <TabsTrigger value="tab1">Tab 1</TabsTrigger>
 * ```
 */
declare const TabsTrigger: react__default.ForwardRefExoticComponent<Omit<TabsTriggerProps, "ref"> & react__default.RefAttributes<HTMLButtonElement>>;

interface TabItem {
    /**
     * Whether the tab trigger should render as `children`
     */
    asChild?: boolean;
    /**
     * Content to display in the tab trigger
     */
    children: react__default.ReactNode;
    /**
     * Content to display when this tab is selected.
     * Optional when managing tab content rendering manually in controlled mode.
     */
    slotContent?: react__default.ReactNode;
    /**
     * @deprecated Use `children` instead. This will be removed in the next major version.
     */
    slotTrigger?: react__default.ReactNode;
    /**
     * Unique value to identify this tab
     */
    value: string;
    /**
     * Whether the tab is disabled
     */
    disabled?: boolean;
    /**
     * URL to navigate to.
     */
    href?: string;
    /**
     * Native HTML attributes for the tab components
     */
    attributes?: {
        TabsTrigger?: NativeElementAttributes<"button", typeof TabsTrigger>;
        TabsContent?: NativeElementAttributes<"div", typeof TabsContent>;
    };
}
interface TabsPropsBase extends Pick<TabsRootProps, "value" | "defaultValue" | "onValueChange">, Pick<TabsListProps, "kind" | "visibleRange" | "hideOverflowButtons"> {
    /**
     * List of tabs to render
     */
    items: TabItem[];
    /**
     * Render a custom link component for navigation mode.
     * When provided, the root element will be a <nav>.
     * When omitted, the root element will be a <div>.
     */
    renderLink?: (item: TabItem & {
        /**
         * URL to navigate to.
         */
        href: string;
    }) => react__default.ReactNode;
    /**
     * Native HTML attributes for the tab components
     */
    attributes?: {
        TabsList?: NativeElementAttributes<"div", typeof TabsList>;
    };
}
interface TabsPropsDivRoot extends TabsPropsBase, NativeElementAttributes<"div", typeof TabsRoot> {
    renderLink?: undefined;
}
interface TabsPropsNavRoot extends TabsPropsBase, NativeElementAttributes<"nav", typeof TabsRoot> {
    renderLink: NonNullable<TabsPropsBase["renderLink"]>;
}
type TabsProps = TabsPropsDivRoot | TabsPropsNavRoot;
/**
 * A high-level tabs component that provides a simple way to create tabbed interfaces.
 * Wraps the lower-level composed tab components for ease of use.
 *
 * @param props - Props for tabs component
 * @see {@link TabsProps}
 *
 * @example
 * ```tsx
 * <Tabs
 *   items={[
 *     {
 *       children: "Account",
 *       slotContent: "Account settings...",
 *       value: "account"
 *     },
 *     {
 *       children: "Password",
 *       slotContent: "Password settings...",
 *       value: "password"
 *     }
 *   ]}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // with link navigation
 * <Tabs
 *   items={[
 *     {
 *       asChild: true,
 *       children: <NextLink href="/home">Home</NextLink>,
 *       value: "home",
 *       slotContent: "Home content"
 *     },
 *     {
 *       children: "About",
 *       href: "/about",
 *       value: "about",
 *       slotContent: "About content"
 *     },
 *     {
 *       children: "Disabled",
 *       value: "disabled",
 *       disabled: true,
 *       slotContent: "You shouldn't see this."
 *     }
 *   ]}
 * />
 * ```
 */
declare const Tabs: react__default.ForwardRefExoticComponent<(Omit<TabsPropsDivRoot, "ref"> | Omit<TabsPropsNavRoot, "ref">) & react__default.RefAttributes<HTMLElement | HTMLDivElement>>;

declare const TabsTestIds: {
    readonly TabsRoot: "nv-tabs-root";
    readonly TabsList: "nv-tabs-list";
    readonly TabsTrigger: "nv-tabs-trigger";
    readonly TabsContent: "nv-tabs-content";
};

interface HorizontalNavListProps extends TabsListProps {
}
/**
 * The HorizontalNavList component serves as a container for navigation items in a horizontal layout,
 * leveraging the underlying TabsList component for functionality. It allows users to switch between
 * different sections or views, similar to tabbed navigation, but presented horizontally.
 * This component accepts props that are passed to the {@link HorizontalNavList} component,
 * enabling customization and integration within the broader navigation system.
 *
 * @param props - props to be passed to the {@link HorizontalNavList} component
 * @see {@link HorizontalNavListProps}
 *
 * @example
 * ```tsx
 * <HorizontalNavList>
 *  <HorizontalNavLink value="home" href="/">Home</HorizontalNavLink>
 *  <HorizontalNavLink value="about" href="/about">About</HorizontalNavLink>
 *  <HorizontalNavLink value="contact" href="/contact">Contact</HorizontalNavLink>
 * </HorizontalNavList>
 * ```
 */
declare const HorizontalNavList: react.ForwardRefExoticComponent<Omit<HorizontalNavListProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface HorizontalNavItem extends Omit<NativeElementAttributes<"a", typeof HorizontalNavLink>, "ref"> {
    value: string;
    disabled?: boolean;
    children?: React.ReactNode;
}
interface HorizontalNavProps extends PrimitivePropsWithRef<"nav"> {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    items: HorizontalNavItem[];
    renderLink?: (item: HorizontalNavItem) => React.ReactNode;
    attributes?: {
        HorizontalNavList?: NativeElementAttributes<"div", typeof HorizontalNavList>;
        HorizontalNavLink?: NativeElementAttributes<"a", typeof HorizontalNavLink>;
    };
}
/**
 * The HorizontalNav component is a customizable navigation bar designed to display a list of links in a horizontal layout.
 * It allows users to navigate between different sections of an application or website.
 *
 * @param props - props to be passed to the {@link HorizontalNav} component
 * @see {@link HorizontalNavProps}
 *
 * @example
 * ```tsx
 * <HorizontalNav
 *   items={[
 *     { value: "home", href: "/", children: "Home" },
 *     { value: "about", href: "/about", children: "About" },
 *     { value: "contact", href: "/contact", children: "Contact" },
 *   ]}
 * />
 * ```
 */
declare const HorizontalNav: react.ForwardRefExoticComponent<Omit<HorizontalNavProps, "ref"> & react.RefAttributes<HTMLElement>>;

interface HorizontalNavRootProps extends PrimitivePropsWithRef<"nav"> {
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
}
/**
 * The HorizontalNavRoot component serves as the main container for a horizontal navigation interface,
 * leveraging the underlying TabsRoot component for its functionality. It allows users to navigate
 * between different sections or views in a horizontal layout, similar to tabbed navigation but
 * optimized for horizontal presentation. This component accepts props that are passed to the
 * {@link HorizontalNavRoot} component, enabling customization and integration within the broader
 * navigation system.
 *
 * @param props - props to be passed to the {@link HorizontalNavRoot} component
 * @see {@link HorizontalNavRootProps}
 *
 * @example
 * ```tsx
 * <HorizontalNavRoot>
 *  <HorizontalNavList>
 *    <HorizontalNavLink value="home" href="/">Home</HorizontalNavLink>
 *    <HorizontalNavLink value="about" href="/about">About</HorizontalNavLink>
 *    <HorizontalNavLink value="contact" href="/contact">Contact</HorizontalNavLink>
 *  </HorizontalNavList>
 * </HorizontalNavRoot>
 * ```
 */
declare const HorizontalNavRoot: react.ForwardRefExoticComponent<Omit<HorizontalNavRootProps, "ref"> & react.RefAttributes<HTMLElement>>;

declare const HorizontalNavTestIds: {
    readonly HorizontalNavRoot: "nv-horizontal-nav-root";
    readonly HorizontalNavList: "nv-horizontal-nav-list";
    readonly HorizontalNavLink: "nv-horizontal-nav-link";
};

interface InlineProps extends react__default.ComponentPropsWithRef<"span">, Pick<PrimitiveComponentProps, "asChild" | "padding" | "paddingX" | "paddingY" | "paddingTop" | "paddingRight" | "paddingBottom" | "paddingLeft" | "spacing" | "spacingX" | "spacingY" | "spacingTop" | "spacingRight" | "spacingBottom" | "spacingLeft"> {
}
/**
 * A primitive span component.
 * @param props - props to be passed to the {@link Inline} component
 * @see {@link InlineProps}
 * @example
 * ```tsx
 * <Inline>inline content</Inline>
 * ```
 */
declare const Inline: react__default.ForwardRefExoticComponent<Omit<InlineProps, "ref"> & react__default.RefAttributes<HTMLSpanElement>>;

interface ListItemProps extends PrimitivePropsWithRef<"li"> {
}
/**
 * A single list item that can contain markers and content.
 * @param props - props to be passed to the {@link ListItem} component
 * @see {@link ListItemProps}
 *
 * @example
 * ```tsx
 * <ListItem disabled={true}>
 *   Buy groceries
 * </ListItem>
 * ```
 */
declare const ListItem: react.ForwardRefExoticComponent<Omit<ListItemProps, "ref"> & react.RefAttributes<HTMLLIElement>>;

interface ListItemMarkerProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * Displays the marker for a list item (bullet, number, icon, etc.).
 * @param props - props to be passed to the {@link ListItemMarker} component
 * @see {@link ListItemMarkerProps}
 *
 * @example
 * ```tsx
 * <ListItemMarker>
 * 	1.
 * </ListItemMarker>
 * ```
 */
declare const ListItemMarker: react.ForwardRefExoticComponent<Omit<ListItemMarkerProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface ListRootProps extends PrimitivePropsWithRef<"ul"> {
    /**
     * The type of list to display. Defaults to unordered
     */
    kind: "ordered" | "unordered";
}
/**
 * Root container for list items.
 * @param props - props to be passed to the {@link ListRoot} component
 * @see {@link ListRootProps}
 *
 * @example
 * ```tsx
 * <ListRoot kind="unordered">
 *   <ListItem>First item</ListItem>
 * </ListRoot>
 * ```
 */
declare const ListRoot: react.ForwardRefExoticComponent<Omit<ListRootProps, "ref"> & react.RefAttributes<HTMLOListElement | HTMLUListElement>>;

interface ListItemData extends NativeElementAttributes<"li", typeof ListItem> {
    /**
     * Content to display in the list item (text, JSX, etc.)
     */
    children: ReactNode;
    /**
     * The type of marker to display.
     */
    slotMarker?: ReactNode;
}
interface ListProps extends NativeElementAttributes<"ol" | "ul", typeof ListRoot> {
    /**
     * The type of list to display.
     * @defaultValue "unordered"
     */
    kind?: "ordered" | "unordered";
    /**
     * Array of list item objects with flexible content and attributes.
     */
    items: (string | ListItemData)[];
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        ListItem?: NativeElementAttributes<"li", typeof ListItem>;
        ListItemMarker?: NativeElementAttributes<"div", typeof ListItemMarker>;
    };
}
/**
 * A flexible list component that supports unordered, ordered, and icon lists.
 * @param props - props to be passed to the {@link List} component
 * @see {@link ListProps}
 *
 * @example
 * ```tsx
 * <List
 *   kind="unordered"
 *   items={[
 *     { children: "Buy groceries", slotMarker: "•" },
 *     { children: "Walk the dog", slotMarker: "•" },
 *     { children: "Finish project", slotMarker: "•" },
 *   ]}
 * />
 * ```
 */
declare const List: react.ForwardRefExoticComponent<Omit<ListProps, "ref"> & react.RefAttributes<HTMLOListElement | HTMLUListElement>>;

declare const ListTestIds: {
    readonly ListRoot: "nv-list-root";
    readonly ListItem: "nv-list-item";
    readonly ListItemMarker: "nv-list-item-marker";
};

interface ModalContentProps extends SlottablePropsWithRef<"div">, DensityVariantProps {
    /**
     * Whether the modal content should be rendered in a portal. This is useful when the modal content is a child of a fixed container.
     * @defaultValue true
     */
    portal?: boolean;
    /**
     * The container to render the modal content in when `portal` is true.
     * @defaultValue document.body
     */
    portalContainer?: Element | DocumentFragment | null;
    /**
     * Whether the modal should close when clicking outside of it.
     * @defaultValue true
     * @remarks
     * To fully prevent modal closing, also configure:
     * - Set `hideCloseButton` to `true` on the `ModalRoot` component
     * - Use `event.preventDefault` in the `onEscapeKeyDown` handler to prevent escape key closing
     */
    closeOnClickOutside?: boolean;
    /**
     * Event handler called when the escape key is down. It can be prevented by calling `event.preventDefault`.
     * @remarks
     * To fully prevent modal closing, also configure:
     * - Set `hideCloseButton` to `true` on the `ModalRoot` component
     * - Set `closeOnClickOutside` to `false` to prevent clicking outside from closing
     */
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    /**
     * Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling `event.preventDefault`.
     */
    onPointerDownOutside?: (event: Event) => void;
    /**
     * Event handler called when an interaction event occurs outside the bounds of the component. It can be prevented by calling `event.preventDefault`.
     */
    onInteractOutside?: (event: Event) => void;
    /**
     * Event handler called when focus moves into the component after opening. It can be prevented by calling `event.preventDefault`.
     */
    onOpenAutoFocus?: (event: Event) => void;
    /**
     * Forces the content to be mounted in the DOM regardless of the `open` state.
     * When true, this overrides the default visibility behavior and keeps content mounted,
     * making it useful for custom animation control with React animation libraries.
     * @defaultValue undefined
     */
    forceMount?: true;
}
/**
 * Contains content to be rendered in the open modal.
 * @param props - props to be passed to the {@link ModalContent} component
 * @see {@link ModalContentProps}
 *
 * @example
 * ```tsx
 * <ModalContent>
 * 	<ModalHeading />
 * 	<ModalMain />
 * 	<ModalFooter />
 * </ModalContent>
 * ```
 */
declare const ModalContent: react.ForwardRefExoticComponent<Omit<ModalContentProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface ModalFooterProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * Footer of a modal.
 * @param props - props to be passed to the {@link ModalFooter} component
 * @see {@link ModalFooterProps}
 *
 * @example
 * ```tsx
 * <ModalFooter>
 * 	<Button color="neutral" kind="tertiary">Cancel</Button>
 * 	<Button>Save</Button>
 * </ModalFooter>
 * ```
 */
declare const ModalFooter: react.ForwardRefExoticComponent<Omit<ModalFooterProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface ModalHeadingProps extends PrimitivePropsWithRef<"h2"> {
}
/**
 * Heading (or title) of a modal.
 * @param props - props to be passed to the {@link ModalHeading} component
 * @see {@link ModalHeadingProps}
 *
 * @example
 * ```tsx
 * <ModalHeading>
 * 	Modal Heading
 * </ModalHeading>
 * ```
 */
declare const ModalHeading: react.ForwardRefExoticComponent<Omit<ModalHeadingProps, "ref"> & react.RefAttributes<HTMLHeadingElement>>;

interface ModalMainProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * Body of a modal.
 * @param props - props to be passed to the {@link ModalMain} component
 * @see {@link ModalMainProps}
 *
 * @example
 * ```tsx
 * <ModalMain>
 * 	Modal Body
 * </ModalMain>
 * ```
 */
declare const ModalMain: react.ForwardRefExoticComponent<Omit<ModalMainProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface ModalRootProps extends PropsWithChildren {
    /**
     * The open state of the modal when it is initially rendered. Use when you do not need to control its open state.
     * @defaultValue false
     */
    defaultOpen?: boolean;
    /**
     * The controlled open state of the modal. Must be used in conjunction with `onOpenChange`.
     */
    open?: boolean;
    /**
     * Event handler called when the open state of the modal changes.
     */
    onOpenChange?: (open: boolean) => void;
    /**
     * The modality of the modal. When set to `true`, interaction with outside elements will be disabled and only modal content will be visible to screen readers.
     * @defaultValue true
     */
    modal?: boolean;
    /**
     * When true, hides the modal's close button. Useful for modals that should not be dismissible.
     * @remarks
     * To fully prevent modal closing, also configure in `ModalContent`:
     * - Use `event.preventDefault` in the `onEscapeKeyDown` handler to prevent escape key closing
     * - Set `closeOnClickOutside` to `false` to prevent clicking outside from closing
     */
    hideCloseButton?: boolean;
}
/**
 * Contains all the parts of a modal.
 * @param props - props to be passed to the {@link ModalRoot} component
 * @see {@link ModalRootProps}
 *
 * @example
 * ```tsx
 * <ModalRoot>
 *  <ModalTrigger />
 *  <ModalContent>
 * 		<ModalHeading />
 * 		<ModalMain />
 * 		<ModalFooter />
 * 	</ModalContent>
 * </ModalRoot>
 * ```
 */
declare const ModalRoot: {
    ({ open, onOpenChange, defaultOpen, modal, children, hideCloseButton, }: ModalRootProps): react_jsx_runtime.JSX.Element;
    displayName: string;
};

interface ModalTriggerProps extends PrimitivePropsWithRef<"button"> {
}
/**
 * The button that opens the modal.
 * @param props - props to be passed to the {@link ModalTrigger} component
 * @see {@link ModalTriggerProps}
 *
 * @example
 * ```tsx
 * <ModalTrigger>
 * 	Open Modal
 * </ModalTrigger>
 * ```
 *
 * @example
 * ```tsx
 * <ModalTrigger asChild>
 * 	<Button>Open Modal</Button>
 * </ModalTrigger>
 * ```
 */
declare const ModalTrigger: react.ForwardRefExoticComponent<Omit<ModalTriggerProps, "ref"> & react.RefAttributes<HTMLButtonElement>>;

interface ModalProps extends PropsWithChildren<Pick<ModalContentProps, "density" | "portal" | "portalContainer" | "closeOnClickOutside" | "onEscapeKeyDown" | "onPointerDownOutside" | "onInteractOutside" | "onOpenAutoFocus" | "forceMount"> & Pick<ModalRootProps, "defaultOpen" | "open" | "onOpenChange" | "modal" | "hideCloseButton"> & NativeElementAttributes<"div", typeof ModalContent>> {
    /**
     * The content to render in the modal trigger.
     */
    slotTrigger?: React.ReactNode;
    /**
     * The content to render in the modal heading. If not provided, the modal will render empty space to make room for the close button.
     */
    slotHeading?: React.ReactNode;
    /**
     * The content to render in the modal footer.
     */
    slotFooter?: React.ReactNode;
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        ModalTrigger?: NativeElementAttributes<"button", typeof ModalTrigger>;
        ModalHeading?: NativeElementAttributes<"div", typeof ModalHeading>;
        ModalMain?: NativeElementAttributes<"div", typeof ModalMain>;
        ModalFooter?: NativeElementAttributes<"div", typeof ModalFooter>;
    };
}
/**
 * A modal dialog that can be triggered by a button or other element.
 * @param props - props to be passed to the Modal component
 * @see {@link ModalProps}
 *
 * @example
 * ```tsx
 * <Modal
 * 	slotTrigger={<Button>Open Modal</Button>}
 * 	slotHeading="Modal Heading"
 * 	slotFooter={
 * 		<Flex align="center" justify="end" gap="density-sm">
 * 			<Button kind="tertiary">Cancel</Button>
 * 			<Button color="brand">Save</Button>
 * 		</Flex>
 * 	}
 * >
 * 	<p>Your Modal Content</p>
 * </Modal>
 * ```
 */
declare const Modal: react.ForwardRefExoticComponent<Omit<ModalProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare const ModalTestIds: {
    readonly ModalRoot: "nv-modal-root";
    readonly ModalTrigger: "nv-modal-trigger";
    readonly ModalContent: "nv-modal-content";
    readonly ModalHeading: "nv-modal-heading";
    readonly ModalMain: "nv-modal-main";
    readonly ModalFooter: "nv-modal-footer";
};

interface NotificationContentProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * The content container for notifications. Provides a consistent layout grid for notification elements
 * including icons, headers, and close buttons. Uses a 3-column grid layout with auto-sized columns
 * for the icon and close button, and a 1fr middle column for the main content.
 *
 * @param props - Props to be passed to the component, extends standard div props
 * @see {@link NotificationContentProps}
 *
 * @example
 * ```tsx
 * <NotificationContent>
 *   <NotificationIcon />
 *   <NotificationHeader>
 *     <NotificationHeading>Title</NotificationHeading>
 *     <NotificationSubheading>Subtitle</NotificationSubheading>
 *   </NotificationHeader>
 * </NotificationContent>
 * ```
 */
declare const NotificationContent: react.ForwardRefExoticComponent<Omit<NotificationContentProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface NotificationFooterProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * NotificationFooter is a layout component that renders the footer section of a Notification.
 * It provides consistent styling and spacing for content placed at the bottom of a notification,
 * typically used for action buttons or supplementary controls.
 *
 * @param props - Standard HTML div props extended with Primitive component features
 * @see {@link NotificationFooterProps}
 *
 * @example
 * ```tsx
 * <NotificationFooter>
 *   <Button variant="secondary">Cancel</Button>
 *   <Button variant="primary">Confirm</Button>
 * </NotificationFooter>
 * ```
 */
declare const NotificationFooter: react.ForwardRefExoticComponent<Omit<NotificationFooterProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface NotificationHeaderProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * NotificationHeader is a layout component that renders the header section of a Notification.
 * It provides consistent styling and spacing for content placed at the top of a notification,
 * typically used for the notification title and subtitle.
 *
 * @param props - Standard HTML div props extended with Primitive component features
 * @see {@link NotificationHeaderProps}
 *
 * @example
 * ```tsx
 * <NotificationHeader>
 *   <NotificationHeading />
 *   <NotificationSubheading />
 * </NotificationHeader>
 * ```
 */
declare const NotificationHeader: react.ForwardRefExoticComponent<Omit<NotificationHeaderProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface NotificationHeadingProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * NotificationHeading is a layout component that renders the heading/title section of a Notification.
 * It provides consistent styling and spacing for the main title text of a notification.
 * This component is typically used within a NotificationHeader along with an optional NotificationSubheading.
 *
 * @param props - Standard HTML div props extended with Primitive component features
 * @see {@link NotificationHeadingProps}
 *
 * @example Basic usage
 * ```tsx
 * <NotificationHeading>Important Update</NotificationHeading>
 * ```
 *
 * @example With NotificationHeader
 * ```tsx
 * <NotificationHeader>
 *   <NotificationHeading>Success!</NotificationHeading>
 *   <NotificationSubheading>Your changes have been saved.</NotificationSubheading>
 * </NotificationHeader>
 * ```
 */
declare const NotificationHeading: react.ForwardRefExoticComponent<Omit<NotificationHeadingProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare const notificationRoot: (props?: ({
    kind?: "inline" | "stacked" | null | undefined;
    status?: "error" | "warning" | "success" | "info" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type NotificationRootVariantProps = VariantProps<typeof notificationRoot>;
interface NotificationRootProps extends PrimitivePropsWithRef<"div"> {
    /**
     * The kind of notification to display.
     * @defaultValue "stacked"
     */
    kind?: NotificationRootVariantProps["kind"];
    /**
     * The status of the notification.
     * @defaultValue "info"
     */
    status?: NotificationRootVariantProps["status"];
}
/**
 * The root component for notifications.
 * @param props - props to be passed to the {@link NotificationRoot} component
 * @see {@link NotificationRootProps}
 *
 * @example
 * ```tsx
 * <NotificationRoot status="success">
 *   Notification content
 * </NotificationRoot>
 *```
 */
declare const NotificationRoot: react.ForwardRefExoticComponent<Omit<NotificationRootProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface NotificationIconProps extends PrimitivePropsWithRef<"div"> {
    /**
     * The status of the notification that determines which icon to show by default
     * if one is not provided as a child
     * @defaultValue "info"
     */
    status: NotificationRootProps["status"];
}
/**
 * Icon component for notifications that displays a status-specific icon.
 * By default for the internal package, it shows predefined icons based on the notification status:
 * - success: CheckCircle
 * - error: Error
 * - warning: Warning
 * - info: InfoCircle
 *
 * The icon can be overridden by passing children to the component.
 *
 * @param props - props to be passed to the {@link NotificationIcon} component
 * @see {@link NotificationIconProps}
 *
 * @example
 * ```tsx
 * <NotificationIcon status="success" />
 * ```
 *
 * @example With custom icon
 * ```tsx
 * <NotificationIcon status="info">
 *   <CustomIcon />
 * </NotificationIcon>
 * ```
 */
declare const NotificationIcon: react.ForwardRefExoticComponent<Omit<NotificationIconProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface NotificationSubheadingProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * NotificationSubheading is a layout component that renders the subheading/subtitle section of a Notification.
 * It provides consistent styling and spacing for secondary descriptive text below the main heading.
 * This component is typically used within a NotificationHeader along with a NotificationHeading.
 *
 * @param props - Standard HTML div props extended with Primitive component features
 * @see {@link NotificationSubheadingProps}
 *
 * @example Basic usage
 * ```tsx
 * <NotificationSubheading>Additional details about the notification</NotificationSubheading>
 * ```
 *
 * @example With NotificationHeader
 * ```tsx
 * <NotificationHeader>
 *   <NotificationHeading>Success!</NotificationHeading>
 *   <NotificationSubheading>Your changes have been saved successfully.</NotificationSubheading>
 * </NotificationHeader>
 * ```
 */
declare const NotificationSubheading: react.ForwardRefExoticComponent<Omit<NotificationSubheadingProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface NotificationProps extends Pick<NotificationRootProps, "status" | "kind">, NativeElementAttributes<"div", typeof NotificationRoot> {
    /**
     * The main heading text or element to display in the notification.
     * This is required and serves as the primary message.
     */
    children?: React.ReactNode;
    /**
     * The kind of notification to display.
     * @defaultValue "stacked"
     */
    kind?: NotificationRootProps["kind"];
    /**
     * Optional icon element to display on the left side of the notification.
     * Typically used to indicate the notification type or status.
     */
    slotIcon?: React.ReactNode;
    /**
     * @deprecated Replace with `children` - no other changes are required. Will be removed in the next
     * major version and `children` will become a required prop.
     */
    slotHeading?: React.ReactNode;
    /**
     * Optional subheading text or element to display below the main heading.
     * Provides additional context or details about the notification.
     */
    slotSubheading?: React.ReactNode;
    /**
     * Optional custom close icon element to replace the default close button icon.
     * Only displayed when onClose handler is provided.
     */
    slotCloseIcon?: React.ReactNode;
    /**
     * Optional footer content to display at the bottom of the notification.
     * Can contain actions, links or additional information.
     */
    slotFooter?: React.ReactNode;
    /**
     * Optional callback function that is called when the close button is clicked.
     * If provided, displays a close button in the notification.
     */
    onClose?: () => void;
    /**
     * The native HTML attributes to be passed to the internal composed Notification components.
     */
    attributes?: {
        NotificationContent?: NativeElementAttributes<"div", typeof NotificationContent>;
        NotificationIcon?: NativeElementAttributes<"div", typeof NotificationIcon>;
        NotificationHeader?: NativeElementAttributes<"div", typeof NotificationHeader>;
        NotificationHeading?: NativeElementAttributes<"span", typeof NotificationHeading>;
        NotificationSubheading?: NativeElementAttributes<"div", typeof NotificationSubheading>;
        NotificationCloseButton?: NativeElementAttributes<"button", typeof Button>;
        NotificationFooter?: NativeElementAttributes<"div", typeof NotificationFooter>;
    };
}
/**
 * A notification component that displays important messages and alerts to users.
 * It provides a flexible layout with support for icons, headings, subheadings, close buttons and footers.
 *
 * The component uses a grid-based layout through NotificationContent to organize its elements:
 * - Icon on the left (optional)
 * - Header content in the middle containing heading and subheading
 * - Close button on the right (optional)
 * - Footer below (optional)
 *
 * @param props - props to be passed to the {@link Notification} component
 * @see {@link NotificationProps}
 *
 * @example
 * ```tsx
 * <Notification
 *   slotHeading="Success!"
 *   slotSubheading="Your changes have been saved"
 *   slotIcon={<SuccessIcon />}
 *   onClose={() => console.log('Notification closed')}
 * />
 * ```
 */
declare const Notification: {
    ({ children, className, kind, onClose, slotCloseIcon, slotFooter, slotHeading, slotIcon, slotSubheading, ...props }: NotificationProps): react_jsx_runtime.JSX.Element;
    displayName: string;
};

declare const NotificationTestIds: {
    readonly NotificationRoot: "nv-notification-root";
    readonly NotificationContent: "nv-notification-content";
    readonly NotificationIcon: "nv-notification-icon";
    readonly NotificationHeader: "nv-notification-header";
    readonly NotificationHeading: "nv-notification-heading";
    readonly NotificationSubheading: "nv-notification-subheading";
    readonly NotificationCloseButton: "nv-notification-close-button";
    readonly NotificationCloseButtonSection: "nv-notification-close-button-section";
    readonly NotificationFooter: "nv-notification-footer";
};

interface PageHeaderContentProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * PageHeaderContent contains the breadcrumbs, header, and main content of the page header.
 *
 * @param props - props to be passed to the {@link PageHeaderContent} component.
 * @see {@link PageHeaderContentProps}
 */
declare const PageHeaderContent: react.ForwardRefExoticComponent<Omit<PageHeaderContentProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface PageHeaderDescriptionProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * Wrapper component for the description of the PageHeader
 * @param props - props to be passed to the {@link PageHeaderDescription} component
 * @see {@link PageHeaderDescriptionProps}
 *
 * @example
 * ```tsx
 * <PageHeaderDescription>
 *   This is a Page Header description
 * </PageHeaderDescription>
 * ```
 */
declare const PageHeaderDescription: react.ForwardRefExoticComponent<Omit<PageHeaderDescriptionProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface PageHeaderFooterProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * A container for actions or information. At the bottom of small PageHeaders and to the right of
 * large PageHeaders.
 *
 * @param props - props to be passed to the {@link PageHeaderFooter} component.
 * @see {@link PageHeaderFooterProps}
 *
 * @example
 * ```tsx
 * <PageHeaderFooter>
 *   <Button kind="secondary" onClick={() => console.log("Action clicked")}>
 *     Secondary
 *   </Button>
 *   <Button kind="primary" onClick={() => console.log("Action clicked")}>
 *     Primary
 *   </Button>
 * </PageHeaderFooter>
 * ```
 */
declare const PageHeaderFooter: react.ForwardRefExoticComponent<Omit<PageHeaderFooterProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface PageHeaderHeaderProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * PageHeaderHeader is a wrapper for the multiple components that make up the first portion
 * of the PageHeader.
 *
 * It is composed of: breadcrumbs, subheading, heading, and description.
 *
 * @param props - props to be passed to the {@link PageHeaderHeader} component
 * @see {@link PageHeaderHeaderProps}
 *
 * @example
 * ```tsx
 * <PageHeaderHeader>
 *   <PageHeaderBreadcrumb>
 *     <Breadcrumbs
 *       items={[
 *         { to: "/", label: "Home" },
 *         { to: "/", label: "Category" },
 *         { to: "/", label: "Current" },
 *       ]}
 *     />
 *   </PageHeaderBreadcrumb>
 *   <PageHeaderSubheading>Subheading</PageHeaderSubheading>
 *   <PageHeaderHeading>Heading</PageHeaderHeading>
 *   <PageHeaderDescription>
 *     This is a Page Header description
 *   </PageHeaderDescription>
 * </PageHeaderHeader>
 * ```
 */
declare const PageHeaderHeader: react.ForwardRefExoticComponent<Omit<PageHeaderHeaderProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface PageHeaderHeadingProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * The PageHeaderHeading is the is the title of the PageHeader
 * @param props - props to be passed to the {@link PageHeaderHeading} component
 * @see {@link PageHeaderHeadingProps}
 *
 * @example
 * ```tsx
 * <PageHeaderHeader>
 *   <PageHeaderHeading>Heading</PageHeaderHeading>
 * </PageHeaderHeader>
 * ```
 */
declare const PageHeaderHeading: react.ForwardRefExoticComponent<Omit<PageHeaderHeadingProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface PageHeaderMainProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * This is a slot for any additional content that will render below the description in the PageHeader
 * In the base component, this is the children of the PageHeader
 *
 * @param props - props to be passed to the {@link PageHeaderMain} component
 * @see {@link PageHeaderMainProps}
 *
 * @example
 * ```tsx
 * <PageHeaderMain>
 *   Extra Content
 * </PageHeaderMain>
 * ```
 *
 * @example
 * ```tsx
 * <PageHeader slotBreadcrumb={<Breadcrumbs items={items} />} slotHeading="Heading" slotDescription="Description">
 *   This is main
 *  </PageHeader>
 * ```
 */
declare const PageHeaderMain: react.ForwardRefExoticComponent<Omit<PageHeaderMainProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare const pageHeaderRoot: (props?: ({
    density?: "compact" | "standard" | "spacious" | null | undefined;
    kind?: "flat" | "floating" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type PageHeaderRootVariantProps = VariantProps<typeof pageHeaderRoot>;
interface PageHeaderRootProps extends PrimitivePropsWithRef<"div">, DensityVariantProps {
    /**
     * The kind of Page Header. Floating Page Headers have a border and rounded radius.
     * They are expected to be used with margin around the Page Header and "float" in the layout.
     */
    kind?: PageHeaderRootVariantProps["kind"];
}
/**
 * The wrapper element that includes all other PageHeader elements
 * @param props - props to be passed to the {@link PageHeaderRoot} component
 * @see {@link PageHeaderRootProps}
 *
 * @example
 * ```tsx
 * <PageHeaderRoot>
 *   {children}
 * </PageHeaderRoot>
 * ```
 */
declare const PageHeaderRoot: react.ForwardRefExoticComponent<Omit<PageHeaderRootProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface PageHeaderSubheadingProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * Describe PageHeaderSubheading here
 * @param props - props to be passed to the {@link PageHeaderSubheading} component
 * @see {@link PageHeaderSubheadingProps}
 *
 * @example
 * ```tsx
 * <PageHeaderSubheading>
 *  This is a Page Header subheading
 * </PageHeaderSubheading>
 * ```
 */
declare const PageHeaderSubheading: react.ForwardRefExoticComponent<Omit<PageHeaderSubheadingProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface PageHeaderProps extends PropsWithChildren<Pick<PageHeaderRootProps, "kind" | "density"> & NativeElementAttributes<"div", typeof PageHeaderRoot>> {
    /**
     * Whether or not the PageHeader is floating.
     */
    kind?: PageHeaderRootProps["kind"];
    /**
     * Slot for the breadcrumbs of the PageHeader
     */
    slotBreadcrumbs?: React.ReactNode;
    /**
     * Slot for the subheading of the PageHeader
     */
    slotSubheading?: React.ReactNode;
    /**
     * Slot for the heading of the PageHeader
     */
    slotHeading?: React.ReactNode;
    /**
     * Slot for the description of the PageHeader
     */
    slotDescription?: React.ReactNode;
    /**
     * Slot for the actions of the PageHeader
     */
    slotActions?: React.ReactNode;
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        PageHeaderContent?: NativeElementAttributes<"div", typeof PageHeaderContent>;
        PageHeaderHeader?: NativeElementAttributes<"div", typeof PageHeaderHeader>;
        PageHeaderSubheading?: NativeElementAttributes<"div", typeof PageHeaderSubheading>;
        PageHeaderHeading?: NativeElementAttributes<"div", typeof PageHeaderHeading>;
        PageHeaderDescription?: NativeElementAttributes<"div", typeof PageHeaderDescription>;
        PageHeaderMain?: NativeElementAttributes<"div", typeof PageHeaderMain>;
        PageHeaderFooter?: NativeElementAttributes<"div", typeof PageHeaderFooter>;
    };
}
/**
 * The page header describes the current page and displays a title, breadcrumbs, and page-level actions
 * @param props - props to be passed to the {@link PageHeader} component
 * @see {@link PageHeaderProps}
 *
 * @example
 * ```tsx
 * <PageHeader
 *   slotBreadcrumbs={<Breadcrumbs items={[{ to: "/", label: "Home" }]} />}
 *   slotSubheading="Subheading"
 *   slotHeading="Heading"
 * />
 *   Optional Additional Context
 * </PageHeader>
 * ```
 */
declare const PageHeader: react.ForwardRefExoticComponent<Omit<PageHeaderProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare const PageHeaderTestIds: {
    readonly PageHeaderRoot: "nv-page-header-root";
    readonly PageHeaderContent: "nv-page-header-content";
    readonly PageHeaderHeader: "nv-page-header-header";
    readonly PageHeaderSubheading: "nv-page-header-subheading";
    readonly PageHeaderHeading: "nv-page-header-heading";
    readonly PageHeaderDescription: "nv-page-header-description";
    readonly PageHeaderMain: "nv-page-header-main";
    readonly PageHeaderFooter: "nv-page-header-footer";
};

interface PaginationControlsGroupProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * A component responsible for grouping control elements (i.e. page size select) in a pagination component.
 * @param props - props to be passed to the {@link PaginationControlsGroup} component
 * @see {@link PaginationControlsGroupProps}
 *
 * @example
 * ```tsx
 * <PaginationControlsGroup>
 *	Items per page
 *  <PaginationPageSizeSelect />
 *  <Divider orientation="vertical" width="small" />
 *  <PaginationItemRangeText />
 * </PaginationControlsGroup>
 * ```
 */
declare const PaginationControlsGroup: react.ForwardRefExoticComponent<Omit<PaginationControlsGroupProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface PageMeta {
    /**
     * The first page in the pagination component.
     * @defaultValue 1
     */
    first: number;
    /**
     * The last page in the pagination component.
     * @defaultValue 	Math.min(page * pageSize, totalItems)
     */
    last: number;
    /**
     * The total number of pages in the pagination component.
     * @defaultValue Math.max(1, Math.ceil(totalItems / pageSize))
     */
    total: number;
}
interface RangeMeta {
    /**
     * The index of the first item on the current page.
     * @defaultValue (current - 1) * pageSize
     */
    firstItemIndex: number;
    /**
     * The index of the last item on the current page.
     * @defaultValue Math.min(firstItemIndex + pageSize - 1, totalItems - 1)
     */
    lastItemIndex: number;
    /**
     * The total number of items in the pagination component.
     * @defaultValue Math.max(1, Math.ceil(totalItems / pageSize))
     */
    totalItems: number;
    /**
     * The size of the page.
     */
    pageSize: number;
}

interface PaginationItemRangeTextProps extends PrimitivePropsWithRef<"div"> {
    /**
     * Optional custom format function for the range text.
     */
    rangeTextFormatFn?: (rangeMeta: RangeMeta) => ReactNode;
}
/**
 * A component that displays information about the current range of items being displayed.
 * @param props - props to be passed to the {@link PaginationItemRangeText} component
 * @see {@link PaginationItemRangeTextProps}
 *
 * @example
 * ```tsx
 * <PaginationItemRangeText rangeTextFormatFn={(rangeMeta) => (
 *   `${rangeMeta.firstItem} - ${rangeMeta.lastItem} of ${rangeMeta.totalItems}`
 * )} />
 * ```
 */
declare const PaginationItemRangeText: react.ForwardRefExoticComponent<Omit<PaginationItemRangeTextProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface PaginationNavigationGroupProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * A component responsible for grouping navigation elements in a pagination component.
 * @param props - props to be passed to the {@link PaginationNavigationGroup} component
 * @see {@link PaginationNavigationGroupProps}
 *
 * @example
 * ```tsx
 * <PaginationNavigationGroup>
 *	<PaginationArrowButton direction="prev" />
 *  <PaginationPageInput />
 *	<PaginationArrowButton direction="next" />
 * </PaginationNavigationGroup>
 * ```
 */
declare const PaginationNavigationGroup: react.ForwardRefExoticComponent<Omit<PaginationNavigationGroupProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface PaginationPageInputProps extends Omit<TextInputProps, "type" | "value" | "onValueChange" | "defaultValue"> {
}
/**
 * A component that provides input-based page navigation for the Pagination component.
 * @param props - props to be passed to the {@link PaginationPageInput} component
 * @see {@link PaginationPageInputProps}
 *
 * @example
 * ```tsx
 * <PaginationPageInput />
 * ```
 */
declare const PaginationPageInput: react.ForwardRefExoticComponent<PaginationPageInputProps & react.RefAttributes<HTMLInputElement>>;

type PaginationPageListProps = Omit<TabsProps, "kind" | "defaultValue" | "value" | "onValueChange" | "items"> & {
    /**
     * The total number of items to display.
     * This count includes ellipses and is necessary to prevent layout thrashing when changing the page.
     * For example, if set to 7 and current page is 2, will show: 1 2 3 4 5 ... 10
     * @defaultValue 7
     */
    renderedItemCount?: 5 | 6 | 7 | 8 | 9 | 10;
    /**
     * Override the list of page numbers to display. Can be useful for rendering tabs as links.
     */
    items?: (Omit<TabsProps["items"][number], "value"> & {
        value: number;
    })[];
};
/**
 * A component that provides a list of page numbers for navigation.
 * @param props - props to be passed to the {@link PaginationPageList} component
 * @see {@link PaginationPageListProps}
 *
 * @example
 * ```tsx
 * <PaginationPageList />
 * ```
 */
declare const PaginationPageList: react.ForwardRefExoticComponent<Omit<PaginationPageListProps, "ref"> & react.RefAttributes<HTMLElement | HTMLDivElement>>;

interface SelectItemProps extends MenuItemProps, MenuCheckboxItemProps {
    /**
     * The value given as data when submitted with a name.
     */
    value: string;
}
/**
 * The component that represents an item in the Select menu.
 * @param props - props to be passed to the {@link SelectItem} component
 * @see {@link SelectItemProps}
 *
 * @example
 * ```tsx
 * <SelectRoot>
 *   ...
 *  	<SelectContent>
 *  		<SelectItem value="1">Item 1</SelectItem>
 *  	</SelectContent>
 * </SelectRoot>
 * ```
 */
declare const SelectItem: react__default.ForwardRefExoticComponent<Omit<SelectItemProps, "ref"> & react__default.RefAttributes<HTMLLIElement>>;

interface SelectDefaultItem extends SelectItemProps {
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        SelectItem?: NativeElementAttributes<"li", typeof SelectItem>;
    };
}
interface SelectSectionEntry extends Omit<MenuSectionEntry, "items"> {
    /**
     * The items to render in the section.
     */
    items: (string | SelectDefaultItem)[];
}
type SelectEntry = string | SelectDefaultItem | SelectSectionEntry;
interface SingleSelectProps {
    /**
     * The value of the select when initially rendered. Use when you do not need to control the
     * state of the select.
     *
     * Use a string for single value selects and an array of strings for multiple value selects.
     */
    defaultValue?: string;
    /**
     * @remarks When `mutiple` is true the Select allows for multiple values to be selected.
     */
    multiple?: false;
    /**
     * Callback when the selected value of the select changes.
     *
     * @param value - The `value` of the selected item. For multiple value selects, this will
     * be an array of `value`s.
     */
    onValueChange?: (value: string) => void;
    /**
     * Controls the rendering of the selected select value in the trigger.
     *
     * By default the select will render the children of the selected item for a single value select.
     * For a multiple value select, the select renders the count of selected items.
     */
    renderValue?: (value: string, setValue: (value: string | ((prev: string) => string)) => void) => React.ReactNode;
    /**
     * The controlled value of the select. Must be used in conjunction with `onValueChange`.
     */
    value?: string;
}
/**
 * The props that overlap between the single and multiple value selects but differ in type. This
 * union allows us to ensure that props are not mixed and matched in types between the two.
 */
type SelectSingleAndMultipleProps = SingleSelectProps | {
    defaultValue?: string[];
    multiple: true;
    onValueChange?: (value: string[]) => void;
    renderValue?: (value: string[], setValue: (value: string[] | ((prev: string[]) => string[])) => void) => React.ReactNode;
    value?: string[];
} | {
    defaultValue?: string[];
    kind: "multiple";
    multiple?: true;
    onValueChange?: (value: string[]) => void;
    renderValue?: (value: string[], setValue: (value: string[] | ((prev: string[]) => string[])) => void) => React.ReactNode;
    value?: string[];
};

interface SelectContentProps extends Omit<MenuRootProps, "asChild"> {
    /**
     * Whether the Select trigger should be focused on hide.
     * @defaultValue `true`
     */
    autoFocusOnHide?: boolean;
    /**
     * Whether the Select content should be hidden when the escape key is pressed. Also accepts a function
     * that you can use to set `event.stopPropagation()`.
     * @defaultValue `true`
     */
    hideOnEscape?: boolean;
    /**
     * Whether the Select content should be rendered in a portal. This is useful when the Select content is a child of a fixed container.
     * @defaultValue true
     */
    portal?: boolean;
    /**
     * The Select to render the modal content in when `portal` is true.
     * @defaultValue document.body
     */
    portalContainer?: HTMLElement | null | ((element: HTMLElement) => HTMLElement | null);
}
/**
 * The component that pops out when the Select is open.
 * @param props - props to be passed to the {@link SelectContent} component
 * @see {@link SelectContentProps}
 *
 * @example
 * ```tsx
 * <SelectRoot>
 *   ...
 *   <SelectContent>
 *     <SelectItem>Item 1</SelectItem>
 *     <SelectItem>Item 2</SelectItem>
 *   </SelectContent>
 * </SelectRoot>
 * ```
 */
declare const SelectContent: react.ForwardRefExoticComponent<Omit<SelectContentProps, "ref"> & react.RefAttributes<HTMLMenuElement>>;

declare const SelectContext: react__default.Context<{
    size: "small" | "medium" | "large";
    disabled: boolean | undefined;
    readOnly: boolean | undefined;
}>;
declare function useSelectContext(): {
    size: "small" | "medium" | "large";
    disabled: boolean | undefined;
    readOnly: boolean | undefined;
};
interface SelectRootProps extends react__default.PropsWithChildren, Pick<SelectSingleAndMultipleProps, "multiple" | "defaultValue" | "onValueChange" | "value"> {
    /**
     * The open state of the Select when it is initially rendered. Use when you do not need to control its open state.
     */
    defaultOpen?: boolean;
    /**
     * The disabled state of the Select.
     */
    disabled?: boolean;
    /**
     * The callback to be called when the Select is opened or closed.
     */
    onOpenChange?: (open: boolean) => void;
    /**
     * The controlled open state of the Select
     */
    open?: boolean;
    /**
     * Whether the Select is read-only. A read-only Select will not allow the user to change the
     * selected value or view the menu.
     */
    readOnly?: boolean;
    /**
     * The side the Select menu will be positioned.
     * @defaultValue "bottom"
     */
    side?: "bottom" | "top" | "left" | "right";
    /**
     * The size of the select trigger. By default this will also control the `density` of the
     * `SelectContent` - to override this, use the `density` prop.
     * @defaultValue "medium"
     */
    size?: "small" | "medium" | "large";
}
/**
 * The component that wraps the Select.
 * @param props - props to be passed to the {@link SelectRoot} component
 * @see {@link SelectRootProps}
 *
 * @example
 * ```tsx
 * <SelectRoot>
 *   ...
 * </SelectRoot>
 * ```
 */
declare function SelectRoot({ children, defaultOpen, defaultValue: _defaultValue, disabled, multiple, onOpenChange, onValueChange, open, readOnly, side, size, value, }: SelectRootProps): react_jsx_runtime.JSX.Element;
declare namespace SelectRoot {
    var displayName: string;
}

declare const selectTrigger: (props?: class_variance_authority_types.ClassProp | undefined) => string;
type SelectTriggerVariantProps = VariantProps<typeof selectTrigger>;
interface SelectTriggerProps extends Omit<react__default.ComponentPropsWithoutRef<"button">, "children" | "disabled">, Pick<PolymorphicInputProps<"button">, "kind" | "status" | "dismissible" | "slotLeft" | "slotRight"> {
    /**
     * If you need to override the value rendered in the trigger you can pass it here as children. If
     * you don't pass children, the value will be rendered the same as its menu item.
     */
    renderValue?: (value: string | string[] | undefined, setValue: ((nextValue: string | string[]) => void) | ((nextValueFunc: (prevValue: string | string[]) => string | string[]) => void)) => react__default.ReactNode;
    /**
     * The name of the Select. When provided, the Select trigger will be a form control and will
     * render a hidden input with this name and the current value.
     */
    name?: string;
    /**
     * Placeholder text for the Select trigger
     */
    placeholder?: react__default.ReactNode;
    /**
     * Whether the Select is required
     */
    required?: boolean;
}
/**
 * The trigger of the Select. This is the component that is visible when the Select is closed.
 * @param props - props to be passed to the {@link SelectTrigger} component
 * @see {@link SelectTriggerProps}
 *
 * @example
 * ```tsx
 * <SelectRoot>
 * 	<SelectTrigger />
 *  	...
 * </SelectRoot>
 * ```
 *
 * @example with custom render value
 * ```tsx
 * <SelectRoot>
 * 	<SelectTrigger renderValue={(value, setValue) => <Component value={value} onDismiss={() => setValue("")} />} />
 *  	...
 * </SelectRoot>
 * ```
 */
declare const SelectTrigger: react__default.ForwardRefExoticComponent<SelectTriggerProps & react__default.RefAttributes<HTMLButtonElement>>;

interface BaseSelectProps extends Pick<SelectContentProps, "autoFocusOnHide" | "density" | "hideOnEscape" | "portal" | "portalContainer" | "onScrollToBottom">, Pick<SelectRootProps, "defaultOpen" | "defaultValue" | "disabled" | "readOnly" | "onOpenChange" | "open" | "side" | "size" | "value">, Pick<SelectTriggerProps, "dismissible" | "placeholder" | "required" | "slotLeft" | "slotRight" | "status">, Omit<MergedHoistedElementAttributes<[
    ["button", typeof SelectTrigger],
    ["menu", typeof SelectContent]
]>, "defaultValue" | "value"> {
    /**
     * @deprecated Use `multiple` instead. This prop will be removed in the next major version.
     */
    kind?: "single" | "multiple";
    /**
     * The kind of the Select trigger. Used to determine whether or not to render background colors and borders.
     * @defaultValue "flat"
     */
    triggerKind?: "floating" | "flat";
    /**
     * The items to render in the Select.
     */
    items: SelectEntry[];
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        SelectTrigger?: NativeElementAttributes<"button", typeof SelectTrigger>;
        SelectContent?: NativeElementAttributes<"menu", typeof SelectContent>;
    };
}
type SelectProps = BaseSelectProps & SelectSingleAndMultipleProps;
/**
 * A Select is a dropdown that allows the user to select a value from a list of options.
 * @param props - props to be passed to the {@link Select} component
 * @see {@link SelectProps}
 *
 * @example
 * ```tsx
 * // single select
 * <Select items={["a", "b", "c"]} />
 *
 * // multiple select
 * <Select items={["a", "b", "c"]} multiple />
 * ```
 */
declare const Select: react__default.ForwardRefExoticComponent<SelectProps & react__default.RefAttributes<HTMLButtonElement>>;

declare const SelectTestIds: {
    readonly SelectRoot: "nv-select-root";
    readonly SelectTrigger: "nv-select-trigger";
    readonly SelectContent: "nv-select-content";
    readonly SelectDismissButton: "nv-select-dismiss-button";
};

interface PaginationPageSizeSelectProps extends Omit<SelectProps, "defaultValue" | "value" | "kind" | "multiple" | "renderValue" | "onValueChange" | "items"> {
}
/**
 * A component that provides the ability to select the page size in pagination.
 * @param props - props to be passed to the {@link PaginationPageSizeSelect} component
 * @see {@link PaginationPageSizeSelectProps}
 *
 * @example
 * ```tsx
 * <PaginationPageSizeSelect />
 * ```
 */
declare const PaginationPageSizeSelect: react.ForwardRefExoticComponent<PaginationPageSizeSelectProps & react.RefAttributes<HTMLButtonElement>>;

interface PaginationRootProps extends PrimitivePropsWithRef<"div"> {
    /**
     * The total number of items. Used to calculate the number of pages and the item range text.
     */
    totalItems: number;
    /**
     * The initial value of the page. This is used when first rendering the component but does not maintain control over
     * state changes after initial rendering.
     * @defaultValue 1
     */
    defaultPage?: number;
    /**
     * The value of the page. This is used to control which item is open in a controlled component setup.
     * If not provided, the component will be uncontrolled and manage its own state internally.
     */
    page?: number;
    /**
     * Callback fired when the page changes.
     */
    onPageChange?: (page: number) => void;
    /**
     * The initial value of the page size. This is used when first rendering the component but does not maintain control over
     * state changes after initial rendering.
     * @defaultValue 10
     */
    defaultPageSize?: number;
    /**
     * The value of the page size. This is used to control which item is open in a controlled component setup.
     * If not provided, the component will be uncontrolled and manage its own state internally.
     */
    pageSize?: number;
    /**
     * Callback fired when the page size changes.
     */
    onPageSizeChange?: (pageSize: number) => void;
    /**
     * Override metadata for the page range. Useful for overriding the default page range bounds.
     * @example
     * ```json
     * {
     * 	"first": 5, // The first visible page in the item range text displayed.
     * 	"last": 15, // The last visible page in the item range text displayed.
     * 	"total": 20 // The total number of pages in the pagination component.
     * }
     * ```
     */
    pageMeta?: PageMeta;
    /**
     * Override meta data for the item range. Useful for overriding the default item range bounds.
     * @example
     * ```json
     * {
     * 	"firstItemIndex": 5, // The first visible item in the current range.
     * 	"lastItemIndex": 15, // The last visible item in the current range.
     * 	"totalItems": 20 // The total number of items in the pagination component.
     * }
     * ```
     */
    rangeMeta?: RangeMeta;
    /**
     * The available page sizes for the page size select
     * @defaultValue [10, 25, 50, 100]
     */
    pageSizeOptions?: number[];
}
/**
 * The root component for pagination that provides layout and structure.
 * @param props - props to be passed to the {@link PaginationRoot} component
 * @see {@link PaginationRootProps}
 *
 * @example
 * ```tsx
 * // controlled
 * <PaginationRoot totalItems={20} page={page} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize}>
 *   {/* Pagination components *\/}
 * </PaginationRoot>
 *
 * // uncontrolled
 * <PaginationRoot totalItems={20} defaultPage={1} defaultPageSize={10}>
 *   {/* Pagination components *\/}
 * </PaginationRoot>
 * ```
 */
declare const PaginationRoot: react.ForwardRefExoticComponent<Omit<PaginationRootProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare const pagination: (props?: ({
    kind?: "input" | "tabs" | "simple" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type PaginationVariantProps = VariantProps<typeof pagination>;
type PaginationKind = Exclude<PaginationVariantProps["kind"], "custom">;
type PaginationAttributes<K extends PaginationKind, DC extends boolean> = {
    PaginationNavigationGroup?: NativeElementAttributes<"div", typeof PaginationNavigationGroup>;
    PaginationControlsGroup?: DC extends true ? NativeElementAttributes<"div", typeof PaginationControlsGroup> : never;
    PaginationItemRangeText?: DC extends true ? NativeElementAttributes<"div", typeof PaginationItemRangeText> : never;
    PaginationPageSizeSelect?: DC extends true ? NativeElementAttributes<"button", typeof PaginationPageSizeSelect> : never;
    PaginationPageList?: K extends "tabs" ? NativeElementAttributes<"div", typeof PaginationPageList> : never;
    PaginationPageInput?: K extends "input" ? NativeElementAttributes<"input", typeof PaginationPageInput> : never;
};
interface PaginationProps<K extends PaginationKind, DC extends boolean> extends PaginationRootProps {
    /**
     * The kind of pagination to render. Determines what components are displayed.
     * @defaultValue "input"
     */
    kind?: K;
    /**
     * Whether to display the controls (page size select and associated item range text)
     * @defaultValue false
     */
    displayControls?: DC;
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: PaginationAttributes<K, DC>;
    /**
     * Optional custom format function for the range text.
     */
    rangeTextFormatFn?: DC extends true ? PaginationItemRangeTextProps["rangeTextFormatFn"] : never;
    /**
     * The total number of items to display.
     * This count includes ellipses and is necessary to prevent layout thrashing when changing the page.
     * For example, if set to 7 and current page is 2, will show: 1 2 3 4 5 ... 10
     * @defaultValue 7
     */
    renderedItemCount?: K extends "tabs" ? PaginationPageListProps["renderedItemCount"] : never;
    /**
     * Override the list of page numbers to display. Useful for rendering tabs as links.
     */
    items?: K extends "tabs" ? PaginationPageListProps["items"] : never;
}
/**
 * A pagination component that provides different styles of navigation for paginated content.
 * @param props - props to be passed to the {@link Pagination} component
 * @see {@link PaginationProps}
 *
 * @example
 * ```tsx
 * // controlled
 * <Pagination
 *   kind="input"
 *   totalItems={100}
 *   page={1}
 *   pageSize={10}
 *   onPageChange={(page) => console.log(page)}
 *   onPageSizeChange={(pageSize) => console.log(pageSize)}
 * />
 *
 * // uncontrolled
 * <Pagination
 *   kind="input"
 *   totalItems={100}
 *   defaultPage={1}
 *   defaultPageSize={10}
 * />
 * ```
 */
declare const Pagination: react.ForwardRefExoticComponent<(Omit<PaginationProps<"input", true>, "ref"> | Omit<PaginationProps<"simple", true>, "ref"> | Omit<PaginationProps<"tabs", true>, "ref"> | Omit<PaginationProps<"input", false>, "ref"> | Omit<PaginationProps<"simple", false>, "ref"> | Omit<PaginationProps<"tabs", false>, "ref">) & react.RefAttributes<HTMLDivElement>>;

interface PaginationArrowButtonProps extends Omit<ButtonProps, "kind" | "color" | "size"> {
    /**
     * The direction that the button should navigate to. Determines the icon and label of the button.
     */
    direction: "first" | "previous" | "next" | "last";
    /**
     * Whether to show the text label of the button.
     */
    showText?: boolean;
}
/**
 * A button that navigates to a page in the pagination.
 * @param props - props to be passed to the {@link PaginationArrowButton} component
 * @see {@link PaginationArrowButtonProps}
 *
 * @example
 * ```tsx
 * <PaginationArrowButton direction="next" />
 * ```
 */
declare const PaginationArrowButton: react.ForwardRefExoticComponent<Omit<PaginationArrowButtonProps, "ref"> & react.RefAttributes<HTMLButtonElement>>;

declare const PaginationTestIds: {
    readonly PaginationRoot: "nv-pagination-root";
    readonly PaginationPageSizeSelect: "nv-pagination-page-size-select";
    readonly PaginationItemRangeText: "nv-pagination-item-range-text";
    readonly PaginationPageList: "nv-pagination-page-list";
    readonly PaginationPageListItem: "nv-pagination-page-list-item";
    readonly PaginationEllipsis: "nv-pagination-ellipsis";
    readonly PaginationArrowButton: "nv-pagination-arrow-button";
    readonly PaginationPreviousPageButton: "nv-pagination-previous-page-button";
    readonly PaginationNextPageButton: "nv-pagination-next-page-button";
    readonly PaginationLastPageButton: "nv-pagination-last-page-button";
    readonly PaginationPageInput: "nv-pagination-page-input";
    readonly PaginationNavigationGroup: "nv-pagination-navigation-group";
    readonly PaginationControlsGroup: "nv-pagination-controls-group";
};

interface PanelContentProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * Content wrapper component for a panel. This is the container that holds all of the child components
 * within the content of the panel.
 * @param props - props to be passed to the {@link PanelContent} component
 * @see {@link PanelContentProps}
 * @example
 * ```tsx
 * <PanelContent>
 *   Here is some stuff.
 *   <TextInput label="Name" placeholder="Enter your name" />
 * </PanelContent>
 * ```
 */
declare const PanelContent: react__default.ForwardRefExoticComponent<Omit<PanelContentProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

interface PanelFooterProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * Footer of a panel.
 * @param props - props to be passed to the {@link PanelFooter} component
 * @see {@link PanelFooterProps}
 *
 * @example
 * ```tsx
 * <PanelFooter>
 * 	<Flex align="center" justify="end" gap="sm">
 * 		<Button color="neutral" kind="tertiary">Cancel</Button>
 * 		<Button>Save</Button>
 * 	</Flex>
 * </PanelFooter>
 * ```
 */
declare const PanelFooter: react.ForwardRefExoticComponent<Omit<PanelFooterProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface PanelHeaderProps extends PrimitivePropsWithRef<"div"> {
    /**
     * The content of the PanelHeader.
     * This will usually be composed of components such as PanelIcon and PanelHeading.
     */
    children?: react__default.ReactNode;
}
/**
 * Text wrapper component for a panel. This is the container that holds all of the child components
 * within the content of the panel. It will wrap the and style the header and text of the panel.
 * @param props - props to be passed to the {@link PanelHeader} component
 * @see {@link PanelHeaderProps}
 * @example
 * ```tsx
 * // Panels that contain a title and description
 * <PanelHeader>
 *   <PanelIcon>Global panel icon</PanelIcon>
 *   <PanelHeading>Global panel title</PanelHeading>
 * </PanelHeader>
 * ```
 * @example
 * ```tsx
 * // Panels that contain only a subheading
 * <PanelHeader>
 * 	<PanelHeading>Global panel title</PanelHeading>
 * </PanelHeader>
 * ```
 */
declare const PanelHeader: react__default.ForwardRefExoticComponent<Omit<PanelHeaderProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

interface PanelHeadingProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * Main heading component for any panel.
 * @param props - props to be passed to the {@link PanelHeading} component
 * @see {@link PanelHeadingProps}
 */
declare const PanelHeading: react__default.ForwardRefExoticComponent<Omit<PanelHeadingProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

interface PanelIconProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * Icon component for any of the {@link PanelRoot} components.
 * It is recommended to use the NvidiaGUIIcon component from the `@nv-brand-assets` package.
 * {@link https://brand-assets.gitlab-master-pages.nvidia.com/nvidia-gui-icons/}
 *
 * @param props - props to be passed to the {@link PanelIcon} component
 * @see {@link PanelIconProps}
 */
declare const PanelIcon: react__default.ForwardRefExoticComponent<Omit<PanelIconProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

declare const panelRoot: (props?: ({
    density?: "compact" | "standard" | "spacious" | null | undefined;
    elevation?: "high" | "low" | "higher" | "mid" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type PanelVariantProps = VariantProps<typeof panelRoot>;
interface PanelRootProps extends PrimitivePropsWithRef<"div"> {
    /**
     * The density of the panel
     */
    density?: PanelVariantProps["density"];
    /**
     * The elevation of the panel
     * @defaultValue "mid"
     */
    elevation?: PanelVariantProps["elevation"];
}
/**
 * Contains all the parts of a panel. The PanelRoot acts as the main container
 * for all panel components and accepts density and elevation variants.
 * @param props - props to be passed to the {@link PanelRoot} component
 * @see {@link PanelRootProps}
 *
 * @example
 * ```tsx
 * <PanelRoot density="compact" elevation="mid">
 *   <PanelHeader>
 *     <PanelIcon>
 *       <InfoCircle />
 *     </PanelIcon>
 *     <PanelHeading>Panel Title</PanelHeading>
 *   </PanelHeader>
 *   <PanelContent>
 *     <p>Panel content goes here</p>
 *   </PanelContent>
 *   <PanelFooter>
 *     <Button>Action</Button>
 *   </PanelFooter>
 * </PanelRoot>
 * ```
 */
declare const PanelRoot: react.ForwardRefExoticComponent<Omit<PanelRootProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface PanelProps extends SlottablePropsWithRef<"div"> {
    /**
     * The density of the panel
     */
    density?: PanelRootProps["density"];
    /**
     * The elevation of the panel
     * @defaultValue "mid"
     */
    elevation?: PanelRootProps["elevation"];
    /**
     * The slot for the heading of the panel
     */
    slotHeading?: React.ReactNode;
    /**
     * Icon to be displayed in the panel
     */
    slotIcon?: React.ReactNode;
    /**
     * The slot for the footer of the panel
     */
    slotFooter?: React.ReactNode;
    /**
     * Attributes to be passed to the panel internal components
     */
    attributes?: {
        PanelHeader?: NativeElementAttributes<"div", typeof PanelHeader>;
        PanelIcon?: NativeElementAttributes<"div", typeof PanelIcon>;
        PanelHeading?: NativeElementAttributes<"div", typeof PanelHeading>;
        PanelContent?: NativeElementAttributes<"div", typeof PanelContent>;
        PanelFooter?: NativeElementAttributes<"div", typeof PanelFooter>;
    };
}
/**
 * A panel serves as a generic container to hold custom content for a product.
 *
 * @param props - props to be passed to the {@link Panel} component
 * @see {@link PanelProps}
 *
 * @example
 * ```tsx
 * <Panel
 *   elevation="mid"
 *   density="compact"
 *   slotIcon={<Icon name="info" />}
 *   slotHeading="This is a panel"
 *   slotFooter={<Button>Click me</Button>}
 * >
 *     <div>Content goes here</div>
 * </Panel>
 * ```
 */
declare const Panel: react.ForwardRefExoticComponent<Omit<PanelProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare const PanelTestIds: {
    readonly PanelRoot: "nv-panel-root";
    readonly PanelIcon: "nv-panel-icon";
    readonly PanelHeader: "nv-panel-header";
    readonly PanelHeading: "nv-panel-header-heading";
    readonly PanelContent: "nv-panel-content";
    readonly PanelFooter: "nv-panel-footer";
};

declare const progressBar: (props?: ({
    kind?: "indeterminate" | "determinate" | null | undefined;
    size?: "small" | "medium" | "large" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type ProgressBarVariantProps = VariantProps<typeof progressBar>;
interface ProgressBarPropsBase extends Omit<ComponentPropsWithRef<"div">, "children"> {
    /**
     * The size of the progress bar.
     * @defaultValue "medium"
     */
    size?: ProgressBarVariantProps["size"];
}
interface IndeterminateProgressBar {
    /**
     * The kind of progress bar. Can be either `determinate` which is static and shows the current progress, or `indeterminate` which is animated and does not show progress.
     * @defaultValue "determinate"
     */
    kind: "indeterminate";
    /**
     * A `number` that indicates the current progress based on a percentage to 100. Numbers \>= 100 will show a full bar.
     * i.e., if you wish the progress bar to be halfway filled, the number would be `50`.
     * @remarks
     * Only applicable if `kind` is `determinate`.
     */
    value?: never;
}
interface DeterminateProgressBar {
    /**
     * The kind of progress bar. Can be either `determinate` which is static and shows the current progress, or `indeterminate` which is animated and does not show progress.
     * @defaultValue "determinate"
     */
    kind?: "determinate";
    /**
     * A `number` that indicates the current progress based on a percentage to 100. Numbers \>= 100 will show a full bar.
     * i.e., if you wish the progress bar to be halfway filled, the number would be `50`.
     * @remarks
     * Only applicable if `kind` is `determinate`.
     * @defaultValue `0`
     */
    value: number;
}
type ProgressBarProps = ProgressBarPropsBase & (DeterminateProgressBar | IndeterminateProgressBar) & ({
    "aria-label": string;
    "aria-labelledby"?: never;
} | {
    "aria-labelledby": string;
    "aria-label"?: never;
});
/**
 * Show a progress bar when a process or operation has a long wait time.
 * It communicates how much of the process has been completed and how much is left.
 * Common scenarios when a progress bar is displayed include downloading, uploading, submitting, or loading data.
 * @param props - props to be passed to the {@link ProgressBar} component
 * @see {@link ProgressBarProps}
 *
 * @example
 * ```tsx
 * const [progress, setProgress] = useState(0);
 *
 * useEffect(() => {
 *   const interval = setInterval(() => {
 *     setProgress((prev) => (prev + 10));
 *   }, 1000);
 *
 *   return () => clearInterval(interval);
 * }, []);
 *
 * return (
 *   <ProgressBar value={progress} size="large" />
 * );
 * ```
 *
 * @example
 * ```tsx
 * // indeterminate progress bar
 * <ProgressBar kind="indeterminate" />
 * ```
 */
declare const ProgressBar: react.ForwardRefExoticComponent<(Omit<ProgressBarPropsBase & IndeterminateProgressBar & {
    "aria-label": string;
    "aria-labelledby"?: never;
}, "ref"> | Omit<ProgressBarPropsBase & IndeterminateProgressBar & {
    "aria-labelledby": string;
    "aria-label"?: never;
}, "ref"> | Omit<ProgressBarPropsBase & DeterminateProgressBar & {
    "aria-label": string;
    "aria-labelledby"?: never;
}, "ref"> | Omit<ProgressBarPropsBase & DeterminateProgressBar & {
    "aria-labelledby": string;
    "aria-label"?: never;
}, "ref">) & react.RefAttributes<HTMLDivElement>>;

declare const ProgressBarTestIds: {
    readonly Track: "nv-progress-bar-track";
    readonly Indicator: "nv-progress-bar-indicator";
};

interface SegmentedControlRootProps extends PrimitivePropsWithRef<"div"> {
    /**
     * The controlled stateful value of the item that is pressed. Must be used with onValueChange.
     */
    value?: string;
    /**
     * The value of the item that is pressed when initially rendered. Use
     * `defaultValue` if you do not need to control the state of the segmented control.
     */
    defaultValue?: string;
    /**
     * The callback that fires when the selected value of the segmented control changes.
     */
    onValueChange?: (value: string) => void;
    /**
     * The size of the segmented control. Uses same variants as Button and ButtonGroup.
     */
    size?: "tiny" | "small" | "medium" | "large";
}
/**
 * The container of the segmented control, which houses the clickable controls/items.
 * @param props - props to be passed to the {@link SegmentedControlRoot} component
 * @see {@link SegmentedControlRootProps}
 *
 * @example
 * ```tsx
 * <SegmentedControlRoot>
 * 	<SegmentedControlItem />
 * </SegmentedControlRoot>
 * ```
 */
declare const SegmentedControlRoot: react.ForwardRefExoticComponent<Omit<SegmentedControlRootProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface SegmentedControlProps extends PropsWithChildren<NativeElementAttributes<"div", typeof SegmentedControlRoot>> {
    /**  The options to be displayed in the SegmentedControl
     **/
    items: ({
        value: string;
        children: React.ReactNode;
    } | string)[];
    /**
     * The default value of the SegmentedControl on initial load.
     * If undeclared, defaults to the first item in the `items` array.
     */
    defaultValue?: string;
    /**
     * The current internal value of the SegmentedControl
     */
    value?: string;
    /**
     * The method to call when the value of the control changes
     * @param value - the currently selected control value
     */
    onValueChange?: (value: string) => void;
    /**
     * The size of the SegmentedControl
     * @defaultValue "medium"
     */
    size?: "tiny" | "small" | "medium" | "large";
}
/**
 * A segmented control component.
 * @param props - props to be passed to the {@link SegmentedControl} component
 * @see {@link SegmentedControlProps}
 *
 * @example
 * ```tsx
 * <SegmentedControl size="small" items={[
            { children: "Apple", value: "1" },
            { children: "Banana", value: "2" },
            { children: "Cherry", value: "3" },
        ]} />
 * ```
 */
declare const SegmentedControl: react.ForwardRefExoticComponent<Omit<SegmentedControlProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface SegmentedControlItemProps extends ButtonProps {
    /**
     * Whether the item is selected or not.
     */
    selected: boolean;
    /**
     * The value to return when the item is selected.
     */
    value: string;
}
/**
 * The item to be clicked in the segmented control. Wraps a tertiary Button.
 * @param props - props to be passed to the {@link SegmentedControlItem} component
 * @see {@link SegmentedControlItemProps}
 *
 * @example
 * ```tsx
 * <SegmentedControlItem value={val} selected={internalValue === val} />
 * ```
 */
declare const SegmentedControlItem: react.ForwardRefExoticComponent<Omit<SegmentedControlItemProps, "ref"> & react.RefAttributes<HTMLButtonElement>>;

declare const SegmentedControlTestIds: {
    readonly SegmentedControlRoot: "nv-segmented-control-root";
    readonly SegmentedControlItem: "nv-segmented-control-item";
};

declare const sidePanelContent: (props?: ({
    density?: "compact" | "standard" | "spacious" | null | undefined;
    side?: "left" | "right" | null | undefined;
    bordered?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type SidePanelContentVariantProps = VariantProps<typeof sidePanelContent>;
interface SidePanelContentProps extends SlottablePropsWithRef<"div">, DensityVariantProps {
    /**
     * Which side the panel should appear from
     * @defaultValue "right"
     */
    side?: SidePanelContentVariantProps["side"];
    /**
     * Whether the panel content should be rendered in a portal. This is useful when the panel content is a child of a fixed container.
     * @defaultValue true
     */
    portal?: boolean;
    /**
     * The container to render the panel content in when `portal` is true.
     * @defaultValue document.body
     */
    portalContainer?: Element | DocumentFragment | null;
    /**
     * Whether the panel should close when clicking outside of it.
     * @defaultValue true
     * @remarks
     * To fully prevent panel closing, also configure:
     * - Set `hideCloseButton` to `true` on the `SidePanelRoot` component
     * - Use `event.preventDefault` in the `onEscapeKeyDown` handler to prevent escape key closing
     */
    closeOnClickOutside?: boolean;
    /**
     * Event handler called when the escape key is down. It can be prevented by calling `event.preventDefault`.
     * @remarks
     * To fully prevent panel closing, also configure:
     * - Set `hideCloseButton` to `true` on the `SidePanelRoot` component
     * - Set `closeOnClickOutside` to `false` to prevent clicking outside from closing
     */
    onEscapeKeyDown?: (event: KeyboardEvent) => void;
    /**
     * When true, adds a border between the main content and the header/footer
     * @defaultValue false
     */
    bordered?: boolean;
    /**
     * Event handler called when a pointer event occurs outside the bounds of the component. It can be prevented by calling `event.preventDefault`.
     */
    onPointerDownOutside?: (event: Event) => void;
    /**
     * Event handler called when an interaction event occurs outside the bounds of the component. It can be prevented by calling `event.preventDefault`.
     */
    onInteractOutside?: (event: Event) => void;
    /**
     * Event handler called when focus moves into the component after opening. It can be prevented by calling `event.preventDefault`.
     */
    onOpenAutoFocus?: (event: Event) => void;
    /**
     * Forces the content to be mounted in the DOM regardless of the `open` state.
     * When true, this overrides the default visibility behavior and keeps content mounted,
     * making it useful for custom animation control with React animation libraries.
     * @defaultValue undefined
     */
    forceMount?: true;
}
/**
 * Contains content to be rendered in the open side panel.
 * @param props - props to be passed to the {@link SidePanelContent} component
 * @see {@link SidePanelContentProps}
 *
 * @example
 * ```tsx
 * <SidePanelContent>
 * 	<SidePanelHeading />
 * 	<SidePanelNavigation />
 * 	<SidePanelMain />
 * 	<SidePanelFooter />
 * </SidePanelContent>
 * ```
 */
declare const SidePanelContent: react.ForwardRefExoticComponent<Omit<SidePanelContentProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface SidePanelFooterProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * Footer of a side panel.
 * @param props - props to be passed to the {@link SidePanelFooter} component
 * @see {@link SidePanelFooterProps}
 *
 * @example
 * ```tsx
 * <SidePanelFooter>
 * 	<Button color="neutral" kind="tertiary">Cancel</Button>
 * 	<Button>Save</Button>
 * </SidePanelFooter>
 * ```
 */
declare const SidePanelFooter: react.ForwardRefExoticComponent<Omit<SidePanelFooterProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface SidePanelHeadingProps extends PrimitivePropsWithRef<"h2"> {
}
/**
 * Heading (or title) of a side panel.
 * @param props - props to be passed to the {@link SidePanelHeading} component
 * @see {@link SidePanelHeadingProps}
 *
 * @example
 * ```tsx
 * <SidePanelHeading>
 * 	Side Panel Heading
 * </SidePanelHeading>
 * ```
 */
declare const SidePanelHeading: react.ForwardRefExoticComponent<Omit<SidePanelHeadingProps, "ref"> & react.RefAttributes<HTMLHeadingElement>>;

interface SidePanelMainProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * Body of a side panel.
 * @param props - props to be passed to the {@link SidePanelMain} component
 * @see {@link SidePanelMainProps}
 *
 * @example
 * ```tsx
 * <SidePanelMain>
 * 	Side Panel Body
 * </SidePanelMain>
 * ```
 */
declare const SidePanelMain: react.ForwardRefExoticComponent<Omit<SidePanelMainProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface SidePanelNavigationProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * Side panel navigation should be rendered within this component, and between the heading and
 * main content.
 * @param props - props to be passed to the {@link SidePanelNavigation} component
 * @see {@link SidePanelNavigationProps}
 *
 * @example
 * ```tsx
 * <SidePanelContent>
 *   <SidePanelHeading>...</SidePanelHeading>
 *   <SidePanelNavigation>
 *     Side Panel Navigation - Tabs or breadcrumbs, etc.
 *   </SidePanelNavigation>
 *   <SidePanelMain>...</SidePanelMain>
 * </SidePanelContent>
 * ```
 */
declare const SidePanelNavigation: react.ForwardRefExoticComponent<Omit<SidePanelNavigationProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface SidePanelRootProps extends PropsWithChildren {
    /**
     * The open state of the side panel when it is initially rendered. Use when you do not need to control its open state.
     * @defaultValue false
     */
    defaultOpen?: boolean;
    /**
     * The controlled open state of the side panel. Must be used in conjunction with `onOpenChange`.
     */
    open?: boolean;
    /**
     * Event handler called when the open state of the side panel changes.
     */
    onOpenChange?: (open: boolean) => void;
    /**
     * The modality of the side panel. When set to `true`, interaction with outside elements will be disabled and only side panel content will be visible to screen readers.
     * @defaultValue false
     */
    modal?: boolean;
    /**
     * When true, hides the side panel's close button. Useful for panels that should not be dismissible.
     * @remarks
     * To fully prevent panel closing, also configure in `SidePanelContent`:
     * - Use `event.preventDefault` in the `onEscapeKeyDown` handler to prevent escape key closing
     * - Set `closeOnClickOutside` to `false` to prevent clicking outside from closing
     */
    hideCloseButton?: boolean;
}
/**
 * Contains all the parts of a side panel.
 * @param props - props to be passed to the {@link SidePanelRoot} component
 * @see {@link SidePanelRootProps}
 *
 * @example
 * ```tsx
 * <SidePanelRoot>
 *  <SidePanelTrigger />
 *  <SidePanelContent>
 * 		<SidePanelHeading />
 * 		<SidePanelMain />
 * 		<SidePanelFooter />
 * 	</SidePanelContent>
 * </SidePanelRoot>
 * ```
 */
declare const SidePanelRoot: {
    ({ open, onOpenChange, defaultOpen, modal, children, hideCloseButton, }: SidePanelRootProps): react_jsx_runtime.JSX.Element;
    displayName: string;
};

interface SidePanelTriggerProps extends PrimitivePropsWithRef<"button"> {
}
/**
 * The button that opens the side panel.
 * @param props - props to be passed to the {@link SidePanelTrigger} component
 * @see {@link SidePanelTriggerProps}
 *
 * @example
 * ```tsx
 * <SidePanelTrigger>
 * 	Open Side Panel
 * </SidePanelTrigger>
 * ```
 *
 * @example
 * ```tsx
 * <SidePanelTrigger asChild>
 * 	<Button>Open Side Panel</Button>
 * </SidePanelTrigger>
 * ```
 */
declare const SidePanelTrigger: react.ForwardRefExoticComponent<Omit<SidePanelTriggerProps, "ref"> & react.RefAttributes<HTMLButtonElement>>;

interface SidePanelProps extends PropsWithChildren<Pick<SidePanelContentProps, "density" | "side" | "portal" | "portalContainer" | "closeOnClickOutside" | "onEscapeKeyDown" | "bordered" | "onPointerDownOutside" | "onInteractOutside" | "onOpenAutoFocus" | "forceMount"> & Pick<SidePanelRootProps, "defaultOpen" | "open" | "onOpenChange" | "modal" | "hideCloseButton"> & NativeElementAttributes<"div", typeof SidePanelContent>> {
    /**
     * The content to render in the panel trigger.
     */
    slotTrigger?: React.ReactNode;
    /**
     * The content to render in the panel heading. If not provided, the panel will render empty space to make room for the close button.
     */
    slotHeading?: React.ReactNode;
    /**
     * The content to render in the panel footer.
     */
    slotFooter?: React.ReactNode;
    /**
     * A slot that is rendered between the heading and main content. This slot is intended to be used for
     * navigation content, such as tabs or breadcrumbs.
     */
    slotNavigation?: React.ReactNode;
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        SidePanelTrigger?: NativeElementAttributes<"button", typeof SidePanelTrigger>;
        SidePanelHeading?: NativeElementAttributes<"div", typeof SidePanelHeading>;
        SidePanelNavigation?: NativeElementAttributes<"div", typeof SidePanelNavigation>;
        SidePanelMain?: NativeElementAttributes<"div", typeof SidePanelMain>;
        SidePanelFooter?: NativeElementAttributes<"div", typeof SidePanelFooter>;
    };
}
/**
 * A dialog pinned to the left or right side of the screen that can be triggered by a button or other element.
 * @param props - props to be passed to the SidePanel component
 * @see {@link SidePanelProps}
 *
 * @example
 * ```tsx
 * <SidePanel
 * 	slotTrigger={<Button>Open SidePanel</Button>}
 * 	slotHeading="SidePanel Heading"
 * 	slotFooter={
 * 		<Flex align="center" justify="end" gap="density-sm">
 * 			<Button kind="tertiary">Cancel</Button>
 * 			<Button color="brand">Save</Button>
 * 		</Flex>
 * 	}
 * >
 * 	<p>Your SidePanel Content</p>
 * </SidePanel>
 * ```
 */
declare const SidePanel: react.ForwardRefExoticComponent<Omit<SidePanelProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare const SidePanelTestIds: {
    readonly SidePanelRoot: "nv-side-panel-root";
    readonly SidePanelTrigger: "nv-side-panel-trigger";
    readonly SidePanelContent: "nv-side-panel-content";
    readonly SidePanelHeading: "nv-side-panel-heading";
    readonly SidePanelNavigation: "nv-side-panel-navigation";
    readonly SidePanelMain: "nv-side-panel-main";
    readonly SidePanelFooter: "nv-side-panel-footer";
};

declare const skeleton: (props?: ({
    kind?: "circle" | "line" | "pill" | null | undefined;
    animated?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface SkeletonProps extends Omit<PrimitivePropsWithRef<"div">, "children"> {
    /**
     * The primary kind of skeleton to build a UI that best matches your component.
     */
    kind?: Skeleton["kind"];
    /**
     * If true, the Skelton will pulse. All skeletons will pulse at the same rhythm
     * @defaultValue true
     */
    animated?: boolean;
}
type Skeleton = VariantProps<typeof skeleton>;
/**
 * A skeleton component is a placeholder that mimics the layout of content while it loads, giving users a sense of the structure and reducing perceived wait time.
 * Always try and make the skeleton components as simular in size and shape to the dynamic content as you can
 * @param props - props to be passed to the {@link Skeleton} component
 * @see {@link SkeletonProps}
 * @example
 * ```tsx
 *  <Skeleton kind="circle" className="avatar-skeleton"/>
 * ```
 */
declare const Skeleton: react.ForwardRefExoticComponent<Omit<SkeletonProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare const SkeletonTestIds: {
    readonly Skeleton: "nv-skeleton";
};

interface SliderRangeProps$1 extends PrimitivePropsWithRef<"span"> {
}
/**
 * The filled part of the slider track.
 * @param props - props to be passed to the {@link SliderRange} component
 * @see {@link SliderRangeProps}
 */
declare const SliderRange: react.ForwardRefExoticComponent<Omit<SliderRangeProps$1, "ref"> & react.RefAttributes<HTMLSpanElement>>;

interface SliderRootBaseProps extends Omit<PrimitivePropsWithRef<"span">, "defaultValue"> {
    /**
     * The orientation of the slider.
     * @defaultValue "horizontal"
     */
    orientation?: "horizontal" | "vertical";
    /**
     * When `true`, prevents the user from interacting with the slider.
     * @defaultValue false
     */
    disabled?: boolean;
    /**
     * The minimum value for the range.
     * @defaultValue 0
     */
    min?: number;
    /**
     * The maximum value for the range.
     * @defaultValue 100
     */
    max?: number;
    /**
     * The stepping interval.
     * @defaultValue 1
     */
    step?: number;
    /**
     * The minimum permitted steps between multiple thumbs. Only applicable for range sliders.
     */
    minStepsBetweenThumbs?: number;
    /**
     * The name of the slider. Submitted with its owning form as part of a name/value pair.
     */
    name?: string;
    /**
     * The ID of the form that the slider belongs to. If omitted, the slider will be associated with a parent form if one exists.
     */
    form?: string;
}
interface SliderRootRangeProps extends SliderRootBaseProps {
    /**
     * The value of the slider when initially rendered. Use when you do not need to control the state of the slider.
     */
    defaultValue?: [number, number];
    /**
     * The controlled value of the slider. Must be used in conjunction with `onValueChange`.
     */
    value?: [number, number];
    /**
     * Event handler called when the value changes.
     */
    onValueChange?: (value: [number, number]) => void;
    /**
     * Event handler called when the value changes at the end of an interaction. Useful when you only need to capture a final value e.g. to update a backend service.
     */
    onValueCommit?: (value: [number, number]) => void;
    /**
     * The kind of slider. Can be either `single` or `range`.
     * @defaultValue "single"
     */
    kind: "range";
}
interface SliderRootSingleProps extends SliderRootBaseProps {
    /**
     * The value of the slider when initially rendered. Use when you do not need to control the state of the slider.
     */
    defaultValue?: number;
    /**
     * The controlled value of the slider. Must be used in conjunction with `onValueChange`.
     */
    value?: number;
    /**
     * Event handler called when the value changes.
     */
    onValueChange?: (value: number) => void;
    /**
     * Event handler called when the value changes at the end of an interaction. Useful when you only need to capture a final value e.g. to update a backend service.
     */
    onValueCommit?: (value: number) => void;
    /**
     * The kind of slider. Can be either `single` or `range`.
     * @defaultValue "single"
     */
    kind?: "single";
}
type SliderRootProps = SliderRootSingleProps | SliderRootRangeProps;
/**
 * The root container for a slider.
 * @param props - props to be passed to the {@link SliderRoot} component
 * @see {@link SliderRootProps}
 */
declare const SliderRoot: react.ForwardRefExoticComponent<(Omit<SliderRootRangeProps, "ref"> | Omit<SliderRootSingleProps, "ref">) & react.RefAttributes<HTMLSpanElement>>;

interface SliderStepsProps extends Omit<ComponentPropsWithRef<"span">, "children"> {
    /**
     * Callback function to format the step value before displaying it.
     */
    stepFormatFn?: (value: number) => string;
    /**
     * The position of the steps relative to the slider.
     * @defaultValue "bottom" for horizontal, "right" for vertical
     */
    position?: "bottom" | "left" | "right";
    /**
     * The interval at which to display step markers. When not provided, uses the slider's step value.
     */
    stepInterval?: number;
    /**
     * Custom array of step values to display. When provided, overrides both step and stepInterval.
     */
    customSteps?: number[];
}
/**
 * Displays the step marks below or to the side of the slider.
 * @param props - props to be passed to the {@link SliderSteps} component
 * @see {@link SliderStepsProps}
 */
declare const SliderSteps: react.ForwardRefExoticComponent<Omit<SliderStepsProps, "ref"> & react.RefAttributes<HTMLSpanElement>>;

interface SliderThumbProps extends PrimitivePropsWithRef<"span"> {
}
/**
 * The draggable thumb for the slider.
 * @param props - props to be passed to the {@link SliderThumb} component
 * @see {@link SliderThumbProps}
 */
declare const SliderThumb: react.ForwardRefExoticComponent<Omit<SliderThumbProps, "ref"> & react.RefAttributes<HTMLSpanElement>>;

interface SliderTrackProps extends PrimitivePropsWithRef<"span"> {
}
/**
 * The track component that contains the slider range.
 * @param props - props to be passed to the {@link SliderTrack} component
 * @see {@link SliderTrackProps}
 */
declare const SliderTrack: react.ForwardRefExoticComponent<Omit<SliderTrackProps, "ref"> & react.RefAttributes<HTMLSpanElement>>;

type HorizontalStepPosition = "none" | "bottom";
type VerticalStepPosition = "none" | "left" | "right";
interface SliderBaseProps extends Omit<SliderRootBaseProps, "orientation">, Omit<SliderStepsProps, "position" | "defaultValue"> {
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        SliderTrack?: NativeElementAttributes<"span", typeof SliderTrack>;
        SliderRange?: NativeElementAttributes<"span", typeof SliderRange>;
        SliderThumb?: NativeElementAttributes<"span", typeof SliderThumb>;
        SliderSteps?: NativeElementAttributes<"span", typeof SliderSteps>;
    };
}
interface SliderSingleProps extends SliderBaseProps, SliderRootSingleProps {
    /**
     * The kind of slider. Can be either `single` or `range`.
     * @defaultValue "single"
     */
    kind?: "single";
}
interface SliderRangeProps extends SliderBaseProps, SliderRootRangeProps {
    /**
     * The kind of slider. Can be either `single` or `range`.
     */
    kind: "range";
}
interface HorizontalSliderProps {
    /**
     * The orientation of the slider.
     * @defaultValue "horizontal"
     */
    orientation?: "horizontal";
    /**
     * The position of the step markers. For horizontal sliders, can only be "none" or "bottom".
     * @defaultValue "none"
     */
    stepPosition?: HorizontalStepPosition;
}
interface VerticalSliderProps {
    /**
     * The orientation of the slider.
     */
    orientation: "vertical";
    /**
     * The position of the step markers. For vertical sliders, can be "none", "left", or "right".
     * @defaultValue "none"
     */
    stepPosition?: VerticalStepPosition;
}
type OrientationAwareSliderProps<T extends HorizontalSliderProps | VerticalSliderProps> = T extends HorizontalSliderProps ? Omit<T, "stepPosition"> & {
    stepPosition?: HorizontalStepPosition;
} : Omit<T, "stepPosition"> & {
    stepPosition?: VerticalStepPosition;
};
type SliderProps = OrientationAwareSliderProps<(SliderSingleProps | SliderRangeProps) & (HorizontalSliderProps | VerticalSliderProps)>;
/**
 * A slider component allows users to select a value or range from a range of values.
 *
 * Sliders reflect a range of values along a bar, from which users may select a single value
 * or a range of values. They are ideal for adjusting settings such as volume, brightness,
 * or applying image filters.
 *
 * @param props - props to be passed to the {@link Slider} component
 * @see {@link SliderProps}
 *
 * @example
 * ```tsx
 * // Single value slider
 * <Slider defaultValue={50} />
 *
 * // Range slider
 * <Slider defaultValue={[25, 75]} kind="range" />
 *
 * // With step marks
 * <Slider defaultValue={40} step={10} stepPosition="bottom" />
 *
 * // Vertical slider
 * <Slider defaultValue={50} orientation="vertical" stepPosition="left" />
 * ```
 */
declare const Slider: react.ForwardRefExoticComponent<(Omit<Omit<SliderSingleProps & HorizontalSliderProps, "stepPosition"> & {
    stepPosition?: HorizontalStepPosition;
}, "ref"> | Omit<Omit<SliderSingleProps & VerticalSliderProps, "stepPosition"> & {
    stepPosition?: VerticalStepPosition;
}, "ref"> | Omit<Omit<SliderRangeProps & HorizontalSliderProps, "stepPosition"> & {
    stepPosition?: HorizontalStepPosition;
}, "ref"> | Omit<Omit<SliderRangeProps & VerticalSliderProps, "stepPosition"> & {
    stepPosition?: VerticalStepPosition;
}, "ref">) & react.RefAttributes<HTMLSpanElement>>;

declare const SliderTestIds: {
    readonly SliderRoot: "nv-slider-root";
    readonly SliderTrack: "nv-slider-track";
    readonly SliderRange: "nv-slider-range";
    readonly SliderThumb: "nv-slider-thumb";
    readonly SliderSteps: "nv-slider-steps";
    readonly SliderStep: "nv-slider-step";
};

interface SpinnerPropsBase extends Omit<ComponentPropsWithRef<"div">, "children"> {
    /**
     * An optional message that is displayed below the spinner
     */
    description?: string;
    /**
     * The size of the Spinner
     * @defaultValue 'medium'
     */
    size?: "small" | "medium" | "large";
}
type SpinnerProps = SpinnerPropsBase & ({
    description: string;
    "aria-label"?: never;
} | {
    description?: undefined;
    "aria-label": string;
});
/**
 * Use a spinner when the user is waiting on an operation including loading, downloading, uploading, processing, etc. that's indeterminate.
 * Spinners are displayed until content appears or a process is complete. This component should be used when the expected duration is more
 * than a second and the completion time is short (up to 5 seconds). A message can be used with a spinner to improve understanding.
 * @param props - props to be passed to the {@link Spinner} component
 * @see {@link SpinnerProps}
 * @example
 * ```tsx
 * <Spinner aria-label="Loading" />
 * ```
 */
declare const Spinner: react__default.ForwardRefExoticComponent<(Omit<SpinnerPropsBase & {
    description: string;
    "aria-label"?: never;
}, "ref"> | Omit<SpinnerPropsBase & {
    description?: undefined;
    "aria-label": string;
}, "ref">) & react__default.RefAttributes<HTMLDivElement>>;

interface StackProps extends FlexProps {
    /**
     * The divider to be used between the children.
     */
    slotDivider?: react__default.ReactNode;
}
/**
 * A primitive stack component.
 * @param props - props to be passed to the {@link Stack} component
 * @see {@link StackProps}
 * @example
 * ```tsx
 *	<Stack>
 *		<div>content A</div>
 *		<div>content B</div>
 *	</Stack>
 * ```
 */
declare const Stack: react__default.ForwardRefExoticComponent<Omit<StackProps, "ref"> & react__default.RefAttributes<HTMLDivElement>>;

interface StatusMessageFooterProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * Actions for a {@link StatusMessageRoot}. Must be used within an {@link StatusMessageRoot}.
 * @param props - props to be passed to the {@link StatusMessageFooter} component
 * @see {@link StatusMessageFooterProps}
 *
 * @example
 * ```tsx
 * <StatusMessageFooter>
 *		<Button>Confirm</Button>
 * </StatusMessageFooter>
 * ```
 */
declare const StatusMessageFooter: react.ForwardRefExoticComponent<Omit<StatusMessageFooterProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface StatusMessageHeaderProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * Content for a {@link StatusMessageRoot}. Must be used within an {@link StatusMessageRoot}.
 * @param props - props to be passed to the {@link StatusMessageHeader} component
 * @see {@link StatusMessageHeaderProps}
 *
 * @example
 * ```tsx
 * <StatusMessageHeader>
 *		<StatusMessageHeader>Header Text</StatusMessageHeader>
 *		<StatusMessageBody>Body Text</StatusMessageBody>
 * </StatusMessageHeader>
 * ```
 */
declare const StatusMessageHeader: react.ForwardRefExoticComponent<Omit<StatusMessageHeaderProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface StatusMessageHeadingProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * Header for a {@link StatusMessageRoot}. Must be used within an {@link StatusMessageHeader}.
 * @param props - props to be passed to the {@link StatusMessageHeading} component
 * @see {@link StatusMessageHeadingProps}
 *
 * @example
 * ```tsx
 * <StatusMessageHeading>
 *		Header Text
 * </StatusMessageHeading>
 * ```
 */
declare const StatusMessageHeading: react.ForwardRefExoticComponent<Omit<StatusMessageHeadingProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface StatusMessageMediaProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * Icon for a {@link StatusMessageRoot}. Must be used within an {@link StatusMessageRoot}.
 * @param props - props to be passed to the {@link StatusMessageMedia} component
 * @see {@link StatusMessageMediaProps}
 *
 * @example
 * ```tsx
 * <StatusMessageMedia>
 *		<Lightbulb variant="fill" />
 * </StatusMessageMedia>
 * ```
 */
declare const StatusMessageMedia: react.ForwardRefExoticComponent<Omit<StatusMessageMediaProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare const statusMessageRoot: (props?: ({
    size?: "small" | "medium" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type StatusMessageRootVariantProps = VariantProps<typeof statusMessageRoot>;
interface StatusMessageRootProps extends PrimitivePropsWithRef<"div"> {
    /**
     * The size of the status message.
     * @defaultValue "medium"
     */
    size?: StatusMessageRootVariantProps["size"];
}
/**
 * Root component for wrapping StatusMessage composable components.
 * @param props - props to be passed to the {@link StatusMessageRoot} component
 * @see {@link StatusMessageRootProps}
 *
 * @example
 * ```tsx
 * <StatusMessageRoot size="small">
 *		<StatusMessageMedia />
 *		<StatusMessageHeader>
 *			<StatusMessageHeader />
 *			<StatusMessageBody />
 *		</StatusMessageHeader>
 *		<StatusMessageFooter />
 * </StatusMessageHeader>
 * ```
 */
declare const StatusMessageRoot: react.ForwardRefExoticComponent<Omit<StatusMessageRootProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface StatusMessageSubheadingProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * Body for a {@link StatusMessageRoot}. Must be used within an {@link StatusMessageHeader}.
 * @param props - props to be passed to the {@link StatusMessageSubheading} component
 * @see {@link StatusMessageSubheadingProps}
 *
 * @example
 * ```tsx
 * <StatusMessageSubheading>
 *		Body Text
 * </StatusMessageSubheading>
 * ```
 */
declare const StatusMessageSubheading: react.ForwardRefExoticComponent<Omit<StatusMessageSubheadingProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface StatusMessageProps extends NativeElementAttributes<"div", typeof StatusMessageRoot> {
    /**
     * The size of the component. This will affect the size of the headig and subheading and the spacing between elements.
     * @defaultValue "medium"
     */
    size?: StatusMessageRootProps["size"];
    /**
     * The content to render in the footer.
     */
    slotFooter?: ReactNode;
    /**
     * The content to render in the heading.
     */
    slotSubheading?: ReactNode;
    /**
     * The content to render in the heading.
     */
    slotHeading: ReactNode;
    /**
     * The content to render in the media slot.
     */
    slotMedia?: ReactNode;
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        StatusMessageMedia?: NativeElementAttributes<"div", typeof StatusMessageMedia>;
        StatusMessageHeader?: NativeElementAttributes<"div", typeof StatusMessageHeader>;
        StatusMessageHeading?: NativeElementAttributes<"div", typeof StatusMessageHeading>;
        StatusMessageSubheading?: NativeElementAttributes<"div", typeof StatusMessageSubheading>;
        StatusMessageFooter?: NativeElementAttributes<"div", typeof StatusMessageFooter>;
    };
}
/**
 * A status message is a visual placeholder for any type of empty content.
 * @param props - props to be passed to the {@link StatusMessage} component
 * @see {@link StatusMessageProps}
 *
 * @example
 * ```tsx
 * <StatusMessage />
 * ```
 */
declare const StatusMessage: react.ForwardRefExoticComponent<Omit<StatusMessageProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare const StatusMessageTestIds: {
    readonly StatusMessageRoot: "nv-status-message-root";
    readonly StatusMessageMedia: "nv-status-message-media";
    readonly StatusMessageHeader: "nv-status-message-header";
    readonly StatusMessageHeading: "nv-status-message-heading";
    readonly StatusMessageSubheading: "nv-status-message-subheading";
    readonly StatusMessageFooter: "nv-status-message-footer";
};

declare const switchRoot: (props?: ({
    side?: "left" | "right" | null | undefined;
    size?: "small" | "medium" | "large" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface SwitchRootProps extends PrimitivePropsWithRef<"div"> {
    /**
     * The side of the switch to render the label on.
     * @defaultValue "right"
     */
    side?: VariantProps<typeof switchRoot>["side"];
    /**
     * The size of the switch.
     * @defaultValue "medium"
     */
    size?: VariantProps<typeof switchRoot>["size"];
}
/**
 * The root container for wrapping a switch's track and label.
 * @param props - props to be passed to the {@link SwitchRoot} component
 * @see {@link SwitchRootProps}
 */
declare const SwitchRoot: react.ForwardRefExoticComponent<Omit<SwitchRootProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface SwitchThumbProps extends PrimitivePropsWithRef<"span"> {
}
/**
 * The visual indicator for showing the checked state of the switch.
 * @param props - props to be passed to the {@link SwitchThumb} component
 * @see {@link SwitchThumbProps}
 */
declare const SwitchThumb: react.ForwardRefExoticComponent<Omit<SwitchThumbProps, "ref"> & react.RefAttributes<HTMLSpanElement>>;

interface SwitchTrackProps extends PrimitivePropsWithRef<"button"> {
    /**
     * If true, the switch will be disabled and not be able to be interacted with.
     */
    disabled?: boolean;
    /**
     * The controlled state of the switch.
     */
    checked?: boolean;
    /**
     * The state of the switch when initially rendered.
     */
    defaultChecked?: boolean;
    /**
     * An event handler that's called when the state of the switch changes.
     * @param checked - The current state of the switch.
     */
    onCheckedChange?: (checked: boolean) => void;
}
/**
 * The part of the switch that contains the switch thumb.
 * @param props - props to be passed to the {@link SwitchTrack} component
 * @see {@link SwitchTrackProps}
 */
declare const SwitchTrack: react.ForwardRefExoticComponent<Omit<SwitchTrackProps, "ref"> & react.RefAttributes<HTMLButtonElement>>;

interface SwitchProps extends Pick<SwitchTrackProps, "checked" | "defaultChecked" | "onCheckedChange" | "disabled">, Pick<SwitchRootProps, "size">, MergedHoistedElementAttributes<[
    [
        "div",
        typeof SwitchRoot
    ],
    [
        "button",
        typeof SwitchTrack
    ],
    [
        "span",
        typeof SwitchThumb
    ],
    [
        "label",
        typeof Label
    ]
]> {
    /**
     * A semantic label for the switch. The location of the label can be changed using the `labelSide` property.
     */
    slotLabel?: ReactNode;
    /**
     * Which side of the switch to render the label on.
     * @defaultValue "right"
     */
    labelSide?: "left" | "right";
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        SwitchTrack?: NativeElementAttributes<"button", typeof SwitchTrack>;
        SwitchThumb?: NativeElementAttributes<"span", typeof SwitchThumb>;
        Label?: NativeElementAttributes<"label", typeof Label>;
    };
}
/**
 * A switch allows users to quickly switch between two states.
 *
 * Use a switch to allow users to turn something on or off instantly. Switches are only used with
 * binary actions with a default setting set. It's commonly used for adjusting settings and
 * preferences.
 *
 * @param props - props to be passed to the {@link Switch} component
 * @see {@link SwitchProps}
 *
 * @example
 * ```tsx
 * <Switch label="Notifications" />
 * ```
 */
declare const Switch: react.ForwardRefExoticComponent<SwitchProps & react.RefAttributes<HTMLButtonElement>>;

declare const SwitchTestIds: {
    readonly Root: "nv-switch-root";
    readonly Track: "nv-switch-track";
    readonly Thumb: "nv-switch-thumb";
};

declare const tableBody: (props?: ({
    align?: "center" | "left" | "right" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface TableBodyProps extends ComponentPropsWithRef<"tbody"> {
    /**
     * Controls the alignment of data in the table body.
     */
    align?: VariantProps<typeof tableBody>["align"];
}
/**
 * Component that contains all elements of a table body. Renders a `<tbody>` element. Should be used
 * within `TableRoot` which provides the `<table>` element.
 * @param props - props to be passed to the {@link TableBody} component
 * @see {@link TableBodyProps}
 *
 * @example
 * ```tsx
 * <TableRoot>
 *  ...
 *  <TableBody>
 *    ...
 *  </TableBody>
 * </TableRoot>
 * ```
 */
declare const TableBody: react.ForwardRefExoticComponent<Omit<TableBodyProps, "ref"> & react.RefAttributes<HTMLTableSectionElement>>;

declare const tableDataCell: (props?: ({
    align?: "center" | "left" | "right" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface TableDataCellProps extends Omit<ComponentPropsWithRef<"td">, "align"> {
    /**
     * Controls the alignment of the cell content.
     *
     * Note: This is not the same as the `align` attribute on the `<td>` element. This controls alignment
     * via CSS.
     */
    align?: VariantProps<typeof tableDataCell>["align"];
}
/**
 * Component that contains all elements of a table cell. Renders a `<td>` element.
 * @param props - props to be passed to the {@link TableDataCell} component
 * @see {@link TableDataCellProps}
 *
 * @example
 * ```tsx
 * <TableRoot>
 *  ...
 *  <TableBody>
 *    <TableRow>
 *      <TableDataCell>
 *     		...
 *     	</TableDataCell>
 *    </TableRow>
 *  </TableBody>
 * </TableRoot>
 * ```
 */
declare const TableDataCell: react.ForwardRefExoticComponent<Omit<TableDataCellProps, "ref"> & react.RefAttributes<HTMLTableCellElement>>;

declare const tableHead: (props?: ({
    align?: "center" | "left" | "right" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface TableHeadProps extends ComponentPropsWithRef<"thead"> {
    /**
     * Controls the alignment of header content in the table head.
     */
    align?: VariantProps<typeof tableHead>["align"];
}
/**
 * Component that contains all elements of a table head. Renders a `<thead>` element.
 * @param props - props to be passed to the {@link TableHead} component
 * @see {@link TableHeadProps}
 *
 * @example
 * ```tsx
 * <TableRoot>
 *  <TableHead>
 *    ...
 *  </TableHead>
 *	...
 * </TableRoot>
 * ```
 */
declare const TableHead: react.ForwardRefExoticComponent<Omit<TableHeadProps, "ref"> & react.RefAttributes<HTMLTableSectionElement>>;

declare const tableHeaderCell: (props?: ({
    align?: "center" | "left" | "right" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface TableHeaderCellProps extends Omit<ComponentPropsWithRef<"th">, "align"> {
    /**
     * Controls the alignment of the header content.
     *
     * Note: This is not the same as the `align` attribute on the `<th>` element. This controls alignment
     * via CSS.
     */
    align?: VariantProps<typeof tableHeaderCell>["align"];
}
/**
 * Component that contains all elements of a table cell. Renders a `<th>` element.
 * @param props - props to be passed to the {@link TableHeaderCell} component
 * @see {@link TableHeaderCellProps}
 *
 * @example
 * ```tsx
 * <TableRoot>
 *  <TableHead>
 *    <TableRow>
 *     	<TableHeaderCell>
 *     		...
 *     	</TableHeaderCell>
 *    </TableRow>
 *  </TableHead>
 *  ...
 * </TableRoot>
 * ```
 */
declare const TableHeaderCell: react.ForwardRefExoticComponent<Omit<TableHeaderCellProps, "ref"> & react.RefAttributes<HTMLTableCellElement>>;

declare const tableRoot: (props?: ({
    density?: "compact" | "standard" | "spacious" | null | undefined;
    layout?: "fixed" | "auto" | null | undefined;
    align?: "center" | "left" | "right" | null | undefined;
    hoverableRows?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type TableRootVariantProps = VariantProps<typeof tableRoot>;
interface TableRootProps extends Omit<ComponentPropsWithRef<"table">, "align">, DensityVariantProps {
    /**
     * The layout variant for the table
     * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/table-layout}
     * @defaultValue "fixed"
     */
    layout?: TableRootVariantProps["layout"];
    /**
     * Where to align table content. This will set alignment for all cells in the table.
     *
     * In general, textual data should be left-aligned and numerical data should be right-aligned.
     *
     * Consider how mixing different alignments across columns can affect readability.
     *
     * @defaultValue "left"
     */
    align?: TableRootVariantProps["align"];
    /**
     * Whether the table should have hover states for rows.
     * @defaultValue false
     */
    hoverableRows?: TableRootVariantProps["hoverableRows"];
}
/**
 * Component that contains all elements of a table. Renders a `<table>` element.
 * @param props - props to be passed to the {@link TableRoot} component
 * @see {@link TableRootProps}
 *
 * @example
 * ```tsx
 * <TableRoot>
 *  ...
 * </TableRoot>
 * ```
 */
declare const TableRoot: react.ForwardRefExoticComponent<Omit<TableRootProps, "ref"> & react.RefAttributes<HTMLTableElement>>;

declare const tableRow: (props?: ({
    align?: "center" | "left" | "right" | null | undefined;
    selected?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface TableRowProps extends ComponentPropsWithRef<"tr"> {
    /**
     * Controls the alignment of the row content.
     */
    align?: VariantProps<typeof tableRow>["align"];
    /**
     * Whether the row is selected
     */
    selected?: VariantProps<typeof tableRow>["selected"];
}
/**
 * Component that contains all elements of a table row. Renders a `<tr>` element.
 * @param props - props to be passed to the {@link TableRow} component
 * @see {@link TableRowProps}
 *
 * @example
 * ```tsx
 * <TableRoot>
 *  <TableHead>
 *    <TableRow>
 *      ...
 *    </TableRow>
 *  </TableHead>
 *  <TableBody>
 *    <TableRow>
 *      ...
 *    </TableRow>
 *  </TableBody>
 * </TableRoot>
 * ```
 */
declare const TableRow: react.ForwardRefExoticComponent<Omit<TableRowProps, "ref"> & react.RefAttributes<HTMLTableRowElement>>;

interface TableColumnDefinition {
    /**
     * The header content to display for this column
     */
    children: ReactNode;
    /**
     * @deprecated Use `children` instead, this property will be removed in the next major version
     */
    slotHeader?: ReactNode;
    /**
     * Optional callback when the column is selected
     */
    onColumnSelect?: (_: {
        columnIndex: number;
    }) => void;
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        TableHeaderCell?: NativeElementAttributes<"th", typeof TableHeaderCell>;
    };
}
interface TableCellData {
    /**
     * The content to display in the cell
     */
    children: ReactNode;
    /**
     * @deprecated Use `children` instead, this property will be removed in the next major version
     */
    slotContent?: ReactNode;
    /**
     * Callback when the cell is selected
     */
    onCellSelect?: (_: {
        rowId?: string;
        columnIndex: number;
    }) => void;
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        TableDataCell?: NativeElementAttributes<"td", typeof TableDataCell>;
    };
}
interface TableRowDefinition {
    /**
     * Unique identifier for the row
     */
    id?: string;
    /**
     * The cells in this row
     */
    cells: (string | TableCellData)[];
    /**
     * Optional callback when a row is clicked
     */
    onRowSelect?: (_: {
        rowId?: string;
    }) => void;
    /**
     * Whether the row is selected
     */
    selected?: boolean;
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        TableRow?: NativeElementAttributes<"tr", typeof TableRow>;
    };
}
interface TableProps extends Pick<TableRootProps, "density" | "layout" | "align" | "hoverableRows">, NativeElementAttributes<"table", typeof TableRoot> {
    /**
     * Definitions for each column in the table
     */
    columns: (string | TableColumnDefinition)[];
    /**
     * Data for each row in the table
     */
    rows: TableRowDefinition[];
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        TableHead?: NativeElementAttributes<"thead", typeof TableHead>;
        TableRow?: NativeElementAttributes<"tr", typeof TableRow>;
        TableBody?: NativeElementAttributes<"tbody", typeof TableBody>;
    };
}
/**
 * A table organizes sets of data into columns and rows.
 * @param props - props to be passed to the {@link Table} component
 * @see {@link TableProps}
 *
 * @example
 * ```tsx
 * <Table
 *	 columns={[
 *		 "Column 1",
 *		 { children: "Column 2", onColumnSelect: (args) => console.log(args) },
 *	 ]}
 *	 rows={[
 *		 {
 *			 id: "row1",
 *			 cells: [
 *				 "Row 1, Column 1",
 *				 { children: "Row 1, Column 2", onCellSelect: (args) => console.log(args) },
 *			 ],
 *		 },
 *		 {
 *			 id: "row2",
 *			 cells: ["Row 2, Column 1", "Row 2, Column 2"],
 *		 },
 *	 ]}
 * />
 * ```
 */
declare const Table: react.ForwardRefExoticComponent<Omit<TableProps, "ref"> & react.RefAttributes<HTMLTableElement>>;

interface TableToolbarProps extends React.ComponentPropsWithoutRef<"section"> {
    asChild?: boolean;
    /**
     * Whether to show the bulk actions toolbar.
     * @defaultValue false
     */
    showBulkActionsToolbar?: boolean;
    /**
     * For bulk actions content use this slot to render actions into the bulk actions toolbar.
     */
    slotBulkActions?: React.ReactNode;
}
/**
 * A container for table toolbar actions.
 * @param props - props to be passed to the {@link TableToolbar} component
 * @see {@link TableToolbarProps}
 *
 * @example
 * ```tsx
 * <TableToolbar
 *   slotBulkActions={<TableBulkActionToolbar>...</TableBulkActionToolbar>}
 * >
 *   <Button>...</Button>
 *   <SearchBar>...</SearchBar>
 * </TableToolbar>
 * <TableRoot>...</TableRoot>
 * ```
 */
declare const TableToolbar: react.ForwardRefExoticComponent<TableToolbarProps & react.RefAttributes<HTMLDivElement>>;

interface TableBulkActionToolbarProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * An optional toolbar that can be rendered in the table. Use this for bulk actions, filters, etc.
 * @param props - props to be passed to the {@link TableBulkActionToolbar} component
 * @see {@link TableBulkActionToolbarProps}
 *
 * @example
 * ```tsx
 * <TableToolbar
 *   slotBulkActions={
 *     <TableBulkActionToolbar>
 *       <Button>Edit</Button>
 *       <Divider />
 *       <Button>Delete</Button>
 *     </TableBulkActionToolbar>
 *   }
 * >
 *   ...
 * </TableToolbar>
 * <TableRoot>...</TableRoot>
 * ```
 */
declare const TableBulkActionToolbar: react.ForwardRefExoticComponent<Omit<TableBulkActionToolbarProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare const TableTestIds: {
    readonly TableRoot: "nv-table-root";
    readonly TableRow: "nv-table-row";
    readonly TableHeaderCell: "nv-table-header-cell";
    readonly TableDataCell: "nv-table-data-cell";
    readonly TableHead: "nv-table-head";
    readonly TableBody: "nv-table-body";
    readonly TableToolbar: "nv-table-toolbar";
    readonly TableBulkActionToolbar: "nv-table-bulk-action-toolbar";
};

declare const textAreaElement: (props?: ({
    resizeable?: "auto" | "manual" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface TextAreaElementProps extends Omit<PrimitivePropsWithRef<"textarea">, "type"> {
    /**
     * The value of the text area when initially rendered. Use when you do not need to control the state of the text area.
     */
    defaultValue?: string;
    /**
     * Controls the resize behavior of the text area.
     * - `manual`: The text area can be manually resized vertically.
     * - `auto`: The text area will be automatically resized to fit the content to a max height of `--max-auto-height` (400px by default). Set `--max-auto-height` to control the max height.
     * - `undefined`: The text area will not be resizeable.
     *
     * @defaultValue `undefined`
     */
    resizeable?: VariantProps<typeof textAreaElement>["resizeable"];
    /**
     * The controlled value of the text area. Must be used in conjunction with `onValueChange`.
     */
    value?: string;
    /**
     * Callback fired when the value changes.
     */
    onValueChange?: (value: string) => void;
}
/**
 * The actual `textarea` element of TextArea.
 * @param props - props to be passed to the {@link TextAreaElement} component
 * @see {@link TextAreaElementProps}
 *
 * @example
 * ```tsx
 * // Auto grows to fit the content
 * <TextAreaRoot defaultValue="Hello, world!">
 *   <TextAreaElement
 *    resizeable="auto"
 *    style={{
 *      // Default max height is 400px. Override it by setting the CSS variable --max-auto-height.
 *      "--max-auto-height": "100%"
 *    }}
 *   />
 * </TextAreaRoot>
 * ```
 */
declare const TextAreaElement: react.ForwardRefExoticComponent<Omit<TextAreaElementProps, "ref"> & react.RefAttributes<HTMLTextAreaElement>>;

interface TextAreaRootProps extends Omit<ComponentPropsWithRef<"div">, "size">, Pick<PolymorphicInputProps, "disabled" | "readOnly" | "size" | "status" | "slotLeft" | "slotRight"> {
    /**
     * The value of the text area when initially rendered. Use when you do not need to control the state of the text area.
     * @defaultValue ""
     */
    defaultValue?: string;
    /**
     * The controlled value of the text area. Must be used in conjunction with `onValueChange`.
     */
    value?: string;
    /**
     * Callback fired when the value changes.
     */
    onValueChange?: (value: string) => void;
}
/**
 * TextArea root element. Acts as a wrapper around the textarea allowing for iconography and rich content.
 * @param props - props to be passed to the {@link TextAreaRoot} component
 * @see {@link TextAreaRootProps}
 *
 * @example
 * ```tsx
 * <TextAreaRoot
 *   size="medium"
 *   slotLeft={<Head variant="line" />}
 *   slotRight={<Button><Paperplane variant="fill" /></Button>}
 * >
 *   <TextAreaElement />
 * </TextAreaRoot>
 * ```
 */
declare const TextAreaRoot: react.ForwardRefExoticComponent<Omit<TextAreaRootProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface TextAreaProps extends Pick<TextAreaRootProps, "value" | "defaultValue" | "onValueChange" | "readOnly" | "disabled" | "status" | "size" | "slotLeft" | "slotRight">, Pick<TextAreaElementProps, "resizeable">, Omit<MergedHoistedElementAttributes<[
    ["div", typeof TextAreaRoot],
    ["textarea", typeof TextAreaElement]
]>, "defaultValue" | "value" | "size"> {
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        TextAreaElement?: NativeElementAttributes<"textarea", typeof TextAreaElement>;
    };
}
/**
 * A browser text area with additional capabilities such as icons and status.
 *
 * @remarks This component is a composition of the `TextAreaRoot` and `TextAreaElement` components. The `ref` and HTML attributes are applied to the inner `TextAreaElement` component. You can still apply attributes to the outer `TextAreaRoot` component using the `attributes` prop.
 * @param props - Component props
 * @see {@link TextAreaProps}
 *
 * @example
 * ```tsx
 * <TextArea size="medium" placeholder="Enter a value" />
 * ```
 *
 * @example
 * ```tsx
 * <TextArea
 * 	 defaultValue="Hello, world!"
 *   onValueChange={(value) => console.log(value)}
 * 	 resizeable="auto" // Auto grows to fit the content
 * 	 placeholder="Enter a value"
 * />
 * ```
 */
declare const TextArea: react.ForwardRefExoticComponent<TextAreaProps & react.RefAttributes<HTMLTextAreaElement>>;

declare const TextAreaTestIds: {
    readonly TextAreaRoot: "nv-text-area-root";
    readonly TextAreaElement: "nv-text-area-element";
};

/**
 * Core theme types for the ThemeProvider system.
 * These types define the available theme configurations and resolved states.
 */
/**
 * Available density variants that control spacing throughout components.
 * - "spacious": Maximum spacing for accessibility and touch interfaces
 * - "compact": Minimal spacing for information-dense layouts
 * - "standard": Default balanced spacing for general use
 */
type Density = "spacious" | "compact" | "standard";
/**
 * Available theme themes for the application.
 * - "light": Force light theme regardless of system preference
 * - "dark": Force dark theme regardless of system preference
 * - "system": Automatically follow the user's system preference
 */
type Theme = "light" | "dark" | "system";
/**
 * Resolved theme theme after processing system preferences.
 * This represents the actual theme being applied to the UI.
 */
type ResolvedTheme = "light" | "dark";
/**
 * CSS class names applied for different density variants.
 */
declare const DENSITY_CLASS_NAMES: {
    readonly spacious: "nv-density-spacious";
    readonly compact: "nv-density-compact";
    readonly standard: "nv-density-standard";
};
/**
 * CSS class names applied for different theme variants.
 */
declare const THEME_CLASS_NAMES: {
    readonly light: "nv-light";
    readonly dark: "nv-dark";
};
/**
 * Media query string for detecting dark color scheme preference.
 */
declare const PREFERS_COLOR_SCHEME_DARK_QUERY = "(prefers-color-scheme: dark)";

interface ThemeProviderBaseProps extends PrimitivePropsWithRef<"div"> {
    /**
     * The density variant that controls spacing throughout child components.
     * This affects the density of all child components that would normally have a `spacing` prop.
     * - "spacious": Maximum spacing for accessibility and touch interfaces
     * - "compact": Minimal spacing for information-dense layouts
     * - "standard": Default balanced spacing for general use
     *
     * When nested, inherits from parent ThemeProvider if not specified.
     * @defaultValue "standard" (or inherited from parent)
     */
    density?: Density;
    /**
     * The theme theme for the application.
     * - "light": Force light theme regardless of system preference
     * - "dark": Force dark theme regardless of system preference
     * - "system": Automatically follow the user's system preference
     *
     * When nested, inherits from parent ThemeProvider if not specified.
     * If no theme is provided and there's no parent context, no theme class
     * is applied, allowing manually set theme classes to take precedence.
     * @defaultValue inherited from parent, or no theme class if no parent
     */
    theme?: Theme;
}
interface ThemeProviderGlobalProps extends ThemeProviderBaseProps {
    /**
     * Whether this provider should manage global theme state by applying classes to DOM elements.
     * When true, theme and density changes are applied to the specified target element (html or body).
     *
     * @defaultValue false
     */
    global?: boolean;
    /**
     * The target element to apply theme classes to when global is true.
     * Only used when global=true.
     *
     * @defaultValue "html"
     */
    target?: "html" | "body";
}
interface ThemeProviderLocalProps extends ThemeProviderBaseProps {
    /**
     * Whether to defer the theme change until SSR hydration. This can be useful for integration with other theme provider solutions like `next-themes`.
     * @remarks
     * Deferring the theme change until SSR hydration will result in a hydration mismatch.
     * We automatically apply the `suppressHydrationWarning` prop to prevent hydration mismatch errors.
     *
     * When nested, inherits from parent ThemeProvider if not specified.
     * @defaultValue false (or inherited from parent)
     */
    defer?: boolean;
}
type ThemeProviderProps = ThemeProviderGlobalProps | ThemeProviderLocalProps;
/**
 * A comprehensive theme provider that manages both density (spacing) and theme (light/dark) themes
 * for all child components. This component:
 *
 * - Sets density variants that control spacing throughout child components
 * - Manages color themes with support for system preference detection
 * - Applies theme classes to the provider element for scoped theming (only when explicitly provided or inherited)
 * - Provides theme context to all descendant components via React Context
 * - Handles system theme changes and updates the UI accordingly
 * - Supports nesting with automatic inheritance from parent providers
 *
 * When nested, child providers inherit density, theme, and defer settings from their parent unless
 * explicitly overridden. If no theme is provided and there's no parent context,
 * no theme class is applied, allowing manually set theme classes to take precedence.
 * This allows for granular theme control in different sections of the application
 * while maintaining consistent defaults and not overriding external theme solutions.
 *
 * @param props - Props to be passed to the {@link ThemeProvider} component
 * @see {@link ThemeProviderProps}
 *
 * @example
 * Basic usage with density control:
 * ```tsx
 * <ThemeProvider density="compact">
 *   <Modal>
 *     <ModalContent>
 *       <Panel>
 *         <Tag>Content</Tag>
 *       </Panel>
 *     </ModalContent>
 *   </Modal>
 * </ThemeProvider>
 * ```
 *
 * @example
 * Full theme management with theme control:
 * ```tsx
 * <ThemeProvider density="standard" theme="system">
 *   <Header />
 *   <MainContent />
 *   <Footer />
 * </ThemeProvider>
 * ```
 *
 * @example
 * Forcing a specific theme:
 * ```tsx
 * <ThemeProvider theme="dark">
 *   <DarkModeSpecificComponent />
 * </ThemeProvider>
 * ```
 *
 * @example
 * Nested providers with inheritance:
 * ```tsx
 * <ThemeProvider density="compact" theme="system" defer>
 *   <GlobalLayout>
 *     {// This provider inherits compact density, system theme, and defer}
 *     <ThemeProvider theme="dark">
 *       <Sidebar /> {// Uses compact density (inherited) + dark theme + defer (inherited)}
 *     </ThemeProvider>
 *
 *     {// This provider inherits all settings from parent}
 *     <ThemeProvider>
 *       <MainContent /> {// Uses compact density + system theme + defer}
 *     </ThemeProvider>
 *   </GlobalLayout>
 * </ThemeProvider>
 * ```
 *
 * @example
 * Respecting external theme classes:
 * ```tsx
 * {// When no parent context and no explicit theme, allows external classes}
 * <div className="nv-dark">
 *   <ThemeProvider>
 *     <Component /> {// Respects the manually set nv-dark class}
 *   </ThemeProvider>
 * </div>
 *
 * {// But explicit theme still takes precedence}
 * <div className="nv-dark">
 *   <ThemeProvider theme="light">
 *     <Component /> {// Applies nv-light, overriding manual class}
 *   </ThemeProvider>
 * </div>
 * ```
 */
declare const ThemeProvider: react.ForwardRefExoticComponent<(Omit<ThemeProviderGlobalProps, "ref"> | Omit<ThemeProviderLocalProps, "ref">) & react.RefAttributes<HTMLDivElement>>;

declare const ThemeProviderTestIds: {
    readonly ThemeProvider: "theme-provider";
};

interface ThemeContextType {
    density?: Density;
    theme?: ResolvedTheme;
    unresolvedTheme?: Theme;
    defer?: boolean;
    global?: boolean;
    setTheme: (theme: Theme) => void;
    setDensity: (density: Density) => void;
}
declare const ThemeContext: react.Context<ThemeContextType>;
declare const useThemeContext: () => ThemeContextType;
/**
 * Hook to access parent theme context without throwing an error if none exists.
 * This is useful for nested ThemeProviders that want to inherit from their parent.
 *
 * @returns Parent theme context or undefined if no parent exists
 */
declare const useParentThemeContext: () => ThemeContextType;

interface UseThemeManagerParams {
    global: boolean;
    target: "html" | "body";
    initialTheme?: Theme;
    initialDensity?: Density;
    parentContext?: ThemeContextType;
    defer?: boolean;
}
/**
 * @internal
 * Consolidated hook to manage all DOM theme operations and state.
 */
declare const useThemeManager: ({ global, target, initialTheme, initialDensity, parentContext, defer, }: UseThemeManagerParams) => {
    density: Density;
    resolvedTheme: ResolvedTheme | null;
    unresolvedTheme: Theme | undefined;
    defer: boolean;
    updateTheme: (newTheme: Theme) => void;
    updateDensity: (newDensity: Density) => void;
};
/**
 * Hook to access the current theme state and controls.
 * Provides access to density settings, theme preferences, resolved theme state,
 * and theme/density switching functionality. Must be used within a ThemeProvider.
 *
 * Works with both global and local theme providers. When used with a global
 * ThemeProvider (global={true}), theme changes will be applied to the target
 * DOM element (html or body). When used with a local ThemeProvider, theme
 * changes will be applied only to the provider element.
 *
 * @throws Error if used outside of a ThemeProvider
 * @returns Theme context with density, theme controls, and resolved theme state
 *
 * @example
 * ```tsx
 * // Local theming
 * function MyComponent() {
 *   const { density, theme, unresolvedTheme, defer, global, setTheme, setDensity } = useTheme();
 *
 *   return (
 *     <div>
 *       <p>Current theme: {theme}</p>
 *       <p>Density: {density}</p>
 *       <p>Global: {global ? 'Yes' : 'No'}</p>
 *       <button onClick={() => setTheme('dark')}>Switch to Dark</button>
 *       <button onClick={() => setDensity('compact')}>Switch to Compact</button>
 *     </div>
 *   );
 * }
 *
 * // Global theming
 * function App() {
 *   return (
 *     <ThemeProvider global target="html" theme="system" density="standard">
 *       <GlobalThemeControls />
 *       <Content />
 *     </ThemeProvider>
 *   );
 * }
 *
 * function GlobalThemeControls() {
 *   const { theme, density, global, setTheme, setDensity } = useTheme();
 *
 *   return (
 *     <div>
 *       <p>Current theme: {theme}</p>
 *       <p>Current density: {density}</p>
 *       <p>Global mode: {global ? 'Yes' : 'No'}</p>
 *       <button onClick={() => setTheme('dark')}>Set Dark Theme</button>
 *       <button onClick={() => setTheme('system')}>Follow System</button>
 *       <button onClick={() => setDensity('compact')}>Set Compact</button>
 *     </div>
 *   );
 * }
 * ```
 */
declare const useTheme: () => ThemeContextType;

/**
 * Detects the user's system theme preference.
 * Falls back to "dark" in server-side rendering environments.
 *
 * @returns The system's preferred theme ("light" or "dark")
 */
declare const detectSystemThemePreference: () => ResolvedTheme;
/**
 * Resolves an unresolved theme to a concrete theme value.
 * Handles the "system" preference by detecting the actual system preference.
 *
 * @param theme - The theme setting to resolve
 * @returns The resolved theme ("light" or "dark")
 */
declare const resolveTheme: (theme: Theme) => ResolvedTheme;
/**
 * Gets the appropriate CSS class name for a given theme.
 * Returns the dark theme class for dark themes, undefined for light themes.
 *
 * @param theme - The theme to get the class name for
 * @returns The CSS class name or undefined
 */
declare const getThemeClassName: (theme: ResolvedTheme) => string;
/**
 * Gets the appropriate CSS class name for a given density.
 * Returns the density class for the given density.
 *
 * @param density - The density to get the class name for
 * @returns The CSS class name
 */
declare const getDensityClassName: (density: Density) => string;
/**
 * Creates a media query listener for system theme changes.
 *
 * @param callback - Function to call when system theme changes
 * @returns Cleanup function to remove the listener
 */
declare const createSystemThemeListener: (callback: () => void) => (() => void);

interface ToastActionProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * ToastActions component is the wrapper for the actions of the toast component.
 * You can pass actions and they will be space appropriately to the close button
 * You are responsible for handling the spacing of the actions themselves.
 * @param props - props to be passed to the ToastRoot component
 * @see {@link ToastActionProps}
 *
 * @example
 * ```tsx
 * <ToastActions>
 *  <Button variant="primary" size="small" kind="tertiary">Primary</Button>
 *  <Button variant="secondary" size="small" kind="tertiary">Secondary</Button>
 * </ToastActions>
 * ```
 */
declare const ToastActions: react.ForwardRefExoticComponent<Omit<ToastActionProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface ToastContentProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * ToastContent is the container around the icon and the text of the toast.
 * @param props - props to be passed to the ToastContent component
 * @see {@link ToastContentProps}
 *
 * @example
 * ```tsx
 * <ToastRoot status="info">
 *  <ToastContent>
 *   {children}
 *  </ToastContent>
 * </ToastRoot>
 * ```
 */
declare const ToastContent: react.ForwardRefExoticComponent<Omit<ToastContentProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare const toastRoot: (props?: ({
    status?: "error" | "warning" | "neutral" | "success" | "info" | "working" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type ToastRootVariantProps = VariantProps<typeof toastRoot>;
interface ToastRootProps extends PrimitivePropsWithRef<"div"> {
    /**
     * The status of the toast. The toast can be either info, success, warning, error, neutral, or working.
     * @defaultValue "info"
     */
    status?: ToastRootVariantProps["status"];
}
/**
 * Toast Root component is the outside wrapper of the toast component.
 * @param props - props to be passed to the ToastRoot component
 * @see {@link ToastRootProps}
 *
 * @example
 * ```tsx
 * <ToastRoot status="info"/>
 *   {children}
 * </ToastRoot>
 * ```
 */
declare const ToastRoot: react.ForwardRefExoticComponent<Omit<ToastRootProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface ToastIconProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
    /**
     * The status of the toast. The toast can be either info, success, warning, error, neutral, or working.
     * @defaultValue "info"
     */
    status?: ToastRootProps["status"];
}
/**
 * Describe ToastIcon here
 * @param props - props to be passed to the ToastIcon component
 * @see {@link ToastIconProps}
 *
 * @example
 * ```tsx
 * <ToastIcon />
 * ```
 */
declare const ToastIcon: react.ForwardRefExoticComponent<Omit<ToastIconProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface ToastTextProps extends PrimitivePropsWithRef<"span"> {
}
/**
 * Describe ToastText here
 * @param props - props to be passed to the ToastText component
 * @see {@link ToastTextProps}
 *
 * @example
 * ```tsx
 * <ToastText />
 * ```
 */
declare const ToastText: react.ForwardRefExoticComponent<Omit<ToastTextProps, "ref"> & react.RefAttributes<HTMLSpanElement>>;

interface ToastProps extends PropsWithChildren<NativeElementAttributes<"div", typeof ToastRoot>> {
    /**
     * The status of the toast. The toast can be either info, success, warning, error, neutral, or working.
     * @defaultValue "info"
     */
    status?: ToastRootProps["status"];
    /**
     * A callback to be called when the toast is closed.
     */
    onClose?: () => void;
    /**
     * Slot for the action to render in the toast. Should consist of a size small button.
     */
    slotAction?: React.ReactNode;
    /**
     * Slot for the icon to render in the toast.
     * It is recommended to use the NvidiaGUIIcon component from the `@nv-brand-assets` package.
     */
    slotIcon?: React.ReactNode;
    /**
     * The native HTML attributes to apply to the internal composed components.
     */
    attributes?: {
        ToastText?: NativeElementAttributes<"span", typeof ToastText>;
        ToastContent?: NativeElementAttributes<"div", typeof ToastContent>;
        ToastActions?: NativeElementAttributes<"div", typeof ToastActions>;
        ToastIcon?: NativeElementAttributes<"div", typeof ToastIcon>;
        ToastCloseButton?: NativeElementAttributes<"button", typeof Button>;
    };
}
/**
 * Base toast component
 * @param props - props to be passed to the Toast component
 * @see {@link ToastProps}
 *
 * @example
 * ```tsx
 * <Toast status="warning" onClose={() => setState(false)}/>
 * ```
 */
declare const Toast: react.ForwardRefExoticComponent<Omit<ToastProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare const ToastTestIds: {
    readonly ToastRoot: "nv-toast-root";
    readonly ToastIcon: "nv-toast-icon";
    readonly ToastText: "nv-toast-text";
    readonly ToastContent: "nv-toast-content";
    readonly ToastCloseButton: "nv-toast-close-button";
    readonly ToastActions: "nv-toast-actions";
};

interface VerticalNavAccordionContentProps extends PrimitivePropsWithRef<"div"> {
    /**
     * Whether the accordion content is disabled
     */
    disabled?: boolean;
}
/**
 * A component that renders the content of a vertical navigation accordion item. Will render the sub-items of the accordion item.
 * @param props - props to be passed to the {@link VerticalNavAccordionContent } component
 * @see {@link VerticalNavAccordionContentProps}
 *
 * @example
 * ```tsx
 *   <VerticalNavAccordionItem value="1">
 *     <VerticalNavAccordionTrigger>
 *       <VerticalNavText>Item 1</VerticalNavText>
 *     </VerticalNavAccordionTrigger>
 *     <VerticalNavAccordionContent>
 *       {children}
 *     </VerticalNavAccordionContent>
 *   </VerticalNavAccordionItem>
 * ```
 */
declare const VerticalNavAccordionContent: react.ForwardRefExoticComponent<Omit<VerticalNavAccordionContentProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface VerticalNavAccordionItemProps extends PrimitivePropsWithRef<"div"> {
    /**
     * The unique identifier for the item. This is used to associate an item with state in {@link VerticalNavAccordionRoot}.
     */
    value: string;
    /**
     * Whether the item is disabled
     */
    disabled?: boolean;
}
/**
 * Represents an individual item within the {@link VerticalNavAccordionRoot} component. Must be used within an {@link VerticalNavAccordionRoot}.
 * @param props - props to be passed to the {@link VerticalNavAccordionItem} component.
 * @see {@link VerticalNavAccordionItemProps}
 *
 * @example
 * ```tsx
 *   <VerticalNavAccordionRoot>
 *     <VerticalNavAccordionItem value="1">
 *       {children}
 *     </VerticalNavAccordionItem>
 *   </VerticalNavAccordionRoot>
 * ```
 */
declare const VerticalNavAccordionItem: react.ForwardRefExoticComponent<Omit<VerticalNavAccordionItemProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface VerticalNavAccordionRootProps extends PrimitivePropsWithRef<"div"> {
    /**
     * The value of the vertical nav when initially rendered. Use when you do not need to control the state of the vertical nav.
     */
    defaultValue?: string[];
    /**
     * Whether the accordion is disabled
     */
    disabled?: boolean;
    /**
     * The controlled value of the vertical nav. Must be used in conjunction with `onValueChange`.
     */
    value?: string[];
    /**
     * Callback that is called when the open state of any accordion item changes.
     */
    onValueChange?: (value: string[]) => void;
}
/**
 * The root component for the vertical nav accordion. Expands and collapses
 * menu items that have sub-items.
 *
 * @param props - props to be passed to the {@link VerticalNavAccordionRoot } component
 * @see {@link VerticalNavAccordionRootProps}
 *
 * @example
 * ```tsx
 * <VerticalNavRoot>
 *   <VerticalNavList>
 *     <VerticalNavListItem>
 *       <VerticalNavAccordionRoot>
 *         {children}
 *       </VerticalNavAccordionRoot>
 *     </VerticalNavListItem>
 *   </VerticalNavList>
 * </VerticalNavRoot>
 * ```
 */
declare const VerticalNavAccordionRoot: react.ForwardRefExoticComponent<Omit<VerticalNavAccordionRootProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface VerticalNavAccordionTriggerProps extends PrimitivePropsWithRef<"button"> {
}
/**
 * A trigger button for a vertical navigation accordion section. Typically contains an icon and text label,
 * and expands/collapses its associated accordion content when clicked. Can be styled as active to indicate
 * the current section.
 * @param props - props to be passed to the {@link VerticalNavAccordionTrigger } component
 * @see {@link VerticalNavAccordionTriggerProps}
 *
 * @example
 * ```tsx
 * <VerticalNavAccordionTrigger>
 *   <Datacenter className="nv-vertical-nav-icon" />
 *   <VerticalNavText>Datacenters</VerticalNavText>
 * </VerticalNavAccordionTrigger>
 * ```
 */
declare const VerticalNavAccordionTrigger: react.ForwardRefExoticComponent<Omit<VerticalNavAccordionTriggerProps, "ref"> & react.RefAttributes<HTMLButtonElement>>;

interface VerticalNavIconProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * A container component for icons within the vertical navigation menu. Applies consistent styling and spacing
 * to icons used in navigation items, accordion triggers, and links. Should be used to wrap icon components
 * to ensure they conform to the vertical nav design system.
 *
 * @param props - props to be passed to the {@link VerticalNavIcon} component
 * @see {@link VerticalNavIconProps}
 *
 * @example
 * ```tsx
 * <VerticalNavLink>
 *   <VerticalNavIcon>
 *     <Datacenter />
 *   </VerticalNavIcon>
 *   <VerticalNavText>Datacenters</VerticalNavText>
 * </VerticalNavLink>
 * ```
 */
declare const VerticalNavIcon: react.ForwardRefExoticComponent<Omit<VerticalNavIconProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare const verticalNavLink: (props?: ({
    active?: boolean | null | undefined;
    disabled?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type VerticalNavLinkVariantProps = VariantProps<typeof verticalNavLink>;
interface VerticalNavLinkProps extends PrimitivePropsWithRef<"a"> {
    /**
     * Whether the link is active
     */
    active?: VerticalNavLinkVariantProps["active"];
    /**
     * Whether the link is disabled
     */
    disabled?: VerticalNavLinkVariantProps["disabled"];
}
/**
 * Describe VerticalNavLink here
 * @param props - props to be passed to the {@link VerticalNavLink } component
 * @see {@link VerticalNavLinkProps}
 *
 * @example
 * ```tsx
 * <VerticalNavLink />
 * ```
 */
declare const VerticalNavLink: react.ForwardRefExoticComponent<Omit<VerticalNavLinkProps, "ref"> & react.RefAttributes<HTMLAnchorElement>>;

interface VerticalNavListProps extends PrimitivePropsWithRef<"ul"> {
}
/**
 * Use the Vertical Nav List element as a wrapper for your list items.
 * @param props - props to be passed to the {@link VerticalNavList } component
 * @see {@link VerticalNavListProps}
 *
 * @example
 * ```tsx
 * <VerticalNavRoot>
 *   <VerticalNavList>
 *     {children}
 *   </VerticalNavList>
 * </VerticalNavRoot>
 * ```
 */
declare const VerticalNavList: react.ForwardRefExoticComponent<Omit<VerticalNavListProps, "ref"> & react.RefAttributes<HTMLUListElement>>;

interface VerticalNavListItemProps extends PrimitivePropsWithRef<"li"> {
    /**
     * Whether the list item is disabled
     */
    disabled?: boolean;
}
/**
 * List items are for the primary header components of the vertical nav.
 * These can either be a trigger or a link themselves
 *
 * @param props - props to be passed to the {@link VerticalNavListItem } component
 * @see {@link VerticalNavListItemProps}
 *
 * @example
 * ```tsx
 * <VerticalNavRoot>
 *   <VerticalNavList>
 *     <VerticalNavListItem>
 *       {children}
 *     </VerticalNavListItem>
 *   </VerticalNavList>
 * </VerticalNavRoot>
 *
 * ```
 */
declare const VerticalNavListItem: react.ForwardRefExoticComponent<Omit<VerticalNavListItemProps, "ref"> & react.RefAttributes<HTMLLIElement>>;

interface VerticalNavRootProps extends PrimitivePropsWithRef<"nav"> {
}
/**
 * Wrapper component for the vertical navigation component
 * @param props - props to be passed to the {@link VerticalNavRoot } component
 * @see {@link VerticalNavRootProps}
 *
 * @example
 * ```tsx
 * <VerticalNavRoot >
 *   {children}
 * </VerticalNavRoot>
 * ```
 */
declare const VerticalNavRoot: react.ForwardRefExoticComponent<Omit<VerticalNavRootProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

declare const verticalNavSubLink: (props?: ({
    active?: boolean | null | undefined;
    disabled?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type VerticalNavSubLinkVariantProps = VariantProps<typeof verticalNavSubLink>;
interface VerticalNavSubLinkProps extends PrimitivePropsWithRef<"a"> {
    /**
     * Whether or not the sub link is active
     */
    active?: VerticalNavSubLinkVariantProps["active"];
    /**
     * Whether the sub link is disabled
     */
    disabled?: VerticalNavSubLinkVariantProps["disabled"];
}
/**
 * A sub link is a link that is used to navigate to a submenu item.
 * @param props - props to be passed to the {@link VerticalNavSubLink } component
 * @see {@link VerticalNavSubLinkProps}
 *
 * @example
 * ```tsx
 * <VerticalNavSubList>
 * 	<VerticalNavSubListItem key="1">
 * 		<VerticalNavSubLink active={true}>1</VerticalNavSubLink>
 * 	</VerticalNavSubListItem>
 * </VerticalNavSubList>
 * ```
 */
declare const VerticalNavSubLink: react.ForwardRefExoticComponent<Omit<VerticalNavSubLinkProps, "ref"> & react.RefAttributes<HTMLAnchorElement>>;

interface VerticalNavSubListProps extends PrimitivePropsWithRef<"ul"> {
}
/**
 * Use the Vertical Nav Sub List element as a wrapper for your list items under a {@link VerticalNavListItem}.
 * @param props - props to be passed to the {@link VerticalNavSubList } component
 * @see {@link VerticalNavSubListProps}
 *
 * @example
 * ```tsx
 *   <VerticalNavSubList>
 *     {children}
 *   </VerticalNavSubList>
 * ```
 */
declare const VerticalNavSubList: react.ForwardRefExoticComponent<Omit<VerticalNavSubListProps, "ref"> & react.RefAttributes<HTMLUListElement>>;

interface VerticalNavSubListItemProps extends PrimitivePropsWithRef<"li"> {
    /**
     * Whether the list item is disabled
     */
    disabled?: boolean;
}
/**
 * A Vertical nav sub list item is a list item that renders inside a submenu of the Vertical Nav.
 * @param props - props to be passed to the {@link VerticalNavSubListItem } component
 * @see {@link VerticalNavSubListItemProps}
 *
 * @example
 * ```tsx
 * <VerticalNavSubListItem />
 * ```
 */
declare const VerticalNavSubListItem: react.ForwardRefExoticComponent<Omit<VerticalNavSubListItemProps, "ref"> & react.RefAttributes<HTMLLIElement>>;

interface VerticalNavTextProps extends PrimitivePropsWithRef<"div"> {
}
/**
 * A text component for vertical navigation. Class is required for collapsing menu items.
 * @param props - props to be passed to the {@link VerticalNavText } component
 * @see {@link VerticalNavTextProps}
 *
 * @example
 * ```tsx
 *   <VerticalNavAccordionTrigger>
 *     <Datacenter className="nv-vertical-nav-icon" />
 *     <VerticalNavText>Datacenters</VerticalNavText>
 *   </VerticalNavAccordionTrigger>
 * ```
 */
declare const VerticalNavText: react.ForwardRefExoticComponent<Omit<VerticalNavTextProps, "ref"> & react.RefAttributes<HTMLDivElement>>;

interface VerticalNavAttributes {
    VerticalNavList?: NativeElementAttributes<"ul", typeof VerticalNavList>;
}
interface VerticalNavBaseItemAttributes {
    VerticalNavText?: NativeElementAttributes<"span", typeof VerticalNavText>;
    VerticalNavIcon?: NativeElementAttributes<"div", typeof VerticalNavIcon>;
}
interface VerticalNavItemAttributes extends VerticalNavBaseItemAttributes {
    VerticalNavAccordionRoot?: NativeElementAttributes<"div", typeof VerticalNavAccordionRoot>;
    VerticalNavAccordionItem?: NativeElementAttributes<"div", typeof VerticalNavAccordionItem>;
    VerticalNavAccordionTrigger?: NativeElementAttributes<"button", typeof VerticalNavAccordionTrigger>;
    VerticalNavAccordionContent?: NativeElementAttributes<"div", typeof VerticalNavAccordionContent>;
    VerticalNavSubList?: NativeElementAttributes<"ul", typeof VerticalNavSubList>;
    VerticalNavListItem?: NativeElementAttributes<"li", typeof VerticalNavListItem>;
    VerticalNavLink?: NativeElementAttributes<"a", typeof VerticalNavLink>;
}
interface VerticalNavSubItemAttributes extends VerticalNavBaseItemAttributes {
    VerticalNavSubListItem?: NativeElementAttributes<"li", typeof VerticalNavSubListItem>;
    VerticalNavSubLink?: NativeElementAttributes<"a", typeof VerticalNavSubLink>;
}
interface VerticalNavBaseItem {
    /**
     * Unique identifier for the navigation item
     */
    id: string;
    /**
     * The label content to display for the navigation item
     */
    slotLabel: react__default.ReactNode;
    /**
     * Optional icon to display alongside the label
     */
    slotIcon?: react__default.ReactNode;
    /**
     * If the header is a link, the URL that it links to
     */
    href?: string;
    /**
     * Whether this item is currently active
     */
    active?: boolean;
    /**
     * Whether this item is disabled
     */
    disabled?: boolean;
}
interface VerticalNavItem extends VerticalNavBaseItem {
    /**
     * Attributes to apply to the navigation item
     */
    attributes?: VerticalNavItemAttributes;
    /**
     * Whether the item should be open by default (only applies to items with subItems)
     */
    defaultOpen?: boolean;
    /**
     * Optional array of sub-navigation items
     */
    subItems?: VerticalNavSubItem[];
    /**
     * Controlled open state for the accordion (only applies to items with subItems).
     * When provided, the accordion becomes controlled and defaultOpen is ignored.
     */
    open?: boolean;
    /**
     * Callback that is called when the open state of the accordion changes.
     * Used with the open prop for controlled behavior.
     */
    onOpenChange?: (open: boolean) => void;
}
interface VerticalNavSubItem extends VerticalNavBaseItem {
    attributes?: VerticalNavSubItemAttributes;
}
interface VerticalNavProps extends Omit<VerticalNavRootProps, "ref"> {
    /**
     * Array of navigation items to render in the vertical nav
     */
    items: VerticalNavItem[];
    /**
     * Custom renderer for individual navigation links
     * @param item - The navigation item to render
     * @defaultValue defaultVerticalNavLinkRenderer
     */
    renderLink?: (item: VerticalNavItem) => react__default.ReactNode;
    /**
     * Custom renderer for individual navigation sublinks
     * @param item - The navigation item to render
     * @defaultValue defaultSubLinkRenderer
     */
    renderSubLink?: (subItem: VerticalNavSubItem, item: VerticalNavItem) => react__default.ReactNode;
    /**
     * Additional attributes to apply to the internal VerticalNav composed components
     */
    attributes?: VerticalNavAttributes;
}
/**
 * The VerticalNav component provides a vertical navigation menu structure that can handle both single links and nested link groups.
 * It uses default renderers for both individual links and link groups, which can be customized via props.
 *
 * By default:
 * - Individual links are rendered using defaultVerticalNavLinkRenderer which creates a basic navigation link
 * - Link groups (items with subItems) are rendered using defaultVerticalNavLinkGroupRenderer which creates a collapsible section with nested links
 *
 * @param props - props to be passed to the {@link VerticalNav } component
 * @see {@link VerticalNavProps}
 *
 * @example
 * ```tsx
 * const items = [
 *   {
 *     id: '1',
 *     slotLabel: 'Home',
 *     slotIcon: <HomeIcon />,
 *     href: '/',
 *     isActive: true,
 *     isDisabled: false,
 *     attributes: {
 *       VerticalNavLink: {
 *         className: 'custom-link'
 *       },
 *       VerticalNavIcon: {
 *         className: 'custom-icon'
 *       }
 *     }
 *   },
 *   {
 *     id: '2',
 *     slotLabel: 'Settings',
 *     slotIcon: <SettingsIcon />,
 *     href: '/settings',
 *     defaultOpen: true,
 *     isDisabled: false,
 *     attributes: {
 *       VerticalNavAccordionRoot: {
 *         className: 'custom-accordion'
 *       }
 *     },
 *     subItems: [
 *       {
 *         id: '2-1',
 *         slotLabel: 'Profile',
 *         slotIcon: <UserIcon />,
 *         href: '/settings/profile',
 *         isActive: false,
 *         isDisabled: false,
 *         attributes: {
 *           VerticalNavSubLink: {
 *             className: 'custom-sublink'
 *           }
 *         }
 *       },
 *       {
 *         id: '2-2',
 *         slotLabel: 'Account',
 *         slotIcon: <KeyIcon />,
 *         href: '/settings/account',
 *         isActive: false,
 *         isDisabled: true
 *       }
 *     ]
 *   }
 * ];
 *
 * <VerticalNav
 *   items={items}
 *   attributes={{
 *     VerticalNavRoot: {
 *       className: 'custom-root'
 *     },
 *     VerticalNavList: {
 *       className: 'custom-list'
 *     }
 *   }}
 * />
 * ```
 */
declare const VerticalNav: {
    ({ attributes, items, renderLink, renderSubLink, ...props }: VerticalNavProps): react_jsx_runtime.JSX.Element;
    displayName: string;
};

declare const VerticalNavTestIds: {
    readonly VerticalNavRoot: "nv-vertical-nav-root";
    readonly VerticalNavList: "nv-vertical-nav-list";
    readonly VerticalNavListItem: "nv-vertical-nav-list-item";
    readonly VerticalNavAccordionRoot: "nv-vertical-nav-accordion-root";
    readonly VerticalNavAccordionItem: "nv-vertical-nav-accordion-item";
    readonly VerticalNavAccordionTrigger: "nv-vertical-nav-accordion-trigger";
    readonly VerticalNavAccordionContent: "nv-vertical-nav-accordion-content";
    readonly VerticalNavIcon: "nv-vertical-nav-icon";
    readonly VerticalNavText: "nv-vertical-nav-text";
    readonly VerticalNavSubList: "nv-vertical-nav-sub-list";
    readonly VerticalNavSubListItem: "nv-vertical-nav-sub-list-item";
    readonly VerticalNavLink: "nv-vertical-nav-link";
    readonly VerticalNavSubLink: "nv-vertical-nav-sub-link";
};

declare module "react" {
    interface CSSProperties {
        [key: `--${string}`]: string | number;
    }
}

export { Accordion, AccordionContent, type AccordionContentProps, AccordionIcon, type AccordionIconProps, AccordionItem, type AccordionItemProps, type AccordionProps, AccordionRoot, type AccordionRootProps, AccordionTestIds, AccordionTrigger, type AccordionTriggerProps, Anchor, type AnchorProps, AnchorTestIds, AnimatedChevron, type AnimatedChevronProps, AnimatedChevronTestIds, AppBar, AppBarExpanderButton, AppBarHeight, AppBarHeightVariable, AppBarLogo, type AppBarProps, AppBarTestIds, Avatar, AvatarFallback, type AvatarFallbackProps, AvatarImage, type AvatarImageProps, type AvatarProps, AvatarRoot, type AvatarRootProps, AvatarTestIds, Badge, type BadgeProps, Banner, BannerActionsSection, type BannerActionsSectionProps, BannerCloseButtonSection, type BannerCloseButtonSectionProps, BannerContent, type BannerContentProps, BannerHeader, type BannerHeaderProps, BannerHeading, type BannerHeadingProps, BannerIcon, type BannerIconProps, BannerLayout, type BannerLayoutProps, type BannerProps, BannerRoot, type BannerRootProps, BannerSubheading, type BannerSubheadingProps, BannerTestIds, type BaseDropdownItem, type BaseMenuItem, Block, type BlockProps, BlockTestIds, Breadcrumbs, BreadcrumbsItem, type BreadcrumbsItemFieldProps, BreadcrumbsRoot, BreadcrumbsSeparator, Button, ButtonGroup, type ButtonGroupProps, ButtonGroupTestIds, type ButtonProps, Card, CardContent, type CardContentProps, CardMedia, type CardMediaProps, type CardProps, CardRoot, type CardRootProps, CardTestIds, Checkbox, CheckboxBox, type CheckboxBoxProps, CheckboxIndicator, type CheckboxIndicatorProps, type CheckboxProps, CheckboxRoot, type CheckboxRootProps, CheckboxTestIds, type CheckedState, Combobox, ComboboxContent, type ComboboxContentProps, ComboboxInput, type ComboboxInputProps, ComboboxItem, type ComboboxItemProps, type ComboboxProps, ComboboxRoot, type ComboboxRootProps, ComboboxSearchProvider, type ComboboxSearchProviderProps, ComboboxSelectedValue, type ComboboxSelectedValueProps, ComboboxTestIds, ComboboxTrigger, type ComboboxTriggerProps, DEFAULT_DATE_PICKER_FORMAT, DEFAULT_MATCH_FN, DENSITY_CLASS_NAMES, DatePicker, DatePickerCalendar, type DatePickerCalendarDayProps, DatePickerCalendarDropdown, type DatePickerCalendarDropdownProps, type DatePickerCalendarProps, DatePickerContent, type DatePickerContentProps, DatePickerInput, type DatePickerInputProps, DatePickerRangeTrigger, DatePickerRangeTriggerField, type DatePickerRangeTriggerFieldProps, type DatePickerRangeTriggerProps, DatePickerRoot, type DatePickerRootProps, DatePickerTestIds, DatePickerTrigger, type DatePickerTriggerProps, type Density, Divider, DividerElement, type DividerElementProps, type DividerProps, DividerRoot, type DividerRootProps, DividerTestIds, Dropdown, DropdownCheckboxItem, type DropdownCheckboxItemEntry, type DropdownCheckboxItemProps, DropdownContent, type DropdownContentProps, type DropdownDefaultItemEntry, type DropdownDividerItemEntry, type DropdownEntry, DropdownHeading, type DropdownHeadingProps, DropdownItem, type DropdownItemProps, type DropdownKind, type DropdownProps, DropdownRadioGroup, type DropdownRadioGroupEntry, DropdownRadioGroupItem, type DropdownRadioGroupItemProps, type DropdownRadioGroupProps, type DropdownRadioItemEntry, DropdownRoot, type DropdownRootProps, DropdownSection, type DropdownSectionEntry, type DropdownSectionProps, DropdownSub, DropdownSubContent, type DropdownSubContentProps, type DropdownSubProps, type DropdownSubSection, DropdownSubTrigger, type DropdownSubTriggerProps, DropdownTestIds, DropdownTrigger, type DropdownTriggerProps, Flex, type FlexProps, FormField, FormFieldContentGroup, type FormFieldContentGroupProps, type FormFieldContextArgs, FormFieldControlGroup, type FormFieldControlGroupProps, FormFieldHelper, type FormFieldHelperProps, FormFieldLabelGroup, type FormFieldLabelGroupProps, type FormFieldOrientation, type FormFieldProps, FormFieldRoot, type FormFieldRootProps, FormFieldTestIds, Grid, GridItem, type GridItemProps, type GridProps, Group, type GroupProps, GroupTestIds, Hero, HeroBody, type HeroBodyProps, HeroContent, type HeroContentProps, HeroFooter, type HeroFooterProps, HeroHeading, type HeroHeadingProps, HeroMedia, type HeroMediaProps, type HeroProps, HeroRoot, type HeroRootProps, HeroSubheading, type HeroSubheadingProps, HeroTestIds, HorizontalNav, type HorizontalNavItem, HorizontalNavLink, type HorizontalNavLinkProps, HorizontalNavList, type HorizontalNavListProps, type HorizontalNavProps, HorizontalNavRoot, type HorizontalNavRootProps, HorizontalNavTestIds, type HorizontalStepPosition, Inline, type InlineProps, Label, type LabelProps, LabelTestId, List, ListItem, type ListItemData, ListItemMarker, type ListItemMarkerProps, type ListItemProps, type ListProps, ListRoot, type ListRootProps, ListTestIds, Logo, type LogoProps, Menu, MenuCheckboxItem, type MenuCheckboxItemEntry, type MenuCheckboxItemProps, type MenuDefaultItemEntry, type MenuDividerItemEntry, type MenuEntry, MenuHeading, type MenuHeadingProps, MenuItem, type MenuItemProps, type MenuKind, type MenuProps, MenuRadioGroup, type MenuRadioGroupEntry, MenuRadioGroupItem, type MenuRadioGroupItemProps, type MenuRadioGroupProps, type MenuRadioItemEntry, MenuRoot, type MenuRootProps, MenuSearch, MenuSearchHandlersContext, type MenuSearchHandlersContextStore, type MenuSearchProps, MenuSearchProvider, type MenuSearchProviderProps, MenuSearchValueContext, type MenuSearchValueContextStore, MenuSection, type MenuSectionEntry, type MenuSectionProps, MenuTestIds, Modal, ModalContent, type ModalContentProps, ModalFooter, type ModalFooterProps, ModalHeading, type ModalHeadingProps, ModalMain, type ModalMainProps, type ModalProps, ModalRoot, type ModalRootProps, ModalTestIds, ModalTrigger, type ModalTriggerProps, Notification, NotificationContent, type NotificationContentProps, NotificationFooter, type NotificationFooterProps, NotificationHeader, type NotificationHeaderProps, NotificationHeading, type NotificationHeadingProps, NotificationIcon, type NotificationIconProps, type NotificationProps, NotificationRoot, type NotificationRootProps, NotificationSubheading, type NotificationSubheadingProps, NotificationTestIds, PREFERS_COLOR_SCHEME_DARK_QUERY, PageHeader, PageHeaderContent, type PageHeaderContentProps, PageHeaderDescription, type PageHeaderDescriptionProps, PageHeaderFooter, type PageHeaderFooterProps, PageHeaderHeader, type PageHeaderHeaderProps, PageHeaderHeading, type PageHeaderHeadingProps, PageHeaderMain, type PageHeaderMainProps, type PageHeaderProps, PageHeaderRoot, type PageHeaderRootProps, PageHeaderSubheading, type PageHeaderSubheadingProps, PageHeaderTestIds, Pagination, PaginationArrowButton, type PaginationArrowButtonProps, PaginationControlsGroup, type PaginationControlsGroupProps, PaginationItemRangeText, type PaginationItemRangeTextProps, PaginationNavigationGroup, type PaginationNavigationGroupProps, PaginationPageInput, type PaginationPageInputProps, PaginationPageList, type PaginationPageListProps, PaginationPageSizeSelect, type PaginationPageSizeSelectProps, type PaginationProps, PaginationRoot, type PaginationRootProps, PaginationTestIds, Panel, PanelContent, type PanelContentProps, PanelFooter, type PanelFooterProps, PanelHeader, type PanelHeaderProps, PanelHeading, type PanelHeadingProps, PanelIcon, type PanelIconProps, type PanelProps, PanelRoot, type PanelRootProps, PanelTestIds, Popover, PopoverAnchor, type PopoverAnchorProps, PopoverContent, type PopoverContentProps, type PopoverProps, PopoverRoot, type PopoverRootProps, PopoverTestIds, PopoverTrigger, type PopoverTriggerProps, ProgressBar, type ProgressBarProps, ProgressBarTestIds, RadioGroup, RadioGroupItem, type RadioGroupItemProps, type RadioGroupProps, RadioGroupRoot, type RadioGroupRootProps, RadioGroupTestIds, type RangeDatePickerProps, type ResolvedTheme, SegmentedControl, SegmentedControlItem, type SegmentedControlItemProps, type SegmentedControlProps, SegmentedControlRoot, type SegmentedControlRootProps, SegmentedControlTestIds, Select, SelectContent, type SelectContentProps, SelectContext, SelectItem, type SelectItemProps, type SelectProps, SelectRoot, type SelectRootProps, SelectTestIds, SelectTrigger, type SelectTriggerProps, type SelectTriggerVariantProps, SidePanel, SidePanelContent, type SidePanelContentProps, SidePanelFooter, type SidePanelFooterProps, SidePanelHeading, type SidePanelHeadingProps, SidePanelMain, type SidePanelMainProps, type SidePanelProps, SidePanelRoot, type SidePanelRootProps, SidePanelTestIds, SidePanelTrigger, type SidePanelTriggerProps, type SingleDatePickerProps, Skeleton, type SkeletonProps, SkeletonTestIds, Slider, type SliderProps, SliderRange, type SliderRangeProps$1 as SliderRangeProps, SliderRoot, type SliderRootBaseProps, type SliderRootProps, type SliderRootRangeProps, type SliderRootSingleProps, SliderSteps, type SliderStepsProps, SliderTestIds, SliderThumb, type SliderThumbProps, SliderTrack, type SliderTrackProps, Spinner, type SpinnerProps, Stack, type StackProps, StatusMessage, StatusMessageFooter, type StatusMessageFooterProps, StatusMessageHeader, type StatusMessageHeaderProps, StatusMessageHeading, type StatusMessageHeadingProps, StatusMessageMedia, type StatusMessageMediaProps, type StatusMessageProps, StatusMessageRoot, type StatusMessageRootProps, StatusMessageSubheading, type StatusMessageSubheadingProps, StatusMessageTestIds, Switch, type SwitchProps, SwitchRoot, type SwitchRootProps, SwitchTestIds, SwitchThumb, type SwitchThumbProps, SwitchTrack, type SwitchTrackProps, THEME_CLASS_NAMES, type TabItem, Table, TableBody, type TableBodyProps, TableBulkActionToolbar, type TableBulkActionToolbarProps, type TableCellData, type TableColumnDefinition, TableDataCell, type TableDataCellProps, TableHead, type TableHeadProps, TableHeaderCell, type TableHeaderCellProps, type TableProps, TableRoot, type TableRootProps, TableRow, type TableRowDefinition, type TableRowProps, TableTestIds, TableToolbar, type TableToolbarProps, Tabs, TabsContent, type TabsContentProps, TabsList, type TabsListProps, type TabsProps, type TabsPropsBase, type TabsPropsDivRoot, type TabsPropsNavRoot, TabsRoot, type TabsRootProps, TabsTestIds, TabsTrigger, type TabsTriggerProps, Tag, type TagProps, Text, TextArea, TextAreaElement, type TextAreaElementProps, type TextAreaProps, TextAreaRoot, type TextAreaRootProps, TextAreaTestIds, TextInput, TextInputElement, type TextInputElementProps, type TextInputProps, TextInputRoot, type TextInputRootProps, TextInputTestIds, type TextProps, TextTestIds, type Theme, ThemeContext, type ThemeContextType, ThemeProvider, type ThemeProviderProps, ThemeProviderTestIds, Toast, type ToastActionProps, ToastActions, ToastContent, type ToastContentProps, ToastIcon, type ToastIconProps, type ToastProps, ToastRoot, type ToastRootProps, ToastTestIds, ToastText, type ToastTextProps, Tooltip, TooltipContent, type TooltipContentProps, TooltipContext, type TooltipProps, TooltipProvider, type TooltipProviderProps, TooltipRoot, type TooltipRootProps, TooltipTrigger, type TooltipTriggerProps, VerticalNav, VerticalNavAccordionContent, type VerticalNavAccordionContentProps, VerticalNavAccordionItem, type VerticalNavAccordionItemProps, VerticalNavAccordionRoot, type VerticalNavAccordionRootProps, VerticalNavAccordionTrigger, type VerticalNavAccordionTriggerProps, type VerticalNavAttributes, VerticalNavIcon, type VerticalNavIconProps, type VerticalNavItem, type VerticalNavItemAttributes, VerticalNavLink, type VerticalNavLinkProps, VerticalNavList, VerticalNavListItem, type VerticalNavListItemProps, type VerticalNavListProps, type VerticalNavProps, VerticalNavRoot, type VerticalNavRootProps, type VerticalNavSubItem, type VerticalNavSubItemAttributes, VerticalNavSubLink, type VerticalNavSubLinkProps, VerticalNavSubList, VerticalNavSubListItem, type VerticalNavSubListItemProps, type VerticalNavSubListProps, VerticalNavTestIds, VerticalNavText, type VerticalNavTextProps, type VerticalStepPosition, checkboxIndicator, createSystemThemeListener, detectSystemThemePreference, getDensityClassName, getThemeClassName, logoMap, panelRoot, resolveTheme, useMenuSearchHandlers, useMenuSearchIsMatch, useParentThemeContext, useSelectContext, useTheme, useThemeContext, useThemeManager };
