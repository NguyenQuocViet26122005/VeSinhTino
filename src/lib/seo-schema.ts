import { contact, services, type PriceRow } from '../data/site';

export const SITE_URL = 'https://vesinhtino.com';
export const SITE_NAME = 'Vệ Sinh Tino';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/3b21a7ec444d0b39.webp`;
export const LOGO_URL = `${SITE_URL}/images/09ac88fe21b3b5da.webp`;

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildCanonicalUrl(pathname: string): string {
  let cleanPath = pathname.split('?')[0].split('#')[0];
  if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
  if (!cleanPath.endsWith('/')) cleanPath = cleanPath + '/';
  return `${SITE_URL}${cleanPath}`;
}

export function getWebsiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    url: `${SITE_URL}/`,
    name: SITE_NAME,
    description: 'Dịch vụ vệ sinh nhà ở, căn hộ chung cư và vệ sinh công nghiệp tại TP.HCM.',
    inLanguage: 'vi-VN',
    publisher: {
      '@id': `${SITE_URL}/#organization`
    }
  };
}

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: `${SITE_URL}/`,
    logo: LOGO_URL,
    image: DEFAULT_OG_IMAGE,
    telephone: contact.phone,
    email: contact.email,
    sameAs: [contact.zalo],
    address: contact.addresses.map((addr) => ({
      '@type': 'PostalAddress',
      streetAddress: addr,
      addressLocality: 'Hồ Chí Minh',
      addressCountry: 'VN'
    }))
  };
}

export function parsePriceSpecification(priceStr: string, unitText: string): Record<string, any> {
  const clean = priceStr.trim();

  // If text is "Liên hệ", do not invent price 0
  if (/^liên\s*hệ$/i.test(clean)) {
    return {
      '@type': 'UnitPriceSpecification',
      priceCurrency: 'VND',
      unitText,
      description: 'Liên hệ trao đổi hiện trạng và báo giá'
    };
  }

  // Handle "Từ X" (e.g. "Từ 1.600.000")
  if (/^từ\s+/i.test(clean)) {
    const rawNum = clean.replace(/^từ\s+/i, '').replace(/\./g, '').trim();
    const minVal = parseInt(rawNum, 10);
    if (!isNaN(minVal)) {
      return {
        '@type': 'UnitPriceSpecification',
        minPrice: minVal,
        priceCurrency: 'VND',
        unitText,
        description: `Mức giá từ ${minVal.toLocaleString('vi-VN')} VND`
      };
    }
  }

  // Handle range "X–Y" or "X-Y" (e.g. "12.000–20.000", "1.950.000–2.550.000")
  const rangeMatch = clean.match(/^([0-9.]+)\s*[–—-]\s*([0-9.]+)$/);
  if (rangeMatch) {
    const minVal = parseInt(rangeMatch[1].replace(/\./g, ''), 10);
    const maxVal = parseInt(rangeMatch[2].replace(/\./g, ''), 10);
    if (!isNaN(minVal) && !isNaN(maxVal)) {
      return {
        '@type': 'UnitPriceSpecification',
        minPrice: minVal,
        maxPrice: maxVal,
        priceCurrency: 'VND',
        unitText
      };
    }
  }

  // Handle single number (e.g. "1600000")
  const singleVal = parseInt(clean.replace(/\./g, ''), 10);
  if (!isNaN(singleVal)) {
    return {
      '@type': 'UnitPriceSpecification',
      price: singleVal,
      priceCurrency: 'VND',
      unitText
    };
  }

  return {
    '@type': 'UnitPriceSpecification',
    priceCurrency: 'VND',
    unitText,
    description: priceStr
  };
}

export function getBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http')
        ? item.url
        : `${SITE_URL}${item.url.startsWith('/') ? item.url : '/' + item.url}`
    }))
  };
}

export function getServiceSchema(
  name: string,
  description: string,
  url: string,
  prices?: PriceRow[]
) {
  const schema: Record<string, any> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#service`,
    name,
    description,
    provider: {
      '@id': `${SITE_URL}/#organization`
    },
    areaServed: {
      '@type': 'AdministrativeArea',
      name: 'Thành phố Hồ Chí Minh'
    }
  };

  if (prices && prices.length > 0) {
    schema.hasOfferCatalog = {
      '@type': 'OfferCatalog',
      name: `Bảng giá tham khảo ${name}`,
      itemListElement: prices.map((p) => ({
        '@type': 'Offer',
        name: p.name,
        priceSpecification: parsePriceSpecification(p.price, p.unit)
      }))
    };
  }

  return schema;
}

export function getArticleSchema(
  title: string,
  lead: string,
  url: string,
  photoId: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${url}#article`,
    headline: title,
    description: lead,
    image: `${SITE_URL}/images/${photoId}.webp`,
    inLanguage: 'vi-VN',
    publisher: {
      '@id': `${SITE_URL}/#organization`
    },
    author: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: `${SITE_URL}/`
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    }
  };
}

// One LocalBusiness per verified branch address. Uses only facts already published on the site
// (no ratings, coordinates or opening days are invented).
export function getLocalBusinessSchemas() {
  return contact.addresses.map((addr, index) => {
    const parts = addr.split(',').map((part) => part.trim()).filter(Boolean);
    const withoutCity = parts.filter((part) => !/^TP\.?\s*HCM$/i.test(part));
    const locality = withoutCity[withoutCity.length - 1];
    return {
      '@context': 'https://schema.org',
      '@type': 'HousekeepingService',
      '@id': `${SITE_URL}/#location-${index + 1}`,
      name: `${SITE_NAME} – ${locality}`,
      url: `${SITE_URL}/`,
      image: DEFAULT_OG_IMAGE,
      logo: LOGO_URL,
      telephone: contact.phone,
      email: contact.email,
      parentOrganization: { '@id': `${SITE_URL}/#organization` },
      address: {
        '@type': 'PostalAddress',
        streetAddress: withoutCity.slice(0, -1).join(', '),
        addressLocality: locality,
        addressRegion: 'Thành phố Hồ Chí Minh',
        addressCountry: 'VN'
      },
      areaServed: { '@type': 'City', name: 'Thành phố Hồ Chí Minh' },
      knowsAbout: services.map((service) => service.name)
    };
  });
}

export function getFaqSchema(items: [string, string][], url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${url}#faq`,
    mainEntity: items.map(([question, answer]) => ({
      '@type': 'Question',
      name: question,
      acceptedAnswer: { '@type': 'Answer', text: answer }
    }))
  };
}
