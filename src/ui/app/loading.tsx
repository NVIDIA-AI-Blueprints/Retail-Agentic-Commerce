import { Flex, Spinner, Text } from "@kui/foundations-react-external";

export default function Loading() {
  return (
    <Flex
      direction="col"
      align="center"
      justify="center"
      gap="4"
      className="h-screen bg-surface-base"
    >
      <Spinner size="large" aria-label="Loading content" />
      <Text kind="body/regular/md" className="text-secondary">
        Loading...
      </Text>
    </Flex>
  );
}
