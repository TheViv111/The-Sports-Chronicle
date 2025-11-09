import { Moon, Sun, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/common/ThemeProvider"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  )

  // Set mounted to true after component mounts
  useEffect(() => {
    setMounted(true)
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }
    
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = () => {
    // Cycle through themes: system -> light -> dark -> system
    if (theme === 'system') {
      setTheme('light')
    } else if (theme === 'light') {
      setTheme('dark')
    } else {
      setTheme('system')
    }
  }

  // Don't render anything until component is mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="h-8 w-8 px-0" disabled>
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      </Button>
    )
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="h-8 w-8 px-0 relative" 
      onClick={toggleTheme}
      aria-label={`Toggle theme (current: ${theme}${theme === 'system' ? `, system is ${systemTheme}` : ''})`}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <Sun className="h-[1.2rem] w-[1.2rem] absolute transition-all" 
          style={{
            opacity: theme === 'light' ? 1 : 0,
            transform: `rotate(${theme === 'light' ? '0deg' : '-90deg'})`,
          }} 
        />
        <Moon className="h-[1.2rem] w-[1.2rem] absolute transition-all" 
          style={{
            opacity: theme === 'dark' ? 1 : 0,
            transform: `rotate(${theme === 'dark' ? '0deg' : '90deg'})`,
          }} 
        />
        <Monitor className="h-[1.2rem] w-[1.2rem] absolute transition-all" 
          style={{
            opacity: theme === 'system' ? 1 : 0,
            transform: `scale(${theme === 'system' ? 1 : 0.5})`,
          }} 
        />
      </div>
      <span className="sr-only">Toggle theme (current: {theme}{theme === 'system' ? `, system is ${systemTheme}` : ''})</span>
    </Button>
  )
}
