 import { describe, it, expect, vi } from "vitest";
 import { render, screen, fireEvent } from "@testing-library/react";
 import { SearchPromptBar } from "./SearchPromptBar";
 
 describe("SearchPromptBar", () => {
   it("renders input and button", () => {
     render(
       <SearchPromptBar value="" onChange={vi.fn()} onSubmit={vi.fn()} />
     );
 
     expect(screen.getByLabelText("Search query")).toBeInTheDocument();
     expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
   });
 
   it("calls onChange when typing", () => {
     const onChange = vi.fn();
     render(<SearchPromptBar value="" onChange={onChange} onSubmit={vi.fn()} />);
 
     const input = screen.getByLabelText("Search query");
     fireEvent.change(input, { target: { value: "graphic tee" } });
 
     expect(onChange).toHaveBeenCalledWith("graphic tee");
   });
 
   it("calls onSubmit with current value", () => {
     const onSubmit = vi.fn();
     render(
       <SearchPromptBar value="summer tee" onChange={vi.fn()} onSubmit={onSubmit} />
     );
 
     fireEvent.submit(screen.getByLabelText("Search products"));
 
     expect(onSubmit).toHaveBeenCalledWith("summer tee");
   });
 
   it("disables submit button when input is empty", () => {
     render(
       <SearchPromptBar value=" " onChange={vi.fn()} onSubmit={vi.fn()} />
     );
 
     expect(screen.getByRole("button", { name: "Search" })).toBeDisabled();
   });

  it("uses Kaizen button styling and padded layout", () => {
    render(<SearchPromptBar value="" onChange={vi.fn()} onSubmit={vi.fn()} />);

    const button = screen.getByRole("button", { name: "Search" });
    expect(button).toHaveClass("nv-button");
    expect(button).toHaveClass("nv-button--primary");
    expect(button).toHaveClass("nv-button--brand");

  });
 });
