import { projects, teamDirectory } from './projects'

const teamFilterOptions = [
  { id: 'all', label: 'Wszyscy członkowie' },
  { id: 'optimal', label: 'Optymalne obciążenie' },
  { id: 'high', label: 'Wysokie obciążenie' },
  { id: 'overloaded', label: 'Przeciążenie' },
  { id: 'low', label: 'Niskie obciążenie' },
]

const teamSortOptions = [
  { id: 'workload-desc', label: 'Obciążenie malejąco' },
  { id: 'workload-asc', label: 'Obciążenie rosnąco' },
  { id: 'projects-desc', label: 'Liczba aktywnych projektów' },
  { id: 'name-asc', label: 'Imię i nazwisko (A-Z)' },
]

const workloadStatusConfig = {
  low: { id: 'low', label: 'Niskie' },
  optimal: { id: 'optimal', label: 'Optymalnie' },
  high: { id: 'high', label: 'Wysokie' },
  overloaded: { id: 'overloaded', label: 'Przeciążenie' },
}

const teamAttentionStatuses = ['high', 'overloaded']

const roleLoadLimits = {
  Architekt: {
    optimalMaxProjects: 2,
    highMinProjects: 3,
    overloadMinProjects: 4,
  },
  'Starszy architekt': {
    optimalMaxProjects: 3,
    highMinProjects: 4,
    overloadMinProjects: 6,
  },
}

function getRoleLimits(role) {
  return roleLoadLimits[role] || roleLoadLimits.Architekt
}

function resolveWorkloadStatus(role, activeProjectsCount) {
  const limits = getRoleLimits(role)

  if (activeProjectsCount === 0) {
    return workloadStatusConfig.low
  }

  if (activeProjectsCount >= limits.overloadMinProjects) {
    return workloadStatusConfig.overloaded
  }

  if (activeProjectsCount >= limits.highMinProjects) {
    return workloadStatusConfig.high
  }

  if (activeProjectsCount === limits.optimalMaxProjects) {
    return workloadStatusConfig.optimal
  }

  return workloadStatusConfig.low
}

function calculateWorkloadPercent(role, activeProjectsCount) {
  if (activeProjectsCount === 0) {
    return 0
  }

  const limits = getRoleLimits(role)
  return Math.round((activeProjectsCount / limits.optimalMaxProjects) * 100)
}

function isActiveProject(project) {
  return project.statusType !== 'completed'
}

function buildTeamMembers(sourceProjects) {
  return teamDirectory.map((member) => {
    const activeProjects = sourceProjects.filter(
      (project) => isActiveProject(project) && project.ownerId === member.id,
    )
    const activeProjectsCount = activeProjects.length
    const workloadStatus = resolveWorkloadStatus(member.role, activeProjectsCount)
    const workloadPercent = calculateWorkloadPercent(member.role, activeProjectsCount)
    const roleLimits = getRoleLimits(member.role)

    return {
      ...member,
      activeProjectsCount,
      activeProjectNames: activeProjects.map((project) => project.name),
      optimalProjectLimit: roleLimits.optimalMaxProjects,
      workloadPercent,
      workloadStatus,
    }
  })
}

const teamMembers = buildTeamMembers(projects)

export { buildTeamMembers, teamAttentionStatuses, teamFilterOptions, teamMembers, teamSortOptions }
