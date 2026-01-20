"use client";

import Image from "next/image";
import { AppBar, Text, Flex } from "@kui/foundations-react-external";

/**
 * Main navigation bar with NVIDIA branding
 */
export function Navbar() {
  return (
    <AppBar
      slotLeft={
        <Flex align="center" gap="3">
          <Image
            src="/logo.png"
            alt="NVIDIA Logo"
            width={40}
            height={40}
            priority
            className="object-contain"
          />
          <Text kind="label/bold/lg" className="text-primary hidden sm:block">
            Agentic Commerce
          </Text>
        </Flex>
      }
      slotRight={
        <Text kind="label/regular/sm" className="text-secondary">
          Protocol Inspector
        </Text>
      }
    />
  );
}
