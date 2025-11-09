import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check for saved theme preference first
    const savedTheme = localStorage.getItem(storageKey) as Theme | null
    
    // If no saved preference, use the default theme
    if (!savedTheme) {
      // If default is system, we'll use the system preference
      if (defaultTheme === 'system') {
        return 'system';
      }
      return defaultTheme;
    }
    
    return savedTheme;
  })

  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove all theme classes first from both html and body
    root.classList.remove('light', 'dark')
    document.body.classList.remove('light', 'dark')
    
    // Determine which theme to apply
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const themeToApply = theme === 'system' ? systemTheme : theme
    
    // Add the appropriate theme class to both html and body
    if (themeToApply === 'dark') {
      root.classList.add('dark')
      document.body.classList.add('dark')
    } else {
      root.classList.add('light')
      document.body.classList.add('light')
    }
    
    // Set the color scheme for form controls and other elements
    root.style.colorScheme = themeToApply
    
    // Add smooth transition classes
    root.classList.add('transition-colors', 'duration-200')
    
    // Store the theme preference
    localStorage.setItem(storageKey, theme)
    
    // For debugging
    console.log('Theme settings:', { 
      selectedTheme: theme, 
      systemTheme,
      appliedTheme: themeToApply,
      htmlClass: root.className,
      bodyClass: document.body.className
    })
  }, [theme, storageKey])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}