'use client';

import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
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
  EyeOff,
  Building2,
  Palette,
  Lightbulb,
  Headphones,
  ExternalLink,
  Tag,
  Copy,
  Sofa,
  Armchair,
  Bed,
  Tv,
  Refrigerator,
  WashingMachine,
  Wind,
  Package,
  Store,
  Layers,
  Flame,
  Crown
} from 'lucide-react';

function WhatsApp({ size = 20, className, color = 'currentColor', style }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

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
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  arrowUpRight: ArrowUpRight,
  arrowDown: ArrowDown,
  arrowUp: ArrowUp,
  chevron: ChevronDown,
  chevronDown: ChevronDown,
  chevronRight: ChevronRight,
  chevronLeft: ChevronLeft,
  externalLink: ExternalLink,
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
  whatsapp: WhatsApp,
  info: Info,
  download: Download,
  sparkles: Sparkles,
  shield: Shield,
  home: Home,
  sliders: Sliders,
  award: Award,
  eye: Eye,
  eyeOff: EyeOff,
  building: Building2,
  palette: Palette,
  lightbulb: Lightbulb,
  headphones: Headphones,
  tag: Tag,
  copy: Copy,
  sofa: Sofa,
  armchair: Armchair,
  bed: Bed,
  tv: Tv,
  refrigerator: Refrigerator,
  fridge: Refrigerator,
  washer: WashingMachine,
  washingMachine: WashingMachine,
  wind: Wind,
  package: Package,
  packages: Package,
  store: Store,
  layers: Layers,
  flame: Flame,
  crown: Crown
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
