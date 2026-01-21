/**
 * Type declarations for KUI packages
 * These are linked packages that exist locally but need declarations for CI type checking
 */

declare module "@kui/foundations-react-external" {
  import type { ReactNode, FC } from "react";

  export interface ThemeProviderProps {
    children: ReactNode;
    theme?: "light" | "dark";
    density?: "compact" | "standard" | "comfortable";
    global?: boolean;
    target?: string;
  }
  export const ThemeProvider: FC<ThemeProviderProps>;

  export interface SpinnerProps {
    size?: "small" | "medium" | "large";
    "aria-label"?: string;
    description?: string;
  }
  export const Spinner: FC<SpinnerProps>;

  export interface FlexProps {
    children: ReactNode;
    gap?: string;
    align?: string;
    justify?: string;
    wrap?: string;
    direction?: "row" | "col";
    className?: string;
  }
  export const Flex: FC<FlexProps>;

  export interface StackProps {
    children: ReactNode;
    gap?: string;
    align?: string;
    className?: string;
  }
  export const Stack: FC<StackProps>;

  export interface TextProps {
    children: ReactNode;
    kind?: string;
    className?: string;
  }
  export const Text: FC<TextProps>;

  export interface ButtonProps {
    children: ReactNode;
    kind?: string;
    color?: string;
    size?: string;
    className?: string;
    onClick?: (() => void) | undefined;
    disabled?: boolean;
    "aria-label"?: string;
  }
  export const Button: FC<ButtonProps>;

  export interface CardProps {
    children: ReactNode;
    className?: string;
    interactive?: boolean;
    onClick?: () => void;
    slotMedia?: ReactNode;
  }
  export const Card: FC<CardProps>;

  export interface AppBarProps {
    slotLeft?: ReactNode;
    slotRight?: ReactNode;
    className?: string;
  }
  export const AppBar: FC<AppBarProps>;

  export interface BadgeProps {
    children: ReactNode;
    kind?: string;
    color?: string;
    className?: string;
  }
  export const Badge: FC<BadgeProps>;

  export interface DividerProps {
    orientation?: "horizontal" | "vertical";
  }
  export const Divider: FC<DividerProps>;

  export interface SelectItem {
    value: string;
    children: string;
  }
  export interface SelectProps {
    items: SelectItem[];
    value?: string;
    onValueChange?: (value: string) => void;
    placeholder?: string;
    size?: string;
    disabled?: boolean;
  }
  export const Select: FC<SelectProps>;
}

declare module "@kui/foundations-design-tokens" {
  export const spacingScale: Record<string, string>;
  export const fixedSpacingScale: Record<string, string>;
  export const semanticSpacingScale: Record<string, string>;
  export const designTokens: Record<string, unknown>;
  export function getColor(color: string): string;
}
