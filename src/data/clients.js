import { projects } from './projects'

const clientSortOptions = [
  { id: 'name-asc', label: 'Nazwa klienta (A-Z)' },
  { id: 'active-projects-desc', label: 'Najwięcej aktywnych projektów' },
  { id: 'last-activity-desc', label: 'Ostatnia aktywność' },
]

const businessKeywords = [
  'development',
  'group',
  'invest',
  'estate',
  'homes',
  'living',
  'residence',
  'office',
  'business',
  'retail',
  'stay',
]

function inferClientType(clientName) {
  const normalizedName = clientName.toLocaleLowerCase('pl-PL')

  if (normalizedName.startsWith('rodzina ')) {
    return 'Klient indywidualny'
  }

  if (businessKeywords.some((keyword) => normalizedName.includes(keyword))) {
    return 'Firma'
  }

  const words = clientName.trim().split(/\s+/)
  const looksLikePersonName =
    words.length === 2 &&
    words.every((word) => /^[A-ZĄĆĘŁŃÓŚŹŻ]/.test(word))

  return looksLikePersonName ? 'Klient indywidualny' : 'Firma'
}

function resolveClientStatus(clientProjects) {
  const activeProjects = clientProjects.filter((project) => project.statusType !== 'completed')

  if (activeProjects.length === 0) {
    return { type: 'completed', label: 'Zakończony' }
  }

  if (activeProjects.some((project) => project.statusType === 'danger')) {
    return { type: 'danger', label: 'Opóźnienie' }
  }

  if (activeProjects.some((project) => project.statusType === 'warning')) {
    return { type: 'warning', label: 'Wymaga uwagi' }
  }

  return { type: 'active', label: 'Aktywny' }
}

function buildClients(sourceProjects) {
  const groupedClients = new Map()

  sourceProjects.forEach((project) => {
    if (!groupedClients.has(project.clientId)) {
      groupedClients.set(project.clientId, {
        id: project.clientId,
        name: project.client,
        projects: [],
      })
    }

    groupedClients.get(project.clientId).projects.push(project)
  })

  return Array.from(groupedClients.values())
    .map((client) => {
      const activeProjects = client.projects.filter((project) => project.statusType !== 'completed')
      const projectsWithKnownValue = client.projects.filter((project) => typeof project.value === 'number')
      const latestProject = client.projects.reduce((latest, project) => {
        if (!latest) {
          return project
        }

        return new Date(project.updatedAt) > new Date(latest.updatedAt) ? project : latest
      }, null)
      const status = resolveClientStatus(client.projects)

      return {
        ...client,
        type: inferClientType(client.name),
        activeProjectsCount: activeProjects.length,
        totalProjectsCount: client.projects.length,
        projectsValue:
          projectsWithKnownValue.length > 0
            ? projectsWithKnownValue.reduce((sum, project) => sum + project.value, 0)
            : null,
        lastActivityAt: latestProject ? latestProject.updatedAt : null,
        lastActivityProjectName: latestProject ? latestProject.name : '',
        statusType: status.type,
        statusLabel: status.label,
      }
    })
    .sort((clientA, clientB) => clientA.name.localeCompare(clientB.name, 'pl'))
}

const clients = buildClients(projects)

const clientStatusFilterOptions = [
  { id: 'all', label: 'Wszystkie statusy' },
  { id: 'active', label: 'Aktywni' },
  { id: 'warning', label: 'Wymaga uwagi' },
  { id: 'danger', label: 'Opóźnione' },
  { id: 'completed', label: 'Zakończone' },
]

const clientTypeFilterOptions = [
  { id: 'all', label: 'Wszystkie typy' },
  ...Array.from(new Set(clients.map((client) => client.type)))
    .sort((typeA, typeB) => typeA.localeCompare(typeB, 'pl'))
    .map((type) => ({ id: type, label: type })),
]

export {
  clientSortOptions,
  clients,
  clientStatusFilterOptions,
  clientTypeFilterOptions,
}
