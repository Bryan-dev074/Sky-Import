export const DEFAULT_PRODUCT_CUTOUT_POLICY = Object.freeze({ canvas: 1600, occupancy: 0.84 })
export const RTX_5090_PRODUCT_CUTOUT_POLICY = Object.freeze({ canvas: 2048, occupancy: 0.86 })
export const GSKILL_TRIDENT_Z5_NEO_PRODUCT_CUTOUT_POLICY = Object.freeze({
  canvas: 1600,
  occupancy: 0.84,
  allowEnlargement: true,
  maxEnlargementRatio: 1.87,
})

function reviewedEnlargementPolicy(maxEnlargementRatio) {
  return Object.freeze({
    canvas: 1600,
    occupancy: 0.84,
    allowEnlargement: true,
    maxEnlargementRatio,
  })
}

export const PRODUCT_CUTOUT_POLICY = Object.freeze({
  'geforce-rtx-5090-founders-edition-32gb': RTX_5090_PRODUCT_CUTOUT_POLICY,
  'geforce-rtx-5080-16gb': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'geforce-rtx-5070-ti-16gb': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'geforce-rtx-5070-12gb': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'radeon-rx-9070-xt-16gb': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'geforce-rtx-4060-8gb': reviewedEnlargementPolicy(1.7),
  'arc-b580-12gb': reviewedEnlargementPolicy(1.12),
  'ryzen-7-9800x3d': reviewedEnlargementPolicy(1.5),
  'ryzen-7-7800x3d': reviewedEnlargementPolicy(1.571),
  'ryzen-5-9600x': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'core-ultra-7-265k': reviewedEnlargementPolicy(1.34),
  'core-i5-14600k': reviewedEnlargementPolicy(1.36),
  'msi-mag-b850-tomahawk-wifi': reviewedEnlargementPolicy(1.94),
  'asus-tuf-gaming-b650-plus-wifi': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'msi-pro-b650m-a-wifi': reviewedEnlargementPolicy(1.9),
  'asrock-z890-pro-rs': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'gigabyte-b760m-ds3h': reviewedEnlargementPolicy(1.51),
  'corsair-vengeance-ddr5-32gb-6000': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'gskill-trident-z5-neo-32gb-6000': GSKILL_TRIDENT_Z5_NEO_PRODUCT_CUTOUT_POLICY,
  'kingston-fury-beast-ddr5-16gb-5600': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'corsair-vengeance-lpx-ddr4-16gb-3200': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'samsung-990-pro-2tb': reviewedEnlargementPolicy(1.45),
  'wd-black-sn850x-1tb': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'crucial-p3-plus-1tb': reviewedEnlargementPolicy(2.29),
  'samsung-870-evo-1tb': reviewedEnlargementPolicy(1.33),
  'corsair-rm750e': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'seasonic-focus-gx-850': reviewedEnlargementPolicy(1.37),
  'corsair-rm1000x': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'msi-mag-a650bn': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'noctua-nh-d15': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'thermalright-peerless-assassin-120-se': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'arctic-liquid-freezer-iii-360': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'lian-li-lancool-216': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'nzxt-h5-flow': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'cooler-master-masterbox-q300l': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'cooler-master-nr200p': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'thermal-grizzly-kryonaut-1g': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'arctic-p12-pwm-pst-5-pack': DEFAULT_PRODUCT_CUTOUT_POLICY,
})

export function getProductCutoutPolicy(slug) {
  return PRODUCT_CUTOUT_POLICY[slug]
}
