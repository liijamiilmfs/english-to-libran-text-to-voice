'use client'

import React from 'react'
import { Download } from 'lucide-react'

interface AudioDownloadButtonProps {
  audioBlob: Blob | null
  variant: 'ancient' | 'modern'
  content: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function AudioDownloadButton({ 
  audioBlob, 
  variant, 
  content, 
  size = 'md',
  className = ''
}: AudioDownloadButtonProps) {
  const handleDownload = () => {
    if (!audioBlob) return

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const variantLabel = variant === 'ancient' ? 'ancient' : 'modern'
    const contentPreview = content.slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_')
    const filename = `libran_${variantLabel}_${contentPreview}_${timestamp}.mp3`

    const url = URL.createObjectURL(audioBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!audioBlob) return null

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base'
  }

  return (
    <button
      onClick={handleDownload}
      className={`flex items-center space-x-1 bg-libran-accent/20 border border-libran-accent rounded text-white hover:bg-libran-accent/40 transition-colors ${sizeClasses[size]} ${className}`}
    >
      <Download className="w-3 h-3" />
      <span>Download</span>
    </button>
  )
}
