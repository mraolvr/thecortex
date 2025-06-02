import {
  Home,
  Brain,
  Briefcase,
  Image,
  BookOpen,
  PenTool,
  Lock,
  Settings,
  HelpCircle,
  Calendar,
  Users,
  Search,
  Lightbulb,
} from 'lucide-react';

export const routes = [
  {
    name: 'Dashboard',
    path: '/',
    icon: Home,
  },
  {
    name: 'Communication Center',
    path: '/guidance',
    icon: Brain,
  },
  {
    name: 'Calendar',
    path: '/calendar',
    icon: Calendar,
  },
  {
    name: 'Work Hub',
    path: '/work',
    icon: Briefcase,
  },
  {
    name: 'Creative Hub',
    path: '/creative',
    icon: PenTool,
  },
  {
    name: 'Curiosity Corner',
    path: '/curiosity',
    icon: Lightbulb,
  },
  {
    name: 'Library',
    path: '/books',
    icon: BookOpen,
  },
  {
    name: 'Vault',
    path: '/vault',
    icon: Lock,
  },
  {
    name: 'Contacts',
    path: '/contacts',
    icon: Users,
  },
  {
    name: 'Introspection',
    path: '/introspection',
    icon: Brain,
  },
];

export const bottomRoutes = [
  {
    name: 'Settings',
    path: '/settings',
    icon: Settings,
  },
]; 