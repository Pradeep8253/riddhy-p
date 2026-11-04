'use client';

import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setLocale } from '@/store/uiSlice';
import Icon from '@/components/ui/Icon';
import styles from './GoogleTranslate.module.css';

// React + Google Translate reconciliation patch to prevent NotFoundError: removeChild
if (typeof window !== 'undefined' && typeof Node === 'function' && Node.prototype) {
  const origRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child && child.parentNode !== this) {
      if (child.parentNode && child.parentNode.parentNode === this) {
        try {
          return origRemoveChild.call(this, child.parentNode);
        } catch (e) {
          return child;
        }
      }
      return child;
    }
    return origRemoveChild.apply(this, arguments);
  };

  const origInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (referenceNode.parentNode && referenceNode.parentNode.parentNode === this) {
        try {
          return origInsertBefore.call(this, newNode, referenceNode.parentNode);
        } catch (e) {
          return newNode;
        }
      }
      return newNode;
    }
    return origInsertBefore.apply(this, arguments);
  };
}

export const SUPPORTED_LANGUAGES = [
  {
    code: 'en',
    name: 'English',
    native: 'English',
    short: 'EN',
    glyph: 'A',
  },
  {
    code: 'hi',
    name: 'Hindi',
    native: 'हिन्दी',
    short: 'हिं',
    glyph: 'अ',
  },
];

function getStoredLang() {
  if (typeof document === 'undefined') return 'en';
  try {
    const local = window.localStorage.getItem('rf-locale');
    if (local === 'hi' || local === 'en') return local;
    const match = document.cookie.match(/(?:^|;\s*)googtrans=\/(?:en|auto)\/([a-zA-Z\-]+)/);
    if (match && match[1]) {
      const c = match[1].toLowerCase();
      if (c === 'hi' || c === 'en') return c;
    }
  } catch { }
  return 'en';
}

function setGoogleTranslateCookie(code) {
  if (typeof document === 'undefined') return;
  const val = `/en/${code}`;
  const host = window.location.hostname;

  // 1. Host-only cookie (Works 100% on localhost, 127.0.0.1, Vercel, and live domains)
  document.cookie = `googtrans=${val}; path=/; max-age=31536000; SameSite=Lax`;

  // 2. Cross-domain cookie if not localhost or raw IP
  if (host !== 'localhost' && !/^(\d{1,3}\.){3}\d{1,3}$/.test(host)) {
    document.cookie = `googtrans=${val}; path=/; domain=.${host}; max-age=31536000; SameSite=Lax`;
    const parts = host.split('.');
    if (parts.length > 2) {
      const root = '.' + parts.slice(-2).join('.');
      document.cookie = `googtrans=${val}; path=/; domain=${root}; max-age=31536000; SameSite=Lax`;
    }
  }
}

function clearGoogleTranslateCookie() {
  if (typeof document === 'undefined') return;
  const host = window.location.hostname;
  const expire = 'expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

  document.cookie = `googtrans=; ${expire}`;
  if (host !== 'localhost' && !/^(\d{1,3}\.){3}\d{1,3}$/.test(host)) {
    document.cookie = `googtrans=; ${expire} domain=.${host};`;
    const parts = host.split('.');
    if (parts.length > 2) {
      const root = '.' + parts.slice(-2).join('.');
      document.cookie = `googtrans=; ${expire} domain=${root};`;
    }
  }
}

