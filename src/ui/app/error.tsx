"use client";

import { useEffect } from "react";
import { Button, Flex, Stack, Text } from "@kui/foundations-react-external";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    // In production, replace with proper error logging
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.error("Error:", error);
    }
  }, [error]);

  return (
    <Flex
      direction="col"
      align="center"
      justify="center"
      gap="6"
      className="h-screen bg-surface-base"
    >
      <Stack gap="2" align="center">
        <Text kind="title/lg" className="text-primary">
          Something went wrong
        </Text>
        <Text kind="body/regular/md" className="text-secondary">
          An unexpected error occurred. Please try again.
        </Text>
      </Stack>
      <Button kind="primary" color="brand" onClick={reset}>
        Try again
      </Button>
    </Flex>
  );
}
