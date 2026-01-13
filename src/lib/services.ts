// Service categories
export type ServiceCategory = 'Media' | 'Productivity' | 'Infrastructure' | 'Disasters / Emergencies';

// Service definition interface
export interface Service {
  name: string;
  description: string;
  icon: string;
  url: string;
  color: string;
  categories: ServiceCategory[];
  groups: string[] | 'all'; // 'all' means available to all authenticated users
  featured: boolean;
}

// All available services
export const ALL_SERVICES: Service[] = [
  {
    name: 'Jellyfin',
    description: 'Movies, TV shows and Karaoke',
    icon: '/icons/jellyfin.svg',
    url: 'https://media.danger.direct',
    color: '#00a4dc',
    categories: ['Media'],
    groups: 'all',
    featured: true
  },
  {
    name: 'Komga',
    description: 'Comic and manga server',
    icon: '/icons/komga.svg',
    url: 'https://books.danger.direct',
    color: '#4caf50',
    categories: ['Media'],
    groups: 'all',
    featured: true
  },
  {
    name: 'PinePods',
    description: 'Podcast server',
    icon: '/icons/pinepods.svg',
    url: 'https://podcasts.danger.direct',
    color: '#4caf50',
    categories: ['Media'],
    groups: 'all',
    featured: true
  },
  {
    name: 'Romm',
    description: 'ROM management and game library',
    icon: '/icons/romm.svg',
    url: 'https://games.danger.direct',
    color: '#9c27b0',
    categories: ['Media'],
    groups: 'all',
    featured: true
  },
  {
    name: 'Immich',
    description: 'Self-hosted photo and video backup',
    icon: '/icons/immich.svg',
    url: 'https://photos.danger.direct',
    color: '#4250af',
    categories: ['Media'],
    groups: ['immich'],
    featured: true
  },
  {
    name: 'PocketID',
    description: 'Identity and access management',
    icon: '/icons/pocket-id.svg',
    url: 'https://id.danger.direct',
    color: '#6366f1',
    categories: ['Infrastructure'],
    groups: 'all',
    featured: true
  },
  {
    name: 'Kiwix',
    description: 'Offline Wikipedia and educational content',
    icon: '/icons/kiwix.svg',
    url: 'https://kiwix.danger.direct',
    color: '#ff9800',
    categories: ['Disasters / Emergencies'],
    groups: ['disaster_prep'],
    featured: false
  },
  {
    name: 'Coolify',
    description: 'Self-hosted deployment platform',
    icon: '/icons/coolify.svg',
    url: 'https://manage.danger.direct',
    color: '#6b21a8',
    categories: ['Infrastructure'],
    groups: ['infrastructure'],
    featured: false
  },
  {
    name: 'Static Assets',
    description: 'Static files and media CDN',
    icon: '/icons/cdn.svg',
    url: 'https://danger.direct/cdn',
    color: '#64748b',
    categories: ['Infrastructure'],
    groups: ['infrastructure'],
    featured: false
  },
  {
    name: 'Pairdrop',
    description: 'Local file sharing and transfer',
    icon: '/icons/pairdrop.svg',
    url: 'https://share.danger.direct',
    color: '#10b981',
    categories: ['Disasters / Emergencies', 'Productivity'],
    groups: ['disaster_prep'],
    featured: false
  },
  {
    name: 'Traccar',
    description: 'GPS tracking and location services',
    icon: '/icons/traccar.svg',
    url: 'https://track.danger.direct',
    color: '#f59e0b',
    categories: ['Disasters / Emergencies'],
    groups: ['disaster_prep'],
    featured: false
  },
  {
    name: 'Seafile',
    description: 'File sync and collaboration platform',
    icon: '/icons/seafile.svg',
    url: 'https://drive.danger.direct',
    color: '#0ea5e9',
    categories: ['Productivity'],
    groups: ['productivity'],
    featured: false
  },
  {
    name: 'Code Server',
    description: 'VS Code in the browser',
    icon: '/icons/code-server.svg',
    url: 'https://code.danger.direct',
    color: '#0078d4',
    categories: ['Productivity'],
    groups: ['productivity'],
    featured: false
  }
];

/**
 * Check if a user has access to a service based on their groups
 */
export function hasAccessToService(service: Service, userGroups: string[]): boolean {
  // If service is available to all, grant access
  if (service.groups === 'all') {
    return true;
  }

  // Check if user has at least one of the required groups
  return service.groups.some(requiredGroup => userGroups.includes(requiredGroup));
}

/**
 * Filter services based on user groups
 */
export function getAccessibleServices(userGroups: string[]): Service[] {
  return ALL_SERVICES.filter(service => hasAccessToService(service, userGroups));
}

/**
 * Get featured services that the user has access to
 */
export function getFeaturedServices(userGroups: string[]): Service[] {
  return getAccessibleServices(userGroups).filter(service => service.featured);
}

/**
 * Get services grouped by category, excluding featured services
 * Only returns categories that have at least one service
 */
export function getServicesByCategory(userGroups: string[]): Map<ServiceCategory, Service[]> {
  const accessibleServices = getAccessibleServices(userGroups);
  const nonFeaturedServices = accessibleServices.filter(service => !service.featured);

  const categorizedServices = new Map<ServiceCategory, Service[]>();

  for (const service of nonFeaturedServices) {
    for (const category of service.categories) {
      if (!categorizedServices.has(category)) {
        categorizedServices.set(category, []);
      }
      categorizedServices.get(category)!.push(service);
    }
  }

  return categorizedServices;
}

