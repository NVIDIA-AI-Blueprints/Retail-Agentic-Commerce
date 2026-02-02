"use client";

import { useCallback } from "react";
import type { ChangeEvent, FormEvent } from "react";

interface SearchPromptBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
}

export function SearchPromptBar({ value, onChange, onSubmit }: SearchPromptBarProps) {
  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (value.trim().length === 0) return;
      onSubmit(value);
    },
    [onSubmit, value]
  );

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    },
    [onChange]
  );

  const isDisabled = value.trim().length === 0;

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full items-center gap-2"
      aria-label="Search products"
    >
      <div className="nv-input nv-text-input-root flex-1">
        <input
          type="search"
          value={value}
          onChange={handleChange}
          placeholder="Search for products..."
          className="nv-text-input-element px-4"
          aria-label="Search query"
        />
      </div>
      <button
        type="submit"
        className="nv-button nv-button--primary nv-button--brand text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
        disabled={isDisabled}
      >
        Search
      </button>
    </form>
  );
}
