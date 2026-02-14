import styled, { css } from 'styled-components'

type BadgeStatus = 'pendiente' | 'enviado' | 'confirmado'

const statusStyles: Record<BadgeStatus, ReturnType<typeof css>> = {
  pendiente: css`
    background-color: #fef9c3;
    color: #854d0e;
  `,
  enviado: css`
    background-color: #dbeafe;
    color: #1e40af;
  `,
  confirmado: css`
    background-color: #dcfce7;
    color: #166534;
  `,
}

export const StyledBadge = styled.span<{ $status: BadgeStatus }>`
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  padding: 0.125rem 0.625rem;
  font-size: 0.75rem;
  font-weight: 500;

  ${({ $status }) => statusStyles[$status]}
`
