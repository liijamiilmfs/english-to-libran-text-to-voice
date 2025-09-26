'use client'

import { useState, useEffect } from 'react'

interface VersionInfo {
  version: string
  buildTime?: string
  gitHash?: string
}

export default function VersionDisplay({ className = '' }: { className?: string }) {
  const [versionInfo, setVersionInfo] = useState<VersionInfo>({ version: '1.0.0' })

  useEffect(() => {
    // In a real implementation, this could fetch from an API endpoint
    // For now, we'll use the package.json version
    const version = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0'
    const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME
    const gitHash = process.env.NEXT_PUBLIC_GIT_HASH

    setVersionInfo({
      version,
      buildTime,
      gitHash
    })
  }, [])

  return (
    <div className={`text-xs text-libran-gray-400 ${className}`}>
      <div className="flex items-center gap-2">
        <span className="font-mono">v{versionInfo.version}</span>
        {versionInfo.gitHash && (
          <span className="font-mono opacity-60">
            ({versionInfo.gitHash.slice(0, 7)})
          </span>
        )}
      </div>
      {versionInfo.buildTime && (
        <div className="text-xs opacity-60">
          Built {new Date(versionInfo.buildTime).toLocaleDateString()}
        </div>
      )}
    </div>
  )
}
