'use client';

import { useTheme } from 'next-themes';
import * as React from 'react';
// import { Moon, Sun } from "lucide-react";
import { Button } from '~/components/ui/button';

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
      <Button className="h-10 w-10" disabled size="icon" variant="ghost">
        <span className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      aria-label={
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      }
      className="gap-2"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      size="sm"
      variant={theme === 'dark' ? 'secondary' : 'default'}
      // leftIcon={
      //   theme === "dark" ? (
      //     <Sun className="h-4 w-4" />
      //   ) : (
      //     <Moon className="h-4 w-4" />
      //   )
      // }
    >
      <span className="sr-only md:not-sr-only md:inline-block">
        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
      </span>
    </Button>
  );
}
