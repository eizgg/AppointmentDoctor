import styled, { css } from 'styled-components'

export const DropZone = styled.div<{ $isDragging: boolean; $hasFile: boolean }>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-height: 12rem;
  padding: 2rem 1.5rem;
  border-radius: 0.75rem;
  border: 2px dashed #d1d5db;
  background-color: #f9fafb;
  cursor: pointer;
  transition: all 200ms ease;

  ${({ $isDragging }) =>
    $isDragging &&
    css`
      border-color: #3b82f6;
      background-color: #eff6ff;
    `}

  ${({ $hasFile }) =>
    $hasFile &&
    css`
      border-style: solid;
      border-color: #10b981;
      background-color: #f0fdf4;
      cursor: default;
    `}

  &:hover {
    border-color: ${({ $hasFile }) => ($hasFile ? '#10b981' : '#3b82f6')};
  }
`

export const HiddenInput = styled.input`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
`

export const IconWrapper = styled.div<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  background-color: ${({ $active }) => ($active ? '#dbeafe' : '#f3f4f6')};
  color: ${({ $active }) => ($active ? '#3b82f6' : '#9ca3af')};
  transition: all 200ms;
`

export const DropText = styled.p`
  font-size: 0.9375rem;
  color: #6b7280;
  text-align: center;
  line-height: 1.5;
`

export const DropHighlight = styled.span`
  color: #3b82f6;
  font-weight: 600;
`

export const DropHint = styled.p`
  font-size: 0.8125rem;
  color: #9ca3af;
`

/* ── Preview del archivo ── */

export const FilePreview = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  background-color: #fff;
  margin-top: 1rem;
`

export const FileIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.5rem;
  background-color: #fee2e2;
  color: #ef4444;
  flex-shrink: 0;
`

export const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
`

export const FileName = styled.p`
  font-size: 0.875rem;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const FileSize = styled.p`
  font-size: 0.8125rem;
  color: #6b7280;
  margin-top: 0.125rem;
`

export const RemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.5rem;
  border: none;
  background-color: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 150ms;

  &:hover {
    background-color: #fee2e2;
    color: #ef4444;
  }
`

export const ErrorMessage = styled.p`
  font-size: 0.8125rem;
  color: #ef4444;
  margin-top: 0.5rem;
`
