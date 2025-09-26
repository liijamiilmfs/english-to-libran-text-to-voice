'use client'

import { useEffect } from 'react'

export default function SimplePage() {
  console.log('Simple page rendering!')
  
  useEffect(() => {
    console.log('Simple page useEffect running!')
  }, [])
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#1e293b', 
      color: 'white', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>Simple Page</h1>
      <p>This is a basic page without any complex dependencies.</p>
      <p>Check the console for logs.</p>
    </div>
  )
}
