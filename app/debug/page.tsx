'use client'

export default function DebugPage() {
  console.log('Debug page is rendering!')
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#1e293b', 
      color: 'white', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1>Debug Page</h1>
      <p>If you can see this, React is working!</p>
      <p>Check the console for logs.</p>
    </div>
  )
}
