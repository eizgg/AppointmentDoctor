import styled from 'styled-components'

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-top: 1.5rem;
`

export const FieldGroup = styled.div`
  display: grid;
  gap: 1.25rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
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

export const SubmitButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 2.75rem;
  padding: 0 1.5rem;
  border: none;
  border-radius: 0.5rem;
  background-color: #3b82f6;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 150ms;
  align-self: flex-start;

  &:hover {
    background-color: #2563eb;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`
