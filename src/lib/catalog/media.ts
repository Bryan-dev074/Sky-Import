import type { CatalogProduct, Product, ProductMedia } from './types'

interface OfficialSource {
  sourcePage: string
  credit: string
  secondary?: string
  objectPosition?: string
}

const OFFICIAL_SOURCE_BY_SLUG: Readonly<Record<string, OfficialSource>> = {
  'geforce-rtx-5090-founders-edition-32gb': {
    sourcePage:
      'https://marketplace.nvidia.com/en-us/consumer/graphics-cards/geforce-rtx-5090-founders-edition/',
    credit: 'NVIDIA',
  },
  'geforce-rtx-5080-16gb': {
    sourcePage:
      'https://marketplace.nvidia.com/en-us/consumer/graphics-cards/geforce-rtx-5080-founders-edition/',
    credit: 'NVIDIA',
  },
  'geforce-rtx-5070-ti-16gb': {
    sourcePage: 'https://www.msi.com/Graphics-Card/GeForce-RTX-5070-Ti-16G-VENTUS-3X-OC/Overview',
    credit: 'MSI',
  },
  'geforce-rtx-5070-12gb': {
    sourcePage: 'https://www.nvidia.com/en-us/geforce/graphics-cards/50-series/rtx-5070-family/',
    credit: 'NVIDIA',
  },
  'radeon-rx-9070-xt-16gb': {
    sourcePage:
      'https://www.asus.com/br/motherboards-components/graphics-cards/tuf-gaming/tuf-rx9070xt-o16g-gaming/',
    credit: 'ASUS',
  },
  'geforce-rtx-4060-8gb': {
    sourcePage: 'https://www.msi.com/Graphics-Card/GeForce-RTX-4060-VENTUS-3X-8G',
    credit: 'MSI',
  },
  'arc-b580-12gb': {
    sourcePage:
      'https://www.intel.com/content/www/us/en/products/sku/241598/intel-arc-b580-graphics/specifications.html',
    credit: 'Intel',
  },
  'ryzen-7-9800x3d': {
    sourcePage:
      'https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-7-9800x3d.html',
    credit: 'AMD',
  },
  'ryzen-7-7800x3d': {
    sourcePage:
      'https://www.amd.com/en/products/processors/desktops/ryzen/7000-series/amd-ryzen-7-7800x3d.html',
    credit: 'AMD',
  },
  'ryzen-5-9600x': {
    sourcePage:
      'https://www.amd.com/en/products/processors/desktops/ryzen/9000-series/amd-ryzen-5-9600x.html',
    credit: 'AMD',
  },
  'core-ultra-7-265k': {
    sourcePage:
      'https://www.intel.com/content/www/us/en/products/sku/241060/intel-core-ultra-7-processor-265k-30m-cache-up-to-5-50-ghz/specifications.html',
    credit: 'Intel',
  },
  'core-i5-14600k': {
    sourcePage:
      'https://www.intel.com/content/www/us/en/products/sku/236799/intel-core-i5-processor-14600k-24m-cache-up-to-5-30-ghz/specifications.html',
    credit: 'Intel',
  },
  'msi-mag-b850-tomahawk-wifi': {
    sourcePage: 'https://www.msi.com/Motherboard/MAG-B850-TOMAHAWK-MAX-WIFI',
    credit: 'MSI',
  },
  'asus-tuf-gaming-b650-plus-wifi': {
    sourcePage:
      'https://www.asus.com/motherboards-components/motherboards/tuf-gaming/tuf-gaming-b650-plus-wifi/',
    credit: 'ASUS',
  },
  'msi-pro-b650m-a-wifi': {
    sourcePage: 'https://www.msi.com/Motherboard/PRO-B650M-A-WIFI',
    credit: 'MSI',
  },
  'asrock-z890-pro-rs': {
    sourcePage: 'https://www.asrock.com/mb/Intel/Z890%20Pro%20RS/index.asp',
    credit: 'ASRock',
  },
  'gigabyte-b760m-ds3h': {
    sourcePage: 'https://www.gigabyte.com/Motherboard/B760M-DS3H-rev-10',
    credit: 'Gigabyte',
  },
  'corsair-vengeance-ddr5-32gb-6000': {
    sourcePage:
      'https://www.corsair.com/us/en/p/memory/cmk32gx5m2b6000c36/vengeance-32gb-2x16gb-ddr5-dram-6000mhz-c36-memory-kit-black-cmk32gx5m2b6000c36',
    credit: 'Corsair',
  },
  'gskill-trident-z5-neo-32gb-6000': {
    sourcePage: 'https://www.gskill.com/product/165/393/1661410171/F5-6000J3038F16GX2-TZ5N',
    credit: 'G.Skill',
  },
  'kingston-fury-beast-ddr5-16gb-5600': {
    sourcePage: 'https://www.kingston.com/en/memory/gaming/kingston-fury-beast-ddr5-memory',
    credit: 'Kingston',
  },
  'corsair-vengeance-lpx-ddr4-16gb-3200': {
    sourcePage:
      'https://www.corsair.com/us/en/p/memory/cmk16gx4m2b3200c16/vengeance-lpx-16gb-2-x-8gb-ddr4-dram-3200mhz-c16-memory-kit-black-cmk16gx4m2b3200c16',
    credit: 'Corsair',
  },
  'samsung-990-pro-2tb': {
    sourcePage: 'https://semiconductor.samsung.com/consumer-storage/internal-ssd/990-pro/',
    credit: 'Samsung',
  },
  'wd-black-sn850x-1tb': {
    sourcePage: 'https://www.westerndigital.com/products/internal-drives/wd-black-sn850x-nvme-ssd',
    credit: 'Western Digital',
  },
  'crucial-p3-plus-1tb': {
    sourcePage: 'https://www.crucial.com/ssd/p3-plus/ct1000p3pssd8',
    credit: 'Crucial',
  },
  'samsung-870-evo-1tb': {
    sourcePage: 'https://semiconductor.samsung.com/consumer-storage/internal-ssd/870evo/',
    credit: 'Samsung',
  },
  'corsair-rm750e': {
    sourcePage:
      'https://www.corsair.com/us/en/p/psu/cp-9020262-na/rme-series-rm750e-fully-modular-low-noise-atx-power-supply-cp-9020262-na',
    credit: 'Corsair',
  },
  'seasonic-focus-gx-850': {
    sourcePage: 'https://seasonic.com/focus-gx/',
    credit: 'Seasonic',
  },
  'corsair-rm1000x': {
    sourcePage:
      'https://www.corsair.com/us/en/p/psu/cp-9020271-na/rmx-series-rm1000x-fully-modular-power-supply-cp-9020271-na',
    credit: 'Corsair',
  },
  'msi-mag-a650bn': {
    sourcePage: 'https://www.msi.com/Power-Supply/MAG-A650BN',
    credit: 'MSI',
  },
  'noctua-nh-d15': {
    sourcePage: 'https://noctua.at/en/nh-d15',
    credit: 'Noctua',
  },
  'thermalright-peerless-assassin-120-se': {
    sourcePage: 'https://www.thermalright.com/product/peerless-assassin-120-se/',
    credit: 'Thermalright',
  },
  'arctic-liquid-freezer-iii-360': {
    sourcePage: 'https://www.arctic.de/us/Liquid-Freezer-III-360/ACFRE00136A',
    credit: 'ARCTIC',
  },
  'lian-li-lancool-216': {
    sourcePage: 'https://lian-li.com/product/lancool-216/',
    credit: 'Lian Li',
  },
  'nzxt-h5-flow': {
    sourcePage: 'https://nzxt.com/product/h5-flow',
    credit: 'NZXT',
  },
  'cooler-master-masterbox-q300l': {
    sourcePage: 'https://www.coolermaster.com/en-global/products/masterbox-q300l/',
    credit: 'Cooler Master',
  },
  'cooler-master-nr200p': {
    sourcePage: 'https://www.coolermaster.com/en-global/products/masterbox-nr200p/',
    credit: 'Cooler Master',
  },
  'thermal-grizzly-kryonaut-1g': {
    sourcePage: 'https://www.thermal-grizzly.com/en/kryonaut/s-tg-k-001-rs',
    credit: 'Thermal Grizzly',
  },
  'arctic-p12-pwm-pst-5-pack': {
    sourcePage: 'https://www.arctic.de/P12-PWM-PST/ACFAN00137A',
    credit: 'ARCTIC',
  },
}

function mediaFor(product: CatalogProduct): ProductMedia {
  const source = OFFICIAL_SOURCE_BY_SLUG[product.slug]
  if (!source) throw new Error(`Falta la fuente oficial de ${product.slug}`)

  return {
    primary: `/products/${product.slug}/primary.webp`,
    secondary: source.secondary,
    alt: {
      es: `Imagen oficial de ${product.model}`,
      pt: `Imagem oficial de ${product.model}`,
    },
    sourcePage: source.sourcePage,
    credit: source.credit,
    objectPosition: source.objectPosition,
  }
}

export function attachProductMedia(products: CatalogProduct[]): Product[] {
  const catalogSlugs = new Set(products.map((product) => product.slug))
  const unusedSources = Object.keys(OFFICIAL_SOURCE_BY_SLUG).filter(
    (slug) => !catalogSlugs.has(slug),
  )
  if (unusedSources.length > 0) {
    throw new Error(`Fuentes sin producto: ${unusedSources.join(', ')}`)
  }

  return products.map((product) => ({ ...product, media: mediaFor(product) }))
}
