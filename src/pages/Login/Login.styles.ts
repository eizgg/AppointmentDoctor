import styled from 'styled-components'

export const LoginWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
  padding: 1rem;
`

export const LoginCard = styled.div`
  width: 100%;
  max-width: 28rem;
  background-color: #fff;
  border-radius: 1rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  padding: 2rem;
`

export const Logo = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #3b82f6;
  text-align: center;
  margin-bottom: 0.5rem;
`

export const Subtitle = styled.p`
  font-size: 0.875rem;
  color: #64748b;
  text-align: center;
  margin-bottom: 1.5rem;
`

export const TabContainer = styled.div`
  display: flex;
  border-bottom: 2px solid #e5e7eb;
  margin-bottom: 1.5rem;
`

export const Tab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: none;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  color: ${({ $active }) => ($active ? '#3b82f6' : '#64748b')};
  border-bottom: 2px solid ${({ $active }) => ($active ? '#3b82f6' : 'transparent')};
  margin-bottom: -2px;
  transition: color 150ms, border-color 150ms;

  &:hover {
    color: #3b82f6;
  }
`

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

export const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`

export const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
`

export const Input = styled.input`
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 150ms;
  box-sizing: border-box;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`

export const ErrorText = styled.span`
  font-size: 0.75rem;
  color: #ef4444;
`

export const SubmitButton = styled.button<{ $loading?: boolean }>`
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  background-color: #3b82f6;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: ${({ $loading }) => ($loading ? 'not-allowed' : 'pointer')};
  opacity: ${({ $loading }) => ($loading ? 0.7 : 1)};
  transition: background-color 150ms;

  &:hover:not(:disabled) {
    background-color: #2563eb;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`

export const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0.5rem 0;
  color: #9ca3af;
  font-size: 0.75rem;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background-color: #e5e7eb;
  }
`

export const GoogleButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 0.5rem;
  background-color: #fff;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 150ms;

  &:hover {
    background-color: #f9fafb;
  }
`

export const ApiError = styled.div`
  padding: 0.75rem;
  border-radius: 0.5rem;
  background-color: #fef2f2;
  color: #ef4444;
  font-size: 0.875rem;
  text-align: center;
`
