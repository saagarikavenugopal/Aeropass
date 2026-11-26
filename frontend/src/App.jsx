import { useState, useEffect } from 'react'

export default function App() {
  const [passenger, setPassenger] = useState(null)
  const [officer, setOfficer] = useState(null)

  useEffect(() => {
    try {
      const p = sessionStorage.getItem('aeropass_user_session') || localStorage.getItem('aeropass_user_session')
      const o = sessionStorage.getItem('aeropass_officer_session')
      if (p) setPassenger(JSON.parse(p))
      if (o) setOfficer(JSON.parse(o))
    } catch (e) {
      // ignore JSON errors
    }
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#FAF8F4',
      color: '#292526',
      fontFamily: "'Inter', system-ui, sans-serif",
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        maxWidth: '560px',
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #EAE4DD',
        boxShadow: '0 12px 35px rgba(100, 28, 50, 0.08)',
        padding: '2.5rem',
        textAlign: 'center'
      }}>
        {/* Crest Logo */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #641C32 0%, #421322 100%)',
          border: '1.5px solid #9A7A45',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
          boxShadow: '0 4px 12px rgba(100, 28, 50, 0.25)'
        }}>
          <span style={{ color: '#C5A46D', fontSize: '28px', fontWeight: 'bold' }}>✈</span>
        </div>

        <div style={{
          display: 'inline-block',
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          backgroundColor: '#FAF8F4',
          border: '1px solid #C5A46D',
          color: '#641C32',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: '1rem'
        }}>
          Luxury Aviation Platform
        </div>

        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: '2rem',
          fontWeight: 700,
          color: '#641C32',
          margin: '0 0 0.5rem',
          lineHeight: 1.2
        }}>
          Your Journey. <span style={{ fontStyle: 'italic', fontWeight: 400, color: '#C5A46D' }}>Elevated.</span>
        </h1>

        <p style={{
          fontSize: '0.9rem',
          color: '#89837F',
          lineHeight: 1.6,
          margin: '0 0 2rem'
        }}>
          Experience a smarter, smoother and more seamless airport journey with Aeropass international biometric clearance.
        </p>

        {passenger && (
          <div style={{
            backgroundColor: '#F5E8EC',
            border: '1px solid #C5A46D',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
            color: '#641C32',
            fontWeight: 600
          }}>
            Active Passenger: {passenger.legalName || passenger.email}
          </div>
        )}

        {officer && (
          <div style={{
            backgroundColor: '#FAF8F4',
            border: '1px solid #C5A46D',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
            color: '#421322',
            fontWeight: 600
          }}>
            Active Officer Badge: {officer.officerBadge || officer.username}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <a href="/Dashboard.html" style={{
            display: 'block',
            padding: '0.85rem 1.25rem',
            background: 'linear-gradient(135deg, #641C32 0%, #421322 100%)',
            color: '#FFFFFF',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
            border: '1px solid #C5A46D',
            boxShadow: '0 4px 14px rgba(100, 28, 50, 0.25)'
          }}>
            Passenger Dashboard &rarr;
          </a>

          <a href="/Admin.html" style={{
            display: 'block',
            padding: '0.85rem 1.25rem',
            backgroundColor: '#FAF8F4',
            color: '#292526',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
            border: '1px solid #EAE4DD'
          }}>
            Sign In &amp; Registration Portal
          </a>

          <a href="/Officer.html" style={{
            display: 'block',
            padding: '0.85rem 1.25rem',
            backgroundColor: '#FAF8F4',
            color: '#292526',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
            border: '1px solid #EAE4DD'
          }}>
            Officer Turnstile Station
          </a>
        </div>
      </div>
    </div>
  )
}
