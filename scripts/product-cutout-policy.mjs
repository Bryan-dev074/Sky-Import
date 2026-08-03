export const DEFAULT_PRODUCT_CUTOUT_POLICY = Object.freeze({ canvas: 1600, occupancy: 0.84 })
export const RTX_5090_PRODUCT_CUTOUT_POLICY = Object.freeze({ canvas: 2048, occupancy: 0.86 })

export const PRODUCT_CUTOUT_POLICY = Object.freeze({
  'geforce-rtx-5090-founders-edition-32gb': RTX_5090_PRODUCT_CUTOUT_POLICY,
  'geforce-rtx-5080-16gb': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'geforce-rtx-5070-ti-16gb': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'geforce-rtx-5070-12gb': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'radeon-rx-9070-xt-16gb': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'geforce-rtx-4060-8gb': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'arc-b580-12gb': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'ryzen-7-9800x3d': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'ryzen-7-7800x3d': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'ryzen-5-9600x': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'core-ultra-7-265k': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'core-i5-14600k': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'msi-mag-b850-tomahawk-wifi': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'asus-tuf-gaming-b650-plus-wifi': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'msi-pro-b650m-a-wifi': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'asrock-z890-pro-rs': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'gigabyte-b760m-ds3h': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'corsair-vengeance-ddr5-32gb-6000': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'gskill-trident-z5-neo-32gb-6000': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'kingston-fury-beast-ddr5-16gb-5600': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'corsair-vengeance-lpx-ddr4-16gb-3200': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'samsung-990-pro-2tb': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'wd-black-sn850x-1tb': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'crucial-p3-plus-1tb': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'samsung-870-evo-1tb': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'corsair-rm750e': DEFAULT_PRODUCT_CUTOUT_POLICY,
  'seasonic-focus-gx-850': DEFAULT_PRODUCT_CUTOUT_POLICY,
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
