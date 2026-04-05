export enum ProductType {
  PRIVILEGE = 'privilege',
  CASE = 'case',
}

export interface Product {
  id: string;
  type: ProductType;
  server: string;
  name: string;
  image: string;
  description: string;
  variants: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  label: string;
  price: number;
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
        commands: [`crate give {player} title 1`],
      },
      {
        id: 'case-title-3',
        label: '3 кейса',
        price: 69,
        commands: [`crate give {player} title 3`],
      },
      {
        id: 'case-title-5',
        label: '5 кейсов',
        price: 99,
        commands: [`crate give {player} title 5`],
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
        commands: [`crate give {player} donate 1`],
      },
      {
        id: 'case-donate-3',
        label: '3 кейса',
        price: 149,
        commands: [`crate give {player} donate 3`],
      },
      {
        id: 'case-donate-5',
        label: '5 кейсов',
        price: 259,
        commands: [`crate give {player} donate 5`],
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
        commands: [`crate give {player} token 1`],
      },
      {
        id: 'case-token-3',
        label: '3 кейса',
        price: 99,
        commands: [`crate give {player} token 3`],
      },
      {
        id: 'case-token-5',
        label: '5 кейсов',
        price: 139,
        commands: [`crate give {player} token 5`],
      },
    ],
  },
];

export function findVariant(variantId: string): { product: Product; variant: ProductVariant } | null {
  for (const product of catalog) {
    const variant = product.variants.find((v) => v.id === variantId);
    if (variant) return { product, variant };
  }
  return null;
}
