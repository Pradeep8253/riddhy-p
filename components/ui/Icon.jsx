'use client';

import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ArrowRight,
  ChevronDown,
  Plus,
  Minus,
  ArrowLeftRight,
  MapPin,
  Truck,
  Check,
  Star,
  Clock,
  Gift,
  Mail,
  Phone,
  Calendar,
  Video,
  MessageCircle,
  Info,
  Download,
  Sparkles,
  Shield,
  Home,
  Sliders,
  Award,
  Eye,
  EyeOff
} from 'lucide-react';

function Instagram({ size = 20, strokeWidth = 1.7, className, color, style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color || 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

const iconMap = {
  search: Search,
  bag: ShoppingBag,
  cart: ShoppingBag,
  heart: Heart,
  user: User,
  menu: Menu,
  close: X,
  x: X,
  arrow: ArrowRight,
  chevron: ChevronDown,
  plus: Plus,
  minus: Minus,
  compare: ArrowLeftRight,
  pin: MapPin,
  mapPin: MapPin,
  truck: Truck,
  check: Check,
  star: Star,
  clock: Clock,
  gift: Gift,
  instagram: Instagram,
  mail: Mail,
  phone: Phone,
  calendar: Calendar,
  video: Video,
  whatsapp: MessageCircle,
  info: Info,
  download: Download,
  sparkles: Sparkles,
  shield: Shield,
  home: Home,
  sliders: Sliders,
  award: Award,
  eye: Eye,
  eyeOff: EyeOff
};

export default function Icon({
  name,
  size = 20,
  strokeWidth = 1.7,
  label,
  className = '',
  color,
  style = {}
}) {
  const IconComponent = iconMap[name] || Check;

  return (
    <IconComponent
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      color={color}
      style={style}
      aria-label={label}
      aria-hidden={label ? undefined : 'true'}
    />
  );
}
