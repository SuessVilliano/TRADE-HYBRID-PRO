// Simple toast wrapper around Sonner
import { useCallback } from "react"
import { toast as sonnerToast } from "sonner"

// Define the Toast interface for our application
interface ToastProps {
  title?: React.ReactNode
  description?: React.ReactNode
  variant?: "default" | "destructive"
}

export function useToast() {
  const toast = useCallback(
    ({ title, description, variant = "default" }: ToastProps) => {
      return sonnerToast(title as string, {
        description,
        className: variant === "destructive" ? "bg-red-100" : undefined,
      })
    },
    []
  )

  return {
    toast,
  }
}