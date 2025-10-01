/**
 * SEO utilities for Pokemon Team Builder
 * Provides comprehensive SEO optimization and meta tag management
 */

interface MetaTagConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
  locale?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

interface StructuredDataConfig {
  type: 'WebApplication' | 'Game' | 'SoftwareApplication' | 'Article' | 'Organization';
  name: string;
  description?: string;
  url?: string;
  applicationCategory?: string;
  operatingSystem?: string;
  offers?: {
    price: string;
    priceCurrency: string;
    availability: string;
  };
  author?: {
    type: 'Person' | 'Organization';
    name: string;
    url?: string;
  };
  publisher?: {
    type: 'Organization';
    name: string;
    logo?: {
      type: 'ImageObject';
      url: string;
    };
  };
  datePublished?: string;
  dateModified?: string;
  image?: string[];
  screenshot?: string[];
  aggregateRating?: {
    type: 'AggregateRating';
    ratingValue: number;
    ratingCount: number;
  };
}

export class SEOManager {
  private static instance: SEOManager;
  private defaultConfig: MetaTagConfig = {
    siteName: 'Pokemon Team Builder',
    locale: 'en_US',
    type: 'website',
    author: 'Pokemon Team Builder',
  };

  private constructor() {}

  static getInstance(): SEOManager {
    if (!this.instance) {
      this.instance = new SEOManager();
    }
    return this.instance;
  }

  setPageMeta(config: MetaTagConfig): void {
    const mergedConfig = { ...this.defaultConfig, ...config };

    // Update document title
    if (mergedConfig.title) {
      document.title = mergedConfig.siteName
        ? `${mergedConfig.title} | ${mergedConfig.siteName}`
        : mergedConfig.title;
    }

    // Set meta tags
    this.setMetaTag('description', mergedConfig.description);
    this.setMetaTag('keywords', mergedConfig.keywords?.join(', '));
    this.setMetaTag('author', mergedConfig.author);

    // Open Graph tags
    this.setMetaProperty('og:title', mergedConfig.title);
    this.setMetaProperty('og:description', mergedConfig.description);
    this.setMetaProperty('og:image', mergedConfig.image);
    this.setMetaProperty('og:url', mergedConfig.url || window.location.href);
    this.setMetaProperty('og:type', mergedConfig.type);
    this.setMetaProperty('og:site_name', mergedConfig.siteName);
    this.setMetaProperty('og:locale', mergedConfig.locale);

    // Twitter Card tags
    this.setMetaName('twitter:card', 'summary_large_image');
    this.setMetaName('twitter:title', mergedConfig.title);
    this.setMetaName('twitter:description', mergedConfig.description);
    this.setMetaName('twitter:image', mergedConfig.image);

    // Article tags (if applicable)
    if (mergedConfig.publishedTime) {
      this.setMetaProperty('article:published_time', mergedConfig.publishedTime);
    }
    if (mergedConfig.modifiedTime) {
      this.setMetaProperty('article:modified_time', mergedConfig.modifiedTime);
    }

    // Canonical URL
    this.setCanonicalUrl(mergedConfig.url || window.location.href);
  }

  private setMetaTag(name: string, content?: string): void {
    if (!content) return;

    let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = name;
      document.head.appendChild(meta);
    }
    meta.content = content;
  }

  private setMetaProperty(property: string, content?: string): void {
    if (!content) return;

    let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('property', property);
      document.head.appendChild(meta);
    }
    meta.content = content;
  }

  private setMetaName(name: string, content?: string): void {
    if (!content) return;

    let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = name;
      document.head.appendChild(meta);
    }
    meta.content = content;
  }

  private setCanonicalUrl(url: string): void {
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = url;
  }

  addStructuredData(config: StructuredDataConfig): void {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': config.type,
      ...config,
      url: config.url || window.location.href
    };

    // Remove undefined properties
    Object.keys(structuredData).forEach(key => {
      if (structuredData[key as keyof typeof structuredData] === undefined) {
        delete structuredData[key as keyof typeof structuredData];
      }
    });

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
  }

  updateBreadcrumbs(breadcrumbs: Array<{ name: string; url: string }>): void {
    const breadcrumbStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url
      }))
    };

    // Remove existing breadcrumb structured data
    const existingBreadcrumb = document.querySelector('script[type="application/ld+json"]:has-text("BreadcrumbList")');
    if (existingBreadcrumb) {
      existingBreadcrumb.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(breadcrumbStructuredData);
    document.head.appendChild(script);
  }

  preloadCriticalResources(resources: Array<{ href: string; as: string; type?: string }>): void {
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource.href;
      link.as = resource.as;
      if (resource.type) {
        link.type = resource.type;
      }
      document.head.appendChild(link);
    });
  }

  prefetchResources(resources: string[]): void {
    resources.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = href;
      document.head.appendChild(link);
    });
  }

  addRobotsMeta(content: string): void {
    this.setMetaName('robots', content);
  }

  setViewport(content = 'width=device-width, initial-scale=1.0'): void {
    let viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      document.head.appendChild(viewport);
    }
    viewport.content = content;
  }

  addWebAppMeta(): void {
    // PWA meta tags
    this.setMetaName('mobile-web-app-capable', 'yes');
    this.setMetaName('apple-mobile-web-app-capable', 'yes');
    this.setMetaName('apple-mobile-web-app-status-bar-style', 'default');
    this.setMetaName('apple-mobile-web-app-title', 'Pokemon Team Builder');
    this.setMetaName('application-name', 'Pokemon Team Builder');
    this.setMetaName('msapplication-TileColor', '#1976d2');
    this.setMetaName('theme-color', '#1976d2');

    // Manifest link (if not already present)
    if (!document.querySelector('link[rel="manifest"]')) {
      const manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = '/manifest.json';
      document.head.appendChild(manifestLink);
    }
  }
}

