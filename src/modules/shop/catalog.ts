export enum ProductType {
  PRIVILEGE = 'privilege',
  CASE = 'case',
  TOKEN = 'token',
  SERVICE = 'service',
}

export interface Product {
  id: string;
  type: ProductType;
  // Shop section the product is listed under ('grief', 'vanilla', 'other').
  server: string;
  // Bridge target for the delivery commands; falls back to `server` when omitted.
  // Lets the 'other' section (which is not a real server) deliver on grief.
  deliveryServer?: string;
  name: string;
  image: string;
  description: string;
  variants: ProductVariant[];
  // Slider-priced products carry a `range` instead of fixed `variants`.
  range?: ProductRange;
}

export interface ProductVariant {
  id: string;
  label: string;
  price: number;
  commands: string[];
}

export interface ProductRange {
  min: number;
  max: number;
  step: number;
  // Price of a single unit in RUB.
  pricePerUnit: number;
  unitLabel: string;
  // Supports {player} and {amount} placeholders.
  commands: string[];
}

export const catalog: Product[] = [
  {
    id: 'prime',
    type: ProductType.PRIVILEGE,
    server: 'grief',
    name: 'PRIME',
    image: '/images/shop/prime.png',
    description: '/hat, /ec, /craft, /kits',
    variants: [
      {
        id: 'prime-1m',
        label: '1 мес',
        price: 19,
        commands: [`lp user {player} parent addtemp prime 30d grief`],
      },
      {
        id: 'prime-3m',
        label: '3 мес',
        price: 49,
        commands: [`lp user {player} parent addtemp prime 90d grief`],
      },
      {
        id: 'prime-12m',
        label: '12 мес',
        price: 149,
        commands: [`lp user {player} parent addtemp prime 365d grief`],
      },
    ],
  },
  {
    id: 'aracis',
    type: ProductType.PRIVILEGE,
    server: 'grief',
    name: 'ARACIS',
    image: '/images/shop/aracis.png',
    description: '/feed, /iteminfo, /loom, /kits',
    variants: [
      {
        id: 'aracis-1m',
        label: '1 мес',
        price: 29,
        commands: [`lp user {player} parent addtemp aracis 30d grief`],
      },
      {
        id: 'aracis-3m',
        label: '3 мес',
        price: 79,
        commands: [`lp user {player} parent addtemp aracis 90d grief`],
      },
      {
        id: 'aracis-12m',
        label: '12 мес',
        price: 249,
        commands: [`lp user {player} parent addtemp aracis 365d grief`],
      },
    ],
  },
  {
    id: 'oasis',
    type: ProductType.PRIVILEGE,
    server: 'grief',
    name: 'OASIS',
    image: '/images/shop/oasis.png',
    description: '/ext, /ignore, /clear, /cartographytable, /kits',
    variants: [
      {
        id: 'oasis-1m',
        label: '1 мес',
        price: 49,
        commands: [`lp user {player} parent addtemp oasis 30d grief`],
      },
      {
        id: 'oasis-3m',
        label: '3 мес',
        price: 129,
        commands: [`lp user {player} parent addtemp oasis 90d grief`],
      },
      {
        id: 'oasis-12m',
        label: '12 мес',
        price: 399,
        commands: [`lp user {player} parent addtemp oasis 365d grief`],
      },
    ],
  },
  {
    id: 'aladin',
    type: ProductType.PRIVILEGE,
    server: 'grief',
    name: 'ALADIN',
    image: '/images/shop/aladin.png',
    description: '/heal, /ptime, /repair, /kits',
    variants: [
      {
        id: 'aladin-1m',
        label: '1 мес',
        price: 69,
        commands: [`lp user {player} parent addtemp aladin 30d grief`],
      },
      {
        id: 'aladin-3m',
        label: '3 мес',
        price: 179,
        commands: [`lp user {player} parent addtemp aladin 90d grief`],
      },
      {
        id: 'aladin-12m',
        label: '12 мес',
        price: 549,
        commands: [`lp user {player} parent addtemp aladin 365d grief`],
      },
    ],
  },
  {
    id: 'lotus',
    type: ProductType.PRIVILEGE,
    server: 'grief',
    name: 'LOTUS',
    image: '/images/shop/lotus.png',
    description: '/repairall, /head, /stonecutter, /kits',
    variants: [
      {
        id: 'lotus-1m',
        label: '1 мес',
        price: 99,
        commands: [`lp user {player} parent addtemp lotus 30d grief`],
      },
      {
        id: 'lotus-3m',
        label: '3 мес',
        price: 249,
        commands: [`lp user {player} parent addtemp lotus 90d grief`],
      },
      {
        id: 'lotus-12m',
        label: '12 мес',
        price: 749,
        commands: [`lp user {player} parent addtemp lotus 365d grief`],
      },
    ],
  },
  {
    id: 'dune',
    type: ProductType.PRIVILEGE,
    server: 'grief',
    name: 'DUNE',
    image: '/images/shop/dune.png',
    description: '/invsee, /book, /trash, /near, /kits',
    variants: [
      {
        id: 'dune-1m',
        label: '1 мес',
        price: 149,
        commands: [`lp user {player} parent addtemp dune 30d grief`],
      },
      {
        id: 'dune-3m',
        label: '3 мес',
        price: 379,
        commands: [`lp user {player} parent addtemp dune 90d grief`],
      },
      {
        id: 'dune-12m',
        label: '12 мес',
        price: 1149,
        commands: [`lp user {player} parent addtemp dune 365d grief`],
      },
    ],
  },
  {
    id: 'dejavu',
    type: ProductType.PRIVILEGE,
    server: 'grief',
    name: 'DEJAVU',
    image: '/images/shop/dejavu.png',
    description: '/ec (ник), /msgtoggle, /near, /grindstone, /kits',
    variants: [
      {
        id: 'dejavu-1m',
        label: '1 мес',
        price: 249,
        commands: [`lp user {player} parent addtemp dejavu 30d grief`],
      },
      {
        id: 'dejavu-3m',
        label: '3 мес',
        price: 629,
        commands: [`lp user {player} parent addtemp dejavu 90d grief`],
      },
      {
        id: 'dejavu-12m',
        label: '12 мес',
        price: 1899,
        commands: [`lp user {player} parent addtemp dejavu 365d grief`],
      },
    ],
  },
  {
    id: 'mirage',
    type: ProductType.PRIVILEGE,
    server: 'grief',
    name: 'MIRAGE',
    image: '/images/shop/mirage.png',
    description: '/nick, /realname, /near, /smithingtable, /thor, /kits',
    variants: [
      {
        id: 'mirage-1m',
        label: '1 мес',
        price: 499,
        commands: [`lp user {player} parent addtemp mirage 30d grief`],
      },
      {
        id: 'mirage-3m',
        label: '3 мес',
        price: 1249,
        commands: [`lp user {player} parent addtemp mirage 90d grief`],
      },
      {
        id: 'mirage-12m',
        label: '12 мес',
        price: 3749,
        commands: [`lp user {player} parent addtemp mirage 365d grief`],
      },
    ],
  },
  {
    id: 'case-title',
    type: ProductType.CASE,
    server: 'grief',
    name: 'Кейс с титулами',
    image: '/images/shop/case-title.png',
    description: 'Уникальные титулы для вашего персонажа',
    variants: [
      {
        id: 'case-title-1',
        label: '1 кейс',
        price: 29,
        commands: [`cubelets give {player} title 1`],
      },
      {
        id: 'case-title-3',
        label: '3 кейса',
        price: 69,
        commands: [`cubelets give {player} title 3`],
      },
      {
        id: 'case-title-5',
        label: '5 кейсов',
        price: 99,
        commands: [`cubelets give {player} title 5`],
      },
    ],
  },
  {
    id: 'case-donate',
    type: ProductType.CASE,
    server: 'grief',
    name: 'Кейс с донатом',
    image: '/images/shop/case-donate.png',
    description: 'Шанс получить дорогую привилегию',
    variants: [
      {
        id: 'case-donate-1',
        label: '1 кейс',
        price: 59,
        commands: [`cubelets give {player} donate 1`],
      },
      {
        id: 'case-donate-3',
        label: '3 кейса',
        price: 149,
        commands: [`cubelets give {player} donate 3`],
      },
      {
        id: 'case-donate-5',
        label: '5 кейсов',
        price: 259,
        commands: [`cubelets give {player} donate 5`],
      },
    ],
  },
  {
    id: 'case-token',
    type: ProductType.CASE,
    server: 'grief',
    name: 'Кейс с жетонами',
    image: '/images/shop/case-token.png',
    description: 'Жетоны для внутриигровых покупок',
    variants: [
      {
        id: 'case-token-1',
        label: '1 кейс',
        price: 39,
        commands: [`cubelets give {player} rub 1`],
      },
      {
        id: 'case-token-3',
        label: '3 кейса',
        price: 99,
        commands: [`cubelets give {player} rub 3`],
      },
      {
        id: 'case-token-5',
        label: '5 кейсов',
        price: 139,
        commands: [`cubelets give {player} rub 5`],
      },
    ],
  },
  {
    id: 'grief-tokens',
    type: ProductType.TOKEN,
    server: 'grief',
    name: 'Жетоны',
    image: '/images/shop/tokens.svg',
    description: 'Внутриигровая валюта грифа — 0,10 ₽ за жетон',
    variants: [],
    range: {
      // 500 жетонов = 50 ₽ — нижняя граница, которую принимает Lava.
      min: 500,
      max: 50000,
      step: 100,
      pricePerUnit: 0.1,
      unitLabel: 'жетонов',
      commands: [`points give {player} {amount}`],
    },
  },
  {
    id: 'vanilla-sponsor',
    type: ProductType.PRIVILEGE,
    server: 'vanilla',
    name: 'СПОНСОР',
    image: '/images/shop/vanilla-sponsor.png',
    description: '/scale, /ptime, /pweather, /hat, /sv, /bc, 12 чанков, 10 приватов, косметика',
    variants: [
      {
        id: 'vanilla-sponsor-1m',
        label: '1 мес',
        price: 199,
        commands: [`lp user {player} parent addtemp sponsor 30d vanilla`],
      },
      {
        id: 'vanilla-sponsor-3m',
        label: '3 мес',
        price: 549,
        commands: [`lp user {player} parent addtemp sponsor 90d vanilla`],
      },
      {
        id: 'vanilla-sponsor-6m',
        label: '6 мес',
        price: 999,
        commands: [`lp user {player} parent addtemp sponsor 180d vanilla`],
      },
    ],
  },
  {
    id: 'unban',
    type: ProductType.SERVICE,
    server: 'other',
    deliveryServer: 'grief',
    name: 'Разбан',
    image: '/images/shop/unban.svg',
    description: 'Снятие блокировки аккаунта на сервере',
    variants: [
      {
        id: 'unban-1',
        label: 'Разбан',
        price: 150,
        commands: [`unban {player}`],
      },
    ],
  },
  {
    id: 'unmute',
    type: ProductType.SERVICE,
    server: 'other',
    deliveryServer: 'grief',
    name: 'Размут',
    image: '/images/shop/unmute.svg',
    description: 'Снятие блокировки чата',
    variants: [
      {
        id: 'unmute-1',
        label: 'Размут',
        price: 50,
        commands: [`unmute {player}`],
      },
    ],
  },
  {
    id: 'host-payment',
    type: ProductType.SERVICE,
    server: 'other',
    name: 'Оплата хоста',
    image: '/images/shop/host.svg',
    description: 'Поддержка проекта — оплата хостинга серверов',
    variants: [
      {
        id: 'host-payment-1',
        label: 'Оплата хоста',
        price: 10000,
        commands: [],
      },
    ],
  },
  {
    id: 'chips',
    type: ProductType.SERVICE,
    server: 'other',
    name: 'На чипсы',
    image: '/images/shop/chips.svg',
    description: 'Добровольная поддержка команды проекта',
    variants: [],
    range: {
      min: 50,
      max: 5000,
      step: 50,
      pricePerUnit: 1,
      unitLabel: '₽',
      commands: [],
    },
  },
];

