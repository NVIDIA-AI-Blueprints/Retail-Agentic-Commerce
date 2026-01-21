"use client";

import { Stack, Flex, Text, Badge } from "@kui/foundations-react-external";

/**
 * Right panel showing merchant/retailer view
 */
export function BusinessPanel() {
  return (
    <section
      className="flex-1 flex flex-col h-full overflow-hidden bg-surface-base rounded-lg"
      aria-label="Merchant Panel"
    >
      {/* Header */}
      <Flex align="center" justify="start" className="px-6 pt-6 pb-4 border-b border-base">
        <Badge kind="outline" color="gray">
          Merchant
        </Badge>
      </Flex>

      {/* Empty content with placeholder */}
      <div className="flex-1 flex items-center justify-center">
        <Stack gap="2" align="center">
          <Text kind="body/regular/md" className="text-secondary">
            Select a product to load settings and start the ACP flow.
          </Text>
        </Stack>
      </div>
    </section>
  );
}