export default function GoogleTranslate({ variant = 'compact' }) {
  const dispatch = useDispatch();
  const reduxLocale = useSelector((state) => state.ui?.locale);
  const [currentLang, setCurrentLang] = useState('en');
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Mark mounted on client and read stored language
  useEffect(() => {
    setMounted(true);
    const initial = getStoredLang();
    setCurrentLang(initial);
  }, []);

  // Suppress and hide Google's floating icons, banners, and body top displacement
  useEffect(() => {
    const cleanGoogleUI = () => {
      if (typeof document === 'undefined') return;
      if (document.body && document.body.style.top && document.body.style.top !== '0px') {
        document.body.style.top = '0px';
      }
      const elementsToHide = document.querySelectorAll(
        'iframe.goog-te-banner-frame, iframe.skiptranslate, [class*="VIpgJd"], [class*="goog-te-banner"], [class*="goog-te-gadget-icon"], [class*="goog-te-spinner"], #goog-gt-tt, .goog-te-balloon-frame, .goog-tooltip, body > div.skiptranslate'
      );
      elementsToHide.forEach((el) => {
        if (el.id === 'google_translate_element') return;
        el.style.setProperty('display', 'none', 'important');
        el.style.setProperty('visibility', 'hidden', 'important');
        el.style.setProperty('opacity', '0', 'important');
        el.style.setProperty('pointer-events', 'none', 'important');
        el.style.setProperty('position', 'absolute', 'important');
        el.style.setProperty('left', '-9999px', 'important');
        el.style.setProperty('top', '-9999px', 'important');
        el.style.setProperty('width', '0px', 'important');
        el.style.setProperty('height', '0px', 'important');
      });
    };

    cleanGoogleUI();
    const observer = new MutationObserver(cleanGoogleUI);
    if (document.body) {
      observer.observe(document.body, { attributes: true, childList: true, subtree: true });
    }
    const interval = setInterval(cleanGoogleUI, 200);
    const timeout = setTimeout(() => clearInterval(interval), 15000);

    return () => {
      observer.disconnect();
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Load Google Translate script and initialize on mount
  useEffect(() => {
    const initial = getStoredLang();
    setCurrentLang(initial);

    // 1. Define global Google callback
    window.googleTranslateElementInit = function () {
      try {
        if (window.google?.translate?.TranslateElement) {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: 'en',
              includedLanguages: 'en,hi',
              autoDisplay: false,
              multilanguagePage: true,
            },
            'google_translate_element'
          );
        }
      } catch (e) { }
    };

    // 2. Inject Google Translate script dynamically if not present
    const SCRIPT_ID = 'google-translate-script';
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    } else if (window.google?.translate?.TranslateElement) {
      window.googleTranslateElementInit();
    }

    // 3. Sync combo if initial language is not English
    const syncCombo = () => {
      const combo = document.querySelector('.goog-te-combo');
      if (combo && combo.options && combo.options.length > 0) {
        if (initial !== 'en' && combo.value !== initial) {
          combo.value = initial;
          combo.dispatchEvent(new Event('change', { bubbles: true }));
        }
      }
    };

    const t1 = setTimeout(syncCombo, 800);
    const t2 = setTimeout(syncCombo, 1800);
    const t3 = setTimeout(syncCombo, 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // Sync state if redux locale changes
  useEffect(() => {
    const desired = reduxLocale || getStoredLang();
    if (desired && desired !== currentLang) {
      setCurrentLang(desired);
    }
  }, [reduxLocale, currentLang]);

  // Handle outside click & Escape key
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const selectLanguage = (code) => {
    setIsOpen(false);
    if (code === currentLang) return;

    setCurrentLang(code);
    dispatch(setLocale(code));
    try {
      window.localStorage.setItem('rf-locale', code);
      document.cookie = `rf-locale=${code}; path=/; max-age=31536000; SameSite=Lax`;
    } catch { }

    if (code === 'en') {
      clearGoogleTranslateCookie();
      const combo = document.querySelector('.goog-te-combo');
      if (combo) {
        combo.value = '';
        combo.dispatchEvent(new Event('change', { bubbles: true }));
      }
      setTimeout(() => {
        window.location.reload();
      }, 150);
      return;
    }

    setGoogleTranslateCookie(code);

    const tryTranslate = (attempt = 0) => {
      const combo = document.querySelector('.goog-te-combo');
      if (combo) {
        combo.value = code;
        combo.dispatchEvent(new Event('change', { bubbles: true }));
      } else if (attempt < 15) {
        setTimeout(() => tryTranslate(attempt + 1), 200);
      }
    };

    tryTranslate();
  };

  const effectiveLang = mounted ? currentLang : 'en';
  const activeLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === effectiveLang) || SUPPORTED_LANGUAGES[0];

  // Drawer variant (for mobile navigation drawer)
  if (variant === 'drawer') {
    return (
      <div className={`${styles.drawerContainer} notranslate`} translate="no">
        <div className={styles.drawerTitle}>
          <div className={styles.drawerTitleLeft}>
            <Icon name="globe" size={15} />
            <span>Language / भाषा चुनें</span>
          </div>
          <span className={styles.drawerCurrentBadge} suppressHydrationWarning>
            <span className={styles.fullLabel}>{activeLangObj.native}</span>
            <span className={styles.shortLabel}>{activeLangObj.short}</span>
          </span>
        </div>

        <div className={styles.drawerGrid}>
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isActive = lang.code === effectiveLang;
            return (
              <button
                key={lang.code}
                type="button"
                className={`${styles.drawerCard} ${isActive ? styles.drawerCardActive : ''}`}
                onClick={() => selectLanguage(lang.code)}
                aria-pressed={isActive}
              >
                <div className={styles.drawerGlyphCircle}>
                  <span>{lang.glyph}</span>
                </div>
                <div className={styles.drawerCardText}>
                  <span className={styles.drawerCardNative}>{lang.native}</span>
                </div>
                <div className={styles.drawerCheckWrap}>
                  {isActive ? (
                    <div className={styles.drawerCheckActive}>
                      <Icon name="check" size={12} />
                    </div>
                  ) : (
                    <div className={styles.drawerCheckEmpty} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Compact variant (for Header & Admin topbars)
  return (
    <div className={`${styles.container} notranslate`} ref={containerRef} translate="no">
      <button
        type="button"
        className={`${styles.triggerBtn} ${isOpen ? styles.triggerBtnActive : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Select language, current: ${activeLangObj.name}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        suppressHydrationWarning
      >
        <span className={styles.triggerGlyphPill} aria-hidden="true">
          <span className={styles.glyphText} suppressHydrationWarning>
            {activeLangObj.glyph}
          </span>
        </span>
        <span className={styles.currentLabel} suppressHydrationWarning>
          <span className={styles.fullLabel}>{activeLangObj.native}</span>
          <span className={styles.shortLabel}>{activeLangObj.short}</span>
        </span>
        <Icon
          name="chevron"
          size={10}
          className={`${styles.chevronIcon} ${isOpen ? styles.chevronOpen : ''}`}
        />
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu} role="menu" aria-label="Languages">
          {/* Header with RF Heritage styling */}
          <div className={styles.menuHeader}>
            <span className={styles.menuHeaderTag}>SELECT LANGUAGE</span>
            <span className={styles.menuHeaderHindi}>भाषा चुनें</span>
          </div>

          <div className={styles.menuList}>
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isActive = lang.code === currentLang;
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="menuitem"
                  className={`${styles.langOption} ${isActive ? styles.langOptionActive : ''}`}
                  onClick={() => selectLanguage(lang.code)}
                >
                  <div className={styles.optionLeft}>
                    <div className={`${styles.glyphBadge} ${isActive ? styles.glyphBadgeActive : ''}`}>
                      <span>{lang.glyph}</span>
                    </div>
                    <span className={styles.langNameNative}>{lang.native}</span>
                  </div>

                  <div className={styles.optionRight}>
                    {isActive ? (
                      <div className={styles.activeCheckBadge} title="Currently active">
                        <Icon name="check" size={12} />
                      </div>
                    ) : (
                      <div className={styles.inactiveRing} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer Branding Bar */}
          <div className={styles.menuFooter}>
            <span className={styles.footerShield}>
              <Icon name="shield" size={10} />
            </span>
            <span>RF Riddhy • Experience</span>
          </div>
        </div>
      )}
    </div>
  );
}
