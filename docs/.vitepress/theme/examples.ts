export interface IHeroBio {
  path: string
  name: string
}

export interface IExample {
  id: string
  title: string
  caption: string
  path: string
}

export const EExamples: readonly IExample[] = [
  {
    id: 'northvale',
    title: 'Northvale Structural Engineering',
    caption: 'Engineering firm with 20 people',
    path: '/examples/northvale/',
  },
  {
    id: 'ferraresi',
    title: 'The Ferraresi family',
    caption: 'Family of five',
    path: '/examples/ferraresi/',
  },
  {
    id: 'ottobre',
    title: 'Ottobre Coffee Roasters',
    caption: 'Two-person roastery',
    path: '/examples/ottobre/',
  },
  {
    id: 'pietra',
    title: 'Studio Pietra',
    caption: 'Architecture studio of six',
    path: '/examples/pietra/',
  },
]

export const EHeroExample = { path: '/examples/ferraresi/giulia', name: 'Giulia Ferraresi' } as const

export const EHeroPool: readonly IHeroBio[] = [
  { path: '/examples/northvale/amara-okafor', name: 'Amara Okafor' },
  { path: '/examples/northvale/arjun-mehta', name: 'Arjun Mehta' },
  { path: '/examples/northvale/claire-dubois', name: 'Claire Dubois' },
  { path: '/examples/northvale/david-mensah', name: 'David Mensah' },
  { path: '/examples/northvale/elena-varga', name: 'Elena Varga' },
  { path: '/examples/northvale/hannah-cole', name: 'Hannah Cole' },
  { path: '/examples/northvale/ingrid-solberg', name: 'Ingrid Solberg' },
  { path: '/examples/northvale/jonas-weber', name: 'Jonas Weber' },
  { path: '/examples/northvale/kenji-mori', name: 'Kenji Mori' },
  { path: '/examples/northvale/luca-ferri', name: 'Luca Ferri' },
  { path: '/examples/northvale/lucia-ortega', name: 'Lucía Ortega' },
  { path: '/examples/northvale/marco-bellini', name: 'Marco Bellini' },
  { path: '/examples/northvale/mei-chen', name: 'Mei Chen' },
  { path: '/examples/northvale/nadia-petrova', name: 'Nadia Petrova' },
  { path: '/examples/northvale/omar-haddad', name: 'Omar Haddad' },
  { path: '/examples/northvale/pieter-de-vries', name: 'Pieter de Vries' },
  { path: '/examples/northvale/priya-raman', name: 'Priya Raman' },
  { path: '/examples/northvale/samuel-osei', name: 'Samuel Osei' },
  { path: '/examples/northvale/sofia-almeida', name: 'Sofia Almeida' },
  { path: '/examples/northvale/tomas-lindgren', name: 'Tomas Lindgren' },
  { path: '/examples/ferraresi/bea', name: 'Bea Ferraresi' },
  { path: '/examples/ferraresi/davide', name: 'Davide Ferraresi' },
  { path: '/examples/ferraresi/giulia', name: 'Giulia Ferraresi' },
  { path: '/examples/ferraresi/sofia', name: 'Sofia Ferraresi' },
  { path: '/examples/ferraresi/tommaso', name: 'Tommaso Ferraresi' },
  { path: '/examples/ottobre/chiara-rinaldi', name: 'Chiara Rinaldi' },
  { path: '/examples/ottobre/youssef-amrani', name: 'Youssef Amrani' },
  { path: '/examples/pietra/anja-novak', name: 'Anja Novak' },
  { path: '/examples/pietra/hugo-alves', name: 'Hugo Alves' },
  { path: '/examples/pietra/ines-carvalho', name: 'Inês Carvalho' },
  { path: '/examples/pietra/lea-moreau', name: 'Léa Moreau' },
  { path: '/examples/pietra/rui-tavares', name: 'Rui Tavares' },
  { path: '/examples/pietra/tiago-santos', name: 'Tiago Santos' },
]

export const EHeroAccents: readonly string[] = [
  '#3A5BFF',
  '#B04E15',
  '#A84A33',
  '#0F7B6C',
  '#7B44E8',
  '#B3261E',
  '#1F6FB2',
  '#8A5A00',
]

export const EHeroCardRadii: readonly number[] = [0, 8, 16, 28]

export const EHeroAvatarRadii: readonly string[] = ['0px', '24px', '9999px']
