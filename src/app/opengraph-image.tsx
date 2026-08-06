import { ImageResponse } from 'next/og';

// Tamanho recomendado pelo OpenGraph e Twitter Cards
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';
export const alt = 'Hermes | Transactional Email Gateway';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
          <svg viewBox="0 0 100 100" width="160" height="160" style={{ marginRight: 32 }}>
            <path d="M26,22 L26,78 M74,22 L74,78" stroke="#f1f5f9" strokeWidth="9" strokeLinecap="round" fill="none"/>
            <path d="M26,58 L80,20 M68,20 L80,20 L80,32" stroke="#818cf8" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
          <div
            style={{
              fontSize: 100,
              fontWeight: 800,
              color: '#f8fafc',
              letterSpacing: '-0.04em',
            }}
          >
            Hermes
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            fontSize: 42,
            color: '#94a3b8',
            fontWeight: 500,
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.4,
          }}
        >
          <div>Gateway open-source para e-mails transacionais.</div>
          <div style={{ display: 'flex' }}>
            <span style={{ color: '#818cf8', marginRight: '8px' }}>SMTP, OAuth2 e Webhooks</span> em um só lugar.
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
