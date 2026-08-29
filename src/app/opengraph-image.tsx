import { ImageResponse } from 'next/og';
import { site } from '@/config/site';

/**
 * Imagem de Open Graph gerada no servidor (sem arquivo estático para manter).
 * Usa a paleta e o desenho do check da marca — o mesmo que aparece no site.
 */
export const runtime = 'edge';
export const alt = `${site.legalName} — ${site.positioning}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#04060B',
          padding: '72px 80px',
          position: 'relative',
        }}
      >
        {/* brilho */}
        <div
          style={{
            position: 'absolute',
            top: -220,
            right: -180,
            width: 720,
            height: 720,
            borderRadius: 9999,
            background:
              'radial-gradient(circle, rgba(11,100,252,0.42) 0%, rgba(2,179,249,0.14) 45%, rgba(4,6,11,0) 72%)',
          }}
        />

        {/* topo: marca */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <svg width="86" height="54" viewBox="0 0 100 62">
            <defs>
              <linearGradient id="og" x1="0" y1="1" x2="1" y2="0">
                <stop offset="0%" stopColor="#0B64FC" />
                <stop offset="100%" stopColor="#02B3F9" />
              </linearGradient>
            </defs>
            <path d="M6 33 L28 56 L94 6" fill="none" stroke="url(#og)" strokeWidth="14" />
          </svg>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                fontSize: 46,
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '-0.02em',
              }}
            >
              FIXSEG
            </div>
            <div
              style={{
                fontSize: 17,
                color: '#02B3F9',
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
              }}
            >
              Corretora de Seguros
            </div>
          </div>
        </div>

        {/* título */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              fontSize: 74,
              fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.035em',
              lineHeight: 1.04,
              maxWidth: 940,
            }}
          >
            Proteção para o que realmente importa.
          </div>
          <div style={{ fontSize: 28, color: 'rgba(233,240,250,0.62)', maxWidth: 860 }}>
            Vida · Auto · Frota · Caminhão · Transportes · Residencial · Empresarial ·
            Responsabilidade Civil · Garantia · Riscos Diversos
          </div>
        </div>

        {/* base */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              height: 4,
              width: 120,
              borderRadius: 9999,
              background: 'linear-gradient(90deg, #0B64FC, #02B3F9)',
            }}
          />
          <div style={{ fontSize: 22, color: 'rgba(233,240,250,0.5)' }}>
            Atendimento personalizado para pessoas e empresas
          </div>
        </div>
      </div>
    ),
    size,
  );
}
