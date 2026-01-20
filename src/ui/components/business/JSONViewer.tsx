"use client";

import { Text, Stack } from "@kui/foundations-react-external";

interface JSONViewerProps {
  data: unknown;
  title?: string;
}

/**
 * Syntax-highlighted JSON viewer component
 */
export function JSONViewer({ data, title }: JSONViewerProps) {
  // Format JSON with syntax highlighting using regex replacement
  const formatJSON = (obj: unknown): string => {
    return JSON.stringify(obj, null, 2);
  };

  const highlightJSON = (json: string): React.ReactNode[] => {
    const lines = json.split("\n");
    return lines.map((line, lineIndex) => {
      // Highlight keys (text before colon in quotes)
      const highlightedLine = line
        .replace(/"([^"]+)":/g, '<span class="json-key">"$1"</span>:')
        .replace(/: "([^"]*)"(,?)$/g, ': <span class="json-string">"$1"</span>$2')
        .replace(/: (\d+)(,?)$/g, ': <span class="json-number">$1</span>$2')
        .replace(/: (true|false)(,?)$/g, ': <span class="json-boolean">$1</span>$2')
        .replace(/: (null)(,?)$/g, ': <span class="json-null">$1</span>$2');

      return (
        <span key={`line-${lineIndex}`}>
          <span dangerouslySetInnerHTML={{ __html: highlightedLine }} />
          {lineIndex < lines.length - 1 && "\n"}
        </span>
      );
    });
  };

  const jsonString = formatJSON(data);

  return (
    <Stack gap="2">
      {title && (
        <Text kind="label/semibold/sm" className="text-secondary">
          {title}
        </Text>
      )}
      <div
        className="bg-surface-sunken rounded-lg p-4 overflow-x-auto"
        role="region"
        aria-label={title ?? "JSON data"}
      >
        <pre className="text-mono-sm text-primary leading-relaxed whitespace-pre">
          <code>{highlightJSON(jsonString)}</code>
        </pre>
      </div>
    </Stack>
  );
}
