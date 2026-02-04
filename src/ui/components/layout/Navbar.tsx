"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AppBar, Text, Flex } from "@kui/foundations-react-external";

/**
 * Main navigation bar with NVIDIA branding
 * Transparent header that blends with the Nebula background
 */
export function Navbar() {
  const pathname = usePathname();

  return (
    <div className="transparent-header">
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
        slotRight={
          <Flex align="center" gap="2">
            <Link href="/" className={`nav-link ${pathname === "/" ? "nav-link-active" : ""}`}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              <span className="hidden sm:inline">Simulator</span>
            </Link>
            <Link
              href="/metrics"
              className={`nav-link ${pathname === "/metrics" ? "nav-link-active" : ""}`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
              <span className="hidden sm:inline">Metrics</span>
            </Link>
          </Flex>
        }
      />
    </div>
  );
}
