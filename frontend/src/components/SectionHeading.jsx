import AtoHeader from './AtoHeader'
import { useEvent } from '../contexts/useEvent'
import { isTeatro, sectionHeader } from '../sections'

// Cabeçalho de seção sensível ao template do evento:
// teatro mantém os Atos originais; os demais usam o título
// configurável da seção (event.settings.sections[id]).
export default function SectionHeading({ id, atoNumber, atoTitle, atoSubtitle }) {
  const { event } = useEvent()

  if (isTeatro(event)) {
    return (
      <AtoHeader number={atoNumber} title={atoTitle} subtitle={atoSubtitle} />
    )
  }

  const header = sectionHeader(event, id)
  return <AtoHeader simple title={header.title} subtitle={header.subtitle} />
}
