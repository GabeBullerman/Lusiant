// Simple, self-contained payment method icons (no external deps).
// Each is a 38×24 card-style chip matching the methods accepted at checkout.

function Card({ children, bg = '#fff' }: { children: React.ReactNode; bg?: string }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-[3px] border border-gray-200"
      style={{ width: 38, height: 24, background: bg }}
    >
      {children}
    </span>
  )
}

export function PaymentIcons() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {/* Visa */}
      <Card>
        <span style={{ color: '#1A1F71', fontWeight: 700, fontStyle: 'italic', fontSize: 11, letterSpacing: 0.3 }}>
          VISA
        </span>
      </Card>

      {/* Mastercard */}
      <Card>
        <svg width="30" height="20" viewBox="0 0 30 20" aria-label="Mastercard">
          <circle cx="12" cy="10" r="6.5" fill="#EB001B" />
          <circle cx="18" cy="10" r="6.5" fill="#F79E1B" fillOpacity="0.9" />
        </svg>
      </Card>

      {/* American Express */}
      <Card bg="#2E77BC">
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 7.5, letterSpacing: 0.2 }}>AMEX</span>
      </Card>

      {/* Discover */}
      <Card>
        <span style={{ fontSize: 6.5, fontWeight: 700, color: '#111' }}>
          DISC<span style={{ color: '#F76B1C' }}>O</span>VER
        </span>
      </Card>

      {/* Diners Club */}
      <Card>
        <span style={{ fontSize: 6.5, fontWeight: 700, color: '#0079BE' }}>DINERS</span>
      </Card>

      {/* Apple Pay */}
      <Card>
        <span style={{ fontSize: 10, fontWeight: 600, color: '#111' }}> Pay</span>
      </Card>

      {/* Google Pay */}
      <Card>
        <span style={{ fontSize: 9, fontWeight: 600 }}>
          <span style={{ color: '#4285F4' }}>G</span>
          <span style={{ color: '#111' }}> Pay</span>
        </span>
      </Card>

      {/* Shop Pay */}
      <Card bg="#5A31F4">
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 8 }}>shop</span>
      </Card>
    </div>
  )
}
