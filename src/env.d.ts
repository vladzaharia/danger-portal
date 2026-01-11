/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import type { SessionData } from './lib/auth';

declare namespace App {
  interface Locals {
    session?: SessionData;
  }
}

