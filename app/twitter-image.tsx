import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
 
export const alt = 'Population Simulator - Visualize demographic futures'
export const size = {
  width: 1200,
  height: 630,
}
 
export const contentType = 'image/png'
 
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 20,
          }}
        >
          {/* Title */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 900,
              letterSpacing: -2,
              display: 'flex',
              alignItems: 'center',
              gap: 20,
            }}
          >
            <span style={{ fontSize: 80 }}>🌍</span>
            Population Simulator
          </div>
          
          {/* Subtitle */}
          <div
            style={{
              fontSize: 32,
              fontWeight: 400,
              opacity: 0.9,
              maxWidth: 800,
              textAlign: 'center',
            }}
          >
            Visualize demographic futures with real-time birth rate simulations
          </div>
          
          {/* Icons row */}
          <div
            style={{
              display: 'flex',
              gap: 40,
              marginTop: 30,
              fontSize: 48,
            }}
          >
            <span>📊</span>
            <span>👥</span>
            <span>🚀</span>
            <span>🌙</span>
            <span>🔮</span>
          </div>
          
          {/* Creator */}
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              fontSize: 24,
              fontWeight: 600,
              opacity: 0.8,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            Created by YonYonWare
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}