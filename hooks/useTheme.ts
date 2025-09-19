import { useEffect, useState } from 'react';
import { useTheme as useNextTheme } from 'next-themes';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const { theme, setTheme, systemTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);
  
  // When component mounts, we know we're on the client
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Check if the current theme is dark
  const isDark = resolvedTheme === 'dark';
  
  // Toggle between light and dark theme
  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };
  
  // Set theme explicitly
  const setThemeMode = (newTheme: Theme) => {
    setTheme(newTheme);
  };
  
  // Get the current active theme (resolved from system if set to 'system')
  const currentTheme = theme === 'system' ? systemTheme : theme;
  
  return {
    // The current theme ('light', 'dark', or 'system')
    theme: theme as Theme,
    
    // The resolved theme (always 'light' or 'dark')
    resolvedTheme: resolvedTheme as 'light' | 'dark',
    
    // The system preference
    systemTheme: systemTheme as 'light' | 'dark' | undefined,
    
    // The current active theme (resolved from system if set to 'system')
    currentTheme: currentTheme as 'light' | 'dark' | undefined,
    
    // Whether the current theme is dark
    isDark,
    
    // Whether the theme is set to follow system preference
    isSystem: theme === 'system',
    
    // Whether the component has mounted (useful for avoiding hydration mismatches)
    mounted,
    
    // Function to toggle between light and dark theme
    toggleTheme,
    
    // Function to set the theme explicitly
    setTheme: setThemeMode,
  };
}

export default useTheme;