// Predefined SEO configurations for different pages
export const SEO_CONFIGS = {
  home: {
    title: 'Pokemon Team Builder - Build Competitive Pokemon Teams',
    description: 'Create and optimize competitive Pokemon teams with our advanced team builder. Features comprehensive Pokemon data, movesets, and team analysis tools.',
    keywords: ['pokemon', 'team builder', 'competitive', 'showdown', 'strategy', 'movesets', 'pokemon teams'],
    type: 'website'
  },
  teamBuilder: {
    title: 'Team Builder - Create Your Pokemon Team',
    description: 'Build your perfect Pokemon team with advanced tools for move selection, stat calculation, and team synergy analysis.',
    keywords: ['pokemon team builder', 'team creation', 'pokemon movesets', 'competitive pokemon', 'team strategy'],
    type: 'webapp'
  },
  pokedex: {
    title: 'Pokemon Database - Complete Pokedex',
    description: 'Browse the complete Pokemon database with detailed information on stats, abilities, moves, and competitive data.',
    keywords: ['pokedex', 'pokemon database', 'pokemon stats', 'pokemon abilities', 'pokemon moves'],
    type: 'webapp'
  },
  teamAnalysis: {
    title: 'Team Analysis - Optimize Your Pokemon Team',
    description: 'Analyze your Pokemon team for weaknesses, resistances, and strategic improvements with our comprehensive team analysis tools.',
    keywords: ['pokemon team analysis', 'team weaknesses', 'pokemon strategy', 'competitive analysis', 'team optimization'],
    type: 'webapp'
  }
};

// Structured data configurations
export const STRUCTURED_DATA_CONFIGS = {
  application: {
    type: 'SoftwareApplication' as const,
    name: 'Pokemon Team Builder',
    description: 'A comprehensive web application for building and optimizing competitive Pokemon teams',
    applicationCategory: 'GameApplication',
    operatingSystem: 'Web Browser',
    offers: {
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock'
    },
    author: {
      type: 'Person' as const,
      name: 'Pokemon Team Builder Developer',
    },
    publisher: {
      type: 'Organization' as const,
      name: 'Pokemon Team Builder',
      logo: {
        type: 'ImageObject' as const,
        url: '/icons/icon-192x192.png'
      }
    },
    aggregateRating: {
      type: 'AggregateRating' as const,
      ratingValue: 4.8,
      ratingCount: 150
    }
  }
};

// URL slug utilities
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

export function createPokemonUrl(pokemonName: string): string {
  const slug = createSlug(pokemonName);
  return `/pokemon/${slug}`;
}

export function createTeamUrl(teamId: string): string {
  return `/team/${teamId}`;
}

// Generate sitemap data
export function generateSitemapData(): Array<{ url: string; lastmod?: string; changefreq?: string; priority?: number }> {
  const baseUrl = window.location.origin;
  const now = new Date().toISOString();

  return [
    {
      url: baseUrl,
      lastmod: now,
      changefreq: 'daily',
      priority: 1.0
    },
    {
      url: `${baseUrl}/team-builder`,
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.9
    },
    {
      url: `${baseUrl}/pokedex`,
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.8
    },
    {
      url: `${baseUrl}/team-analysis`,
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.7
    }
  ];
}

// Performance optimization utilities
export function optimizeImages(): void {
  const images = document.querySelectorAll('img[data-src]');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src!;
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for browsers without IntersectionObserver
    images.forEach(img => {
      const image = img as HTMLImageElement;
      image.src = image.dataset.src!;
    });
  }
}

// Initialize SEO and performance optimizations
export function initializeSEO(): void {
  const seoManager = SEOManager.getInstance();

  // Set default page meta
  seoManager.setPageMeta(SEO_CONFIGS.home);

  // Add structured data for the application
  seoManager.addStructuredData(STRUCTURED_DATA_CONFIGS.application);

  // Add PWA meta tags
  seoManager.addWebAppMeta();

  // Set viewport
  seoManager.setViewport();

  // Add robots meta
  seoManager.addRobotsMeta('index, follow');

  // Preload critical resources
  seoManager.preloadCriticalResources([
    { href: '/fonts/main.woff2', as: 'font', type: 'font/woff2' },
    { href: '/css/critical.css', as: 'style' }
  ]);

  // Optimize images
  optimizeImages();
}

// Export singleton instance
export const seoManager = SEOManager.getInstance();