"use client";

import Image from "next/image";
import { AppBar, Text, Flex } from "@kui/foundations-react-external";

/**
 * Main navigation bar with NVIDIA branding
 * Clean, minimal header that doesn't compete with panel content
 */
export function Navbar() {
  return (
    <div className="border-b border-[#222] bg-[#0a0a0a]">
      <AppBar
        slotLeft={
          <Flex align="center" gap="3">
            <Image
              src="/logo.png"
              alt="NVIDIA Logo"
              width={36}
              height={36}
              priority
              className="object-contain"
            />
            <Text kind="label/semibold/md" className="text-gray-100 hidden sm:block">
              Agentic Commerce
            </Text>
          </Flex>
        }
      />
    </div>
  );
}
