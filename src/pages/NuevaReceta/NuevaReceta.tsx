import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScanSearch, AlertCircle, CheckCircle2 } from 'lucide-react'
import { PageTitle, PageDescription } from '../Page.styles'
import {
  Wrapper,
  AnalyzeButton,
  ProgressOverlay,
  Spinner,
  ProgressText,
  ErrorBox,
} from './NuevaReceta.styles'
import FileUpload from '../../components/FileUpload'
import { uploadReceta } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'

export default function NuevaReceta() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleAnalyze = async () => {
    if (!file) return

    setUploading(true)
    setError(null)
    setSuccess(false)

    try {
      setProgress('Subiendo PDF...')
      // Small delay so user sees the first step
      await new Promise((r) => setTimeout(r, 500))

      setProgress('Analizando orden médica con IA...')
      const receta = await uploadReceta(file, user!.id)

      setProgress('¡Listo!')
      setSuccess(true)

      // Redirect to detail after a brief pause
      setTimeout(() => {
        navigate(`/receta/${receta.id}`)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setUploading(false)
    }
  }

  if (uploading || success) {
    return (
      <Wrapper>
        <div>
          <PageTitle>Nueva Orden Médica</PageTitle>
          <PageDescription>Procesando tu orden médica...</PageDescription>
        </div>

        <ProgressOverlay>
          {!success && <Spinner />}
          {success && <CheckCircle2 size={40} color="#16a34a" />}
          <ProgressText>{progress}</ProgressText>
        </ProgressOverlay>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <div>
        <PageTitle>Nueva Orden Médica</PageTitle>
        <PageDescription>
          Subí tu orden médica en PDF y la vamos a analizar para pedirte los turnos.
        </PageDescription>
      </div>

      <FileUpload file={file} onFileChange={setFile} />

      {error && (
        <ErrorBox>
          <AlertCircle size={18} />
          {error}
        </ErrorBox>
      )}

      <AnalyzeButton disabled={!file} onClick={handleAnalyze}>
        <ScanSearch size={20} />
        Analizar Orden
      </AnalyzeButton>
    </Wrapper>
  )
}
