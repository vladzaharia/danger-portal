import type { APIRoute } from 'astro';
import { readdir, stat, readFile } from 'fs/promises';
import { join, extname, basename } from 'path';
import { lookup } from 'mime-types';

export const prerender = false;

// Configure the CDN root directory
const CDN_ROOT = process.env.CDN_ROOT || join(process.cwd(), 'cdn');

export const GET: APIRoute = async ({ params }) => {
  try {
    // Get the requested path
    const requestedPath = params.path || '';
    const fullPath = join(CDN_ROOT, requestedPath);

    // Security check: ensure the path is within CDN_ROOT
    if (!fullPath.startsWith(CDN_ROOT)) {
      return new Response(JSON.stringify({ error: 'Access denied' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if path exists
    const stats = await stat(fullPath);

    // If it's a directory, list contents
    if (stats.isDirectory()) {
      const entries = await readdir(fullPath, { withFileTypes: true });
      
      const items = await Promise.all(
        entries.map(async (entry) => {
          const itemPath = join(fullPath, entry.name);
          const itemStats = await stat(itemPath);
          
          return {
            name: entry.name,
            type: entry.isDirectory() ? 'directory' : 'file',
            size: entry.isFile() ? itemStats.size : null,
            modified: itemStats.mtime.toISOString(),
            path: join(requestedPath, entry.name).replace(/\\/g, '/'),
          };
        })
      );

      // Sort: directories first, then files, alphabetically
      items.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

      return new Response(JSON.stringify({ items }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // If it's a file, serve it
    if (stats.isFile()) {
      const fileContent = await readFile(fullPath);
      const mimeType = lookup(fullPath) || 'application/octet-stream';

      return new Response(fileContent as any, {
        status: 200,
        headers: {
          'Content-Type': mimeType,
          'Content-Length': stats.size.toString(),
          'Content-Disposition': `inline; filename="${basename(fullPath)}"`,
        },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('CDN error:', error);
    
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return new Response(JSON.stringify({ error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

