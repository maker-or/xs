"use client";

import * as React from "react";
import { useTheme } from "next-themes";
// import { Moon, Sun } from "lucide-react";
import { Button } from "~/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // useEffect only runs on the client, so we can safely show the UI
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Render placeholder to avoid layout shift
    return (
      <Button variant="ghost" size="icon" className="w-10 h-10" disabled>
        <span className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      variant={theme === "dark" ? "secondary" : "default"}
      size="sm"
      
      className="gap-2"
      aria-label={
        theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
      }
      // leftIcon={
      //   theme === "dark" ? (
      //     <Sun className="h-4 w-4" />
      //   ) : (
      //     <Moon className="h-4 w-4" />
      //   )
      // }
    >
      <span className="sr-only md:not-sr-only md:inline-block">
        {theme === "dark" ? "Light Mode" : "Dark Mode"}
      </span>
    </Button>
  );
}
