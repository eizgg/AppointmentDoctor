import { useState, useRef, type DragEvent, type ChangeEvent } from 'react'
import { UploadCloud, FileText, X } from 'lucide-react'
import { errors as errorStrings, ariaLabels, dropZone } from './FileUpload.strings'
import {
  DropZone,
  HiddenInput,
  IconWrapper,
  DropText,
  DropHighlight,
  DropHint,
  FilePreview,
  FileIcon,
  FileInfo,
  FileName,
  FileSize,
  RemoveButton,
  ErrorMessage,
} from './FileUpload.styles'

interface FileUploadProps {
  accept?: string
  maxSizeMB?: number
  file: File | null
  onFileChange: (file: File | null) => void
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function FileUpload({
  accept = '.pdf',
  maxSizeMB = 10,
  file,
  onFileChange,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const maxSizeBytes = maxSizeMB * 1024 * 1024

  function validate(f: File): boolean {
    if (accept === '.pdf' && f.type !== 'application/pdf') {
      setError(errorStrings.soloPdf)
      return false
    }
    if (f.size > maxSizeBytes) {
      setError(errorStrings.limiteTamano(maxSizeMB))
      return false
    }
    setError(null)
    return true
  }

  function handleFile(f: File) {
    if (validate(f)) {
      onFileChange(f)
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleRemove() {
    onFileChange(null)
    setError(null)
  }

  if (file) {
    return (
      <FilePreview>
        <FileIcon>
          <FileText size={20} />
        </FileIcon>
        <FileInfo>
          <FileName>{file.name}</FileName>
          <FileSize>{formatFileSize(file.size)}</FileSize>
        </FileInfo>
        <RemoveButton onClick={handleRemove} aria-label={ariaLabels.quitarArchivo}>
          <X size={18} />
        </RemoveButton>
      </FilePreview>
    )
  }

  return (
    <>
      <DropZone
        $isDragging={isDragging}
        $hasFile={false}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <IconWrapper $active={isDragging}>
          <UploadCloud size={24} />
        </IconWrapper>

        <DropText>
          {dropZone.arrastra}
          <DropHighlight>{dropZone.buscar}</DropHighlight>
        </DropText>

        <DropHint>{dropZone.hint(maxSizeMB)}</DropHint>

        <HiddenInput
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
        />
      </DropZone>

      {error && <ErrorMessage>{error}</ErrorMessage>}
    </>
  )
}
