import styled, { css } from 'styled-components'

type ButtonVariant = 'primary' | 'secondary' | 'danger'

const variantStyles: Record<ButtonVariant, ReturnType<typeof css>> = {
  primary: css`
    background-color: #3b82f6;
    color: #fff;
    &:hover { background-color: #2563eb; }
  `,
  secondary: css`
    background-color: #e5e7eb;
    color: #374151;
    &:hover { background-color: #d1d5db; }
  `,
  danger: css`
    background-color: #ef4444;
    color: #fff;
    &:hover { background-color: #dc2626; }
  `,
}

export const StyledButton = styled.button<{ $variant: ButtonVariant }>`
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  padding: 0 1.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: background-color 150ms;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  ${({ $variant }) => variantStyles[$variant]}
`
