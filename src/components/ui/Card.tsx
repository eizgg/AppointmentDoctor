import { StyledCard, CardTitle } from './Card.styles'

interface CardProps {
  title?: string
  children: React.ReactNode
}

export default function Card({ title, children }: CardProps) {
  return (
    <StyledCard>
      {title && <CardTitle>{title}</CardTitle>}
      {children}
    </StyledCard>
  )
}
