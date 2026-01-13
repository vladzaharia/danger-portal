# Danger.Direct

A modern, secure web portal for accessing personal media services with PocketID authentication. Built with Astro, WebAwesome, and OpenID Connect.

## Features

- 🔐 **Secure Authentication**: PocketID integration with PKCE flow
- 👥 **Group-Based Access Control**: OIDC groups for fine-grained service access
- 🎨 **Modern UI**: Animated gradient backgrounds with glassmorphism effects
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- 🚀 **Fast Performance**: Built with Astro for optimal loading speeds
- 🎯 **Service Hub**: Centralized access to all your media services
- 📂 **Categorized Services**: Organized by Media, Productivity, Infrastructure, and Disasters / Emergencies
- 🌟 **Featured Services**: Priority display for frequently used applications
- 📁 **Static CDN**: Serve static files from mounted volumes
- 🐳 **Docker Ready**: Easy deployment with Docker Compose

## Services Included

### Featured Services (Available to All Users)
- **Jellyfin**: Movies, TV shows and Karaoke
- **Komga**: Comic and manga server
- **Romm**: ROM management and game library
- **PocketID**: Identity and access management

### Media Services
- **Immich**: Self-hosted photo and video backup (requires `immich` group)

### Productivity Services
- **Seafile**: File sync and collaboration platform (requires `productivity` group)
- **Code Server**: VS Code in the browser (requires `productivity` group)
- **Pairdrop**: Local file sharing and transfer (requires `disaster_prep` group)

### Infrastructure Services
- **Coolify**: Self-hosted deployment platform (requires `infrastructure` group)
- **Static Assets**: Static files and media CDN (requires `infrastructure` group)

### Disaster Preparedness Services
- **Kiwix**: Offline Wikipedia and educational content (requires `disaster_prep` group)
- **Traccar**: GPS tracking and location services (requires `disaster_prep` group)
- **Pairdrop**: Local file sharing and transfer (requires `disaster_prep` group)

## Prerequisites

- Node.js 20 or higher
- Docker and Docker Compose (for deployment)
- PocketID account at `https://id.danger.direct`

## Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd danger-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set your values:
   ```env
   POCKETID_ISSUER=https://id.danger.direct
   CLIENT_ID=danger-portal
   CLIENT_SECRET=your_client_secret_here
   REDIRECT_URI=http://localhost:3000/api/auth/callback
   SESSION_SECRET=your_session_secret_here_minimum_32_characters_long
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to `http://localhost:3000`

## Production Deployment

### Using Docker Compose

1. **Create environment file**
   ```bash
   cp .env.example .env
   ```

   Update with production values:
   ```env
   POCKETID_ISSUER=https://id.danger.direct
   CLIENT_ID=danger-portal
   CLIENT_SECRET=your_production_secret
   REDIRECT_URI=https://danger.direct/api/auth/callback
   SESSION_SECRET=your_production_session_secret
   CDN_PATH=/path/to/your/cdn/files
   ```

2. **Create Docker network** (if not exists)
   ```bash
   docker network create danger-network
   ```

3. **Build and start**
   ```bash
   docker-compose up -d
   ```

4. **View logs**
   ```bash
   docker-compose logs -f
   ```

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start the server**
   ```bash
   node ./dist/server/entry.mjs
   ```

## Configuration

### PocketID Setup

1. Register your application at `https://id.danger.direct`
2. Set the redirect URI to `https://your-domain.com/api/auth/callback`
3. Copy the Client ID and Client Secret to your `.env` file
4. **Enable Groups Scope**: Ensure your PocketID client is configured to:
   - Include the `groups` scope in OIDC requests
   - Return groups in the ID token as an array claim named `groups`

### Group-Based Access Control

The portal uses OIDC groups to control access to services. Users must be assigned to appropriate groups in PocketID:

- **`immich`**: Access to Immich photo backup service
- **`disaster_prep`**: Access to disaster preparedness tools (Kiwix, Traccar, Pairdrop)
- **`productivity`**: Access to productivity applications (Seafile, Code Server, Pairdrop)
- **`infrastructure`**: Access to infrastructure management tools (Static Assets)

**Note**: Users can be in multiple groups and will see all services they have access to. Services marked as "available to all" are accessible to any authenticated user regardless of group membership.

### Static CDN Files

Place static files in the `public/cdn/` directory or mount a volume to `/app/dist/client/cdn` in Docker.

Files will be accessible at `https://your-domain.com/cdn/`

### Service Configuration

Services are defined in `src/lib/services.ts`. Update the service URLs, groups, and categories to match your infrastructure:

```typescript
export const ALL_SERVICES: Service[] = [
  {
    name: 'Jellyfin',
    description: 'Movies, TV shows and Karaoke',
    icon: '/icons/jellyfin.svg',
    url: 'https://media.danger.direct', // Update this URL
    color: '#00a4dc',
    categories: ['Media'],
    groups: 'all', // 'all' or array of group names
    featured: true
  },
  // ... more services
];
```

Each service can be configured with:
- **categories**: One or more categories (Media, Productivity, Infrastructure, Disasters / Emergencies)
- **groups**: Either `'all'` for public access or an array of required group names
- **featured**: Whether to display in the featured section at the top

### Kiosk Display

The `/kiosk` page is designed for small displays (optimized for 800x400px) to show WiFi connection instructions. Perfect for devices like the NanoPi M6.

Configure the kiosk display via environment variables:

```env
KIOSK_WIFI_SSID=Danger.Direct
KIOSK_WIFI_PASSWORD=your_wifi_password_here
KIOSK_PORTAL_URL=https://danger.direct
```

Features:
- **Landscape Layout**: Optimized for 800x400px displays
- **WiFi Instructions**: Shows SSID and password prominently
- **QR Code**: Automatically generated QR code for easy portal access
- **Matching Design**: Uses the same glassmorphism and gradient style as the main portal
- **No Scrolling**: All content fits within the viewport

Access the kiosk page at: `https://your-domain.com/kiosk`

To display on a NanoPi M6 or similar device, configure your browser to:
1. Open in fullscreen/kiosk mode
2. Set the window size to 800x400
3. Disable screen timeout/sleep
4. Auto-start on boot

## Architecture

- **Framework**: Astro 5.16.8 (Hybrid SSR/SSG)
- **UI Components**: WebAwesome 3.1.0
- **Authentication**: openid-client 6.8.1
- **Runtime**: Node.js adapter
- **Deployment**: Docker with multi-stage builds

## Security Features

- HTTP-only cookies for session management
- PKCE flow for OAuth 2.0
- Secure session storage
- HTTPS enforcement in production
- SameSite cookie protection
- XSS prevention

## Development

### Project Structure

```
danger-portal/
├── public/
│   └── cdn/              # Static CDN files
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── pages/
│   │   ├── index.astro   # Landing page
│   │   ├── services.astro # Services dashboard
│   │   └── api/
│   │       └── auth/     # Auth endpoints
│   ├── lib/
│   │   └── auth.ts       # OIDC utilities
│   └── middleware.ts     # Auth middleware
├── Dockerfile
├── docker-compose.yml
└── astro.config.mjs
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run astro` - Run Astro CLI commands

## Troubleshooting

### Authentication Issues

- Verify PocketID issuer URL is correct
- Check Client ID and Secret match PocketID configuration
- Ensure redirect URI is whitelisted in PocketID
- Check browser console for errors

### Docker Issues

- Ensure Docker network exists: `docker network create danger-network`
- Check volume permissions for CDN directory
- Verify environment variables are set correctly
- Check logs: `docker-compose logs -f`

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