// Slider-priced products have no pre-built variants, so their variantId carries
// the picked amount: `<productId>:<amount>` (e.g. `grief-tokens:500`).
const RANGE_SEPARATOR = ':';

export function findVariant(variantId: string): { product: Product; variant: ProductVariant } | null {
  const separatorIndex = variantId.indexOf(RANGE_SEPARATOR);

  if (separatorIndex !== -1) {
    const productId = variantId.slice(0, separatorIndex);
    const amount = Number(variantId.slice(separatorIndex + 1));
    const product = catalog.find((p) => p.id === productId && p.range);

    if (!product) return null;

    const variant = buildRangeVariant(product, amount);
    return variant ? { product, variant } : null;
  }

  for (const product of catalog) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant) return { product, variant };
  }

  return null;
}

// Materialises a variant for the requested amount, rejecting anything the
// slider could not have produced (out of bounds or off-step).
function buildRangeVariant(product: Product, amount: number): ProductVariant | null {
  const range = product.range;
  if (!range) return null;

  if (!Number.isInteger(amount) || amount < range.min || amount > range.max) return null;
  if ((amount - range.min) % range.step !== 0) return null;

  return {
    id: `${product.id}${RANGE_SEPARATOR}${amount}`,
    label: `${amount} ${range.unitLabel}`,
    price: Math.round(amount * range.pricePerUnit * 100) / 100,
    commands: range.commands.map((command) => command.replace(/{amount}/g, String(amount))),
  };
}
