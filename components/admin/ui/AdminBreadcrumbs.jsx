'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import styles from './AdminBreadcrumbs.module.css';

const ROUTE_LABELS = {
  admin: 'Admin',
  orders: 'Orders',
  invoices: 'Invoices',
  catalogue: 'Products',
  merchandising: 'Collections',
  packages: 'Wedding Packages',
  inventory: 'Inventory',
  leads: 'Enquiries',
  warranty: 'Warranty Claims',
  cms: 'Banners & Offers',
  settings: 'Settings'
};

export default function AdminBreadcrumbs({ extraSegments = [] }) {
  const pathname = usePathname() || '/admin';
  const parts = pathname.split('/').filter(Boolean);

  const crumbs = [];
  let pathAccumulator = '';

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    pathAccumulator += `/${part}`;
    crumbs.push({
      label: ROUTE_LABELS[part] || part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, ' '),
      href: pathAccumulator,
      isLast: i === parts.length - 1 && extraSegments.length === 0
    });
  }

  extraSegments.forEach((seg, idx) => {
    crumbs.push({
      label: seg.label,
      href: seg.href || null,
      isLast: idx === extraSegments.length - 1
    });
  });

  if (crumbs.length <= 1) return null;

  return (
    <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
      <ol className={styles.list}>
        {crumbs.map((crumb, idx) => (
          <li key={idx} className={styles.item}>
            {idx > 0 && <span className={styles.separator}>/</span>}
            {crumb.isLast || !crumb.href ? (
              <span className={styles.current} aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <Link href={crumb.href} className={styles.link}>
                {idx === 0 && <Icon name="home" size={12} className={styles.homeIcon} />}
                <span>{crumb.label}</span>
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
