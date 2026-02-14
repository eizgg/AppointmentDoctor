import styled, { css } from 'styled-components'

/* ── Layout ── */

export const BackLink = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #3b82f6;
  text-decoration: none;
  cursor: pointer;
  margin-bottom: 1rem;

  &:hover {
    color: #2563eb;
  }
`

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 1.5rem;
`

export const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
`

export const Subtitle = styled.p`
  font-size: 0.9375rem;
  color: #6b7280;
`

export const Grid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  @media (min-width: 768px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
`

/* ── Secciones / Cards ── */

export const Section = styled.section`
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background-color: #fff;
  padding: 1.25rem;
`

export const SectionTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
`

/* ── PDF Preview ── */

export const PdfPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 10rem;
  border-radius: 0.5rem;
  background-color: #f9fafb;
  border: 1px dashed #d1d5db;
  color: #9ca3af;
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
`

export const DownloadButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.5rem;
  padding: 0 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background-color: #fff;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms;

  &:hover {
    background-color: #f3f4f6;
    border-color: #9ca3af;
  }
`

/* ── Info extraída ── */

export const InfoRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: 0.625rem 0;

  & + & {
    border-top: 1px solid #f3f4f6;
  }
`

export const InfoLabel = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.025em;
`

export const InfoValue = styled.span`
  font-size: 0.9375rem;
  color: #111827;
`

export const ChipList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.25rem;
`

export const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  background-color: #eff6ff;
  color: #1d4ed8;
  font-size: 0.8125rem;
  font-weight: 500;
`

/* ── Timeline ── */

export const StatusBadge = styled.div<{ $status: 'pendiente' | 'enviado' | 'confirmado' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1.25rem;

  ${({ $status }) =>
    $status === 'pendiente' &&
    css`
      background-color: #fef9c3;
      color: #854d0e;
    `}
  ${({ $status }) =>
    $status === 'enviado' &&
    css`
      background-color: #dbeafe;
      color: #1e40af;
    `}
  ${({ $status }) =>
    $status === 'confirmado' &&
    css`
      background-color: #dcfce7;
      color: #166534;
    `}
`

export const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  position: relative;
  padding-left: 1.75rem;
`

export const TimelineItem = styled.div<{ $done: boolean; $last?: boolean }>`
  position: relative;
  padding-bottom: ${({ $last }) => ($last ? '0' : '1.25rem')};

  /* Línea vertical */
  ${({ $last, $done }) =>
    !$last &&
    css`
      &::before {
        content: '';
        position: absolute;
        left: -1.25rem;
        top: 0.75rem;
        width: 2px;
        height: 100%;
        background-color: ${$done ? '#3b82f6' : '#e5e7eb'};
      }
    `}
`

export const TimelineDot = styled.div<{ $done: boolean }>`
  position: absolute;
  left: -1.75rem;
  top: 0.125rem;
  width: 1rem;
  height: 1rem;
  border-radius: 9999px;
  border: 2px solid ${({ $done }) => ($done ? '#3b82f6' : '#d1d5db')};
  background-color: ${({ $done }) => ($done ? '#3b82f6' : '#fff')};

  ${({ $done }) =>
    $done &&
    css`
      &::after {
        content: '✓';
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 0.6rem;
        font-weight: 700;
      }
    `}
`

export const TimelineLabel = styled.span<{ $done: boolean }>`
  font-size: 0.875rem;
  font-weight: ${({ $done }) => ($done ? '600' : '400')};
  color: ${({ $done }) => ($done ? '#111827' : '#9ca3af')};
`

export const TimelineDate = styled.span`
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.125rem;
`

/* ── Turno confirmado ── */

export const TurnoCard = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
`

export const TurnoIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  background-color: #dcfce7;
  color: #16a34a;
  flex-shrink: 0;
`

export const TurnoInfo = styled.div`
  flex: 1;
`

export const TurnoDate = styled.p`
  font-size: 0.9375rem;
  font-weight: 600;
  color: #111827;
`

export const TurnoMeta = styled.p`
  font-size: 0.8125rem;
  color: #6b7280;
  margin-top: 0.125rem;
`

/* ── CTA ── */

export const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 2.75rem;
  width: 100%;
  padding: 0 1.25rem;
  margin-top: 1rem;
  border: none;
  border-radius: 0.5rem;
  background-color: #3b82f6;
  color: #fff;
  font-size: 0.9375rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms;

  &:hover {
    background-color: #2563eb;
  }
`
