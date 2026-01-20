import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { JSONViewer } from "./JSONViewer";

describe("JSONViewer", () => {
  it("renders title when provided", () => {
    render(<JSONViewer data={{ test: "value" }} title="Test Title" />);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("renders JSON string values", () => {
    render(<JSONViewer data={{ name: "test" }} />);
    expect(screen.getByText(/"test"/)).toBeInTheDocument();
  });

  it("renders JSON number values", () => {
    render(<JSONViewer data={{ count: 42 }} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders JSON boolean values", () => {
    render(<JSONViewer data={{ active: true }} />);
    expect(screen.getByText("true")).toBeInTheDocument();
  });

  it("renders JSON null values", () => {
    render(<JSONViewer data={{ empty: null }} />);
    expect(screen.getByText("null")).toBeInTheDocument();
  });

  it("renders JSON keys", () => {
    render(<JSONViewer data={{ myKey: "value" }} />);
    expect(screen.getByText(/"myKey"/)).toBeInTheDocument();
  });

  it("renders nested objects", () => {
    const data = {
      outer: {
        inner: "nested",
      },
    };
    render(<JSONViewer data={data} />);
    expect(screen.getByText(/"outer"/)).toBeInTheDocument();
    expect(screen.getByText(/"inner"/)).toBeInTheDocument();
  });

  it("renders arrays", () => {
    const data = { items: ["a", "b"] };
    render(<JSONViewer data={data} />);
    expect(screen.getByText(/"a"/)).toBeInTheDocument();
    expect(screen.getByText(/"b"/)).toBeInTheDocument();
  });

  it("has accessible region role", () => {
    render(<JSONViewer data={{ test: "value" }} title="Data" />);
    expect(screen.getByRole("region", { name: "Data" })).toBeInTheDocument();
  });
});
