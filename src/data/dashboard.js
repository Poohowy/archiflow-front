const kpis = [
    {
      value: '12',
      label: 'Aktywnych projektów',
      type: 'blue',
      icon: 'projects',
    },
    {
      value: '2',
      label: 'Wymaga uwagi',
      type: 'orange',
      icon: 'attention',
    },
    {
      value: '1',
      label: 'Opóźniony',
      type: 'red',
      icon: 'delay',
    },
    {
      value: '8',
      label: 'Osób w zespole',
      type: 'green',
      icon: 'team',
    },
  ]
  
const attentionProjects = [
    {
    name: 'Villa Kraków',
    issue: 'Oczekuje na akceptację klienta',
    date: '19.08.2026',
    type: 'warning',
    },
    {
    name: 'House Gdańsk',
    issue: '8 dni opóźnienia',
    date: '22.08.2026',
    type: 'danger',
    },
    {
    name: 'Office Warsaw',
    issue: 'Wykorzystano 2/3 rund korekt',
    date: '25.08.2026',
    type: 'warning',
    },
]

const upcomingDeadlines = [
    {
        date: '28',
        month: 'SIE',
        title: 'Projekt budowlany',
        project: 'Villa Kraków',
    },
    {
        date: '02',
        month: 'WRZ',
        title: 'Projekt koncepcyjny',
        project: 'Apartamenty Wrocław',
    },
    {
        date: '05',
        month: 'WRZ',
        title: 'Nadzór autorski',
        project: 'Dom Warszawa',
    },
]

const teamLoad = [
    { label: 'Optymalne', value: 4, percentage: 50, type: 'optimal' },
    { label: 'Wysokie', value: 3, percentage: 37, type: 'high' },
    { label: 'Przeciążone', value: 1, percentage: 13, type: 'overloaded' },
    ]
      
const recentProjects = [
{
    name: 'Villa Kraków',
    client: 'ABC Development',
    stage: 'Projekt budowlany',
    progress: 72,
    deadline: '18.09.2026',
    status: 'W realizacji',
    statusType: 'active',
},
{
    name: 'House Gdańsk',
    client: 'Baltic Homes',
    stage: 'Projekt wykonawczy',
    progress: 64,
    deadline: '22.08.2026',
    status: 'Opóźniony',
    statusType: 'danger',
},
{
    name: 'Office Warsaw',
    client: 'Urban Group',
    stage: 'Koncepcja',
    progress: 48,
    deadline: '25.09.2026',
    status: 'Wymaga uwagi',
    statusType: 'warning',
},
{
    name: 'Dom Warszawa',
    client: 'Anna Kowalska',
    stage: 'Nadzór autorski',
    progress: 86,
    deadline: '05.09.2026',
    status: 'W realizacji',
    statusType: 'active',
},
{
    name: 'Apartamenty Wrocław',
    client: 'Wrocław Development',
    stage: 'Projekt koncepcyjny',
    progress: 35,
    deadline: '14.10.2026',
    status: 'W realizacji',
    statusType: 'active',
},
]

export {
  kpis,
  attentionProjects,
  upcomingDeadlines,
  teamLoad,
  recentProjects,
}