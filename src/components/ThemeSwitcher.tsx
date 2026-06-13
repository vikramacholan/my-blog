"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-16 w-full mb-6"></div>;
  }

  return (
    <div className="flex flex-col space-y-2 mb-6">
      <label htmlFor="theme-select" className="text-sm font-medium text-gray-700">
        Theme
      </label>
      <select
        id="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value)}
        className="block w-full rounded-md border-gray-300 bg-white py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm text-gray-900 border"
      >
        <option value="light">Light</option>
        <option value="mocha">Catppuccin Mocha</option>
      </select>
    </div>
  );
}
