import type { Href } from 'expo-router';

export type RouteAction = {
  label: string;
  href: Href;
  dismissTo?: boolean;
};
