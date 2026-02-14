import { StyledBadge } from './Badge.styles'
import { statusLabels } from './Badge.strings'

type BadgeStatus = 'pendiente' | 'enviado' | 'confirmado'

interface BadgeProps {
  status: BadgeStatus
}

export default function Badge({ status }: BadgeProps) {
  return <StyledBadge $status={status}>{statusLabels[status]}</StyledBadge>
}
