import React from "react"

export const metadata = {
  title: 'Atropos Task Service',
  description: 'Simple task management frontend',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ 
        fontFamily: 'Arial, sans-serif', 
        margin: 0, 
        padding: '20px',
        backgroundColor: '#f5f5f5'
      }}>
        {children}
      </body>
    </html>
  )
} 