import styled from 'styled-components'

export const Toolbar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: 1.5rem 0 1rem;
`

export const AddButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.5rem;
  padding: 0 1rem;
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

export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const CentroCard = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background-color: #fff;
  padding: 1.25rem;
`

export const CentroHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`

export const CentroName = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: #111827;
`

export const DefaultTag = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  background-color: #dcfce7;
  color: #166534;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
`

export const EmailRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  padding: 0.375rem 0;

  & + & {
    border-top: 1px solid #f3f4f6;
  }
`

export const EmailLabel = styled.span`
  font-size: 0.6875rem;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.025em;
`

export const EmailValue = styled.span`
  font-size: 0.9375rem;
  color: #111827;
`

export const CardActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`

export const SecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  min-height: 2.25rem;
  padding: 0 0.875rem;
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

export const DangerButton = styled(SecondaryButton)`
  color: #dc2626;
  border-color: #fecaca;

  &:hover {
    background-color: #fef2f2;
    border-color: #ef4444;
  }
`

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  background-color: #fff;
  padding: 1.25rem;
`

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`

export const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
`

export const Input = styled.input<{ $error?: boolean }>`
  width: 100%;
  min-height: 2.75rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid ${({ $error }) => ($error ? '#ef4444' : '#d1d5db')};
  font-size: 1rem;
  color: #111827;
  background-color: #fff;
  outline: none;
  transition: border-color 150ms;
  box-sizing: border-box;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    border-color: ${({ $error }) => ($error ? '#ef4444' : '#3b82f6')};
    box-shadow: 0 0 0 3px ${({ $error }) => ($error ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)')};
  }
`

export const ErrorText = styled.span`
  font-size: 0.8125rem;
  color: #ef4444;
`

export const CheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
`

export const FormActions = styled.div`
  display: flex;
  gap: 0.5rem;
`

export const SubmitButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.5rem;
  padding: 0 1.25rem;
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

export const StateMessage = styled.p`
  padding: 1.5rem 0;
  color: #6b7280;
  font-size: 0.9375rem;
`

export const ErrorBanner = styled.div`
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 1rem;
`
