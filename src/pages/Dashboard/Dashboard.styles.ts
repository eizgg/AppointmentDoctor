import styled from 'styled-components'

/* ── Header resumen ── */

export const SummaryBar = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;

  @media (min-width: 640px) {
    gap: 1rem;
  }
`

export const SummaryCard = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  border-radius: 0.75rem;
  background-color: #fff;
  border: 1px solid #e5e7eb;
  padding: 0.75rem 0.5rem;

  @media (min-width: 640px) {
    flex-direction: row;
    justify-content: center;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
  }
`

export const SummaryValue = styled.span`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  line-height: 1;
`

export const SummaryLabel = styled.span`
  font-size: 0.75rem;
  color: #6b7280;
  text-align: center;

  @media (min-width: 640px) {
    font-size: 0.875rem;
    text-align: left;
  }
`

export const CountBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.25rem;
  height: 1.25rem;
  border-radius: 9999px;
  background-color: #ef4444;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0 0.35rem;
  margin-left: 0.25rem;
`

/* ── Secciones ── */

export const Section = styled.section`
  margin-bottom: 2rem;
`

export const SectionHeader = styled.h2`
  font-size: 1.125rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 1rem;
`

export const CardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`

export const CardBody = styled.p`
  font-size: 0.875rem;
  color: #4b5563;
`

export const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.75rem;
`

export const EmptyMessage = styled.p`
  font-size: 0.9375rem;
  color: #9ca3af;
  text-align: center;
  padding: 2rem 1rem;
  border: 1px dashed #d1d5db;
  border-radius: 0.75rem;
`

export const LoadingWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem 1rem;
  color: #6b7280;
  font-size: 0.9375rem;
`

export const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 0.75rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  font-size: 0.875rem;
`
