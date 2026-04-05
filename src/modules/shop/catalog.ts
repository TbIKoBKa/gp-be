export enum ProductType {
  PRIVILEGE = 'privilege',
  CASE = 'case',
}

export interface Product {
  id: string;
  type: ProductType;
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

const GRIEF_SERVER = 'grief';

export const catalog: Product[] = [
  {
    id: 'prime',
    type: ProductType.PRIVILEGE,
    name: 'PRIME',
    image: '/images/shop/prime.png',
    description: '/hat, /ec, /craft, /kits',
    variants: [
      {
        id: 'prime-1m',
        label: '1 мес',
        price: 19,
        commands: [`lp user {player} parent addtemp prime 30d ${GRIEF_SERVER}`],
      },
      {
        id: 'prime-3m',
        label: '3 мес',
        price: 49,
        commands: [`lp user {player} parent addtemp prime 90d ${GRIEF_SERVER}`],
      },
      {
        id: 'prime-12m',
        label: '12 мес',
        price: 149,
        commands: [`lp user {player} parent addtemp prime 365d ${GRIEF_SERVER}`],
      },
    ],
  },
  {
    id: 'aracis',
    type: ProductType.PRIVILEGE,
    name: 'ARACIS',
    image: '/images/shop/aracis.png',
    description: '/feed, /iteminfo, /loom, /kits',
    variants: [
      {
        id: 'aracis-1m',
        label: '1 мес',
        price: 29,
        commands: [`lp user {player} parent addtemp aracis 30d ${GRIEF_SERVER}`],
      },
      {
        id: 'aracis-3m',
        label: '3 мес',
        price: 79,
        commands: [`lp user {player} parent addtemp aracis 90d ${GRIEF_SERVER}`],
      },
      {
        id: 'aracis-12m',
        label: '12 мес',
        price: 249,
        commands: [`lp user {player} parent addtemp aracis 365d ${GRIEF_SERVER}`],
      },
    ],
  },
  {
    id: 'oasis',
    type: ProductType.PRIVILEGE,
    name: 'OASIS',
    image: '/images/shop/oasis.png',
    description: '/ext, /ignore, /clear, /cartographytable, /kits',
    variants: [
      {
        id: 'oasis-1m',
        label: '1 мес',
        price: 49,
        commands: [`lp user {player} parent addtemp oasis 30d ${GRIEF_SERVER}`],
      },
      {
        id: 'oasis-3m',
        label: '3 мес',
        price: 129,
        commands: [`lp user {player} parent addtemp oasis 90d ${GRIEF_SERVER}`],
      },
      {
        id: 'oasis-12m',
        label: '12 мес',
        price: 399,
        commands: [`lp user {player} parent addtemp oasis 365d ${GRIEF_SERVER}`],
      },
    ],
  },
  {
    id: 'aladin',
    type: ProductType.PRIVILEGE,
    name: 'ALADIN',
    image: '/images/shop/aladin.png',
    description: '/heal, /ptime, /repair, /kits',
    variants: [
      {
        id: 'aladin-1m',
        label: '1 мес',
        price: 69,
        commands: [`lp user {player} parent addtemp aladin 30d ${GRIEF_SERVER}`],
      },
      {
        id: 'aladin-3m',
        label: '3 мес',
        price: 179,
        commands: [`lp user {player} parent addtemp aladin 90d ${GRIEF_SERVER}`],
      },
      {
        id: 'aladin-12m',
        label: '12 мес',
        price: 549,
        commands: [`lp user {player} parent addtemp aladin 365d ${GRIEF_SERVER}`],
      },
    ],
  },
  {
    id: 'lotus',
    type: ProductType.PRIVILEGE,
    name: 'LOTUS',
    image: '/images/shop/lotus.png',
    description: '/repairall, /head, /stonecutter, /kits',
    variants: [
      {
        id: 'lotus-1m',
        label: '1 мес',
        price: 99,
        commands: [`lp user {player} parent addtemp lotus 30d ${GRIEF_SERVER}`],
      },
      {
        id: 'lotus-3m',
        label: '3 мес',
        price: 249,
        commands: [`lp user {player} parent addtemp lotus 90d ${GRIEF_SERVER}`],
      },
      {
        id: 'lotus-12m',
        label: '12 мес',
        price: 749,
        commands: [`lp user {player} parent addtemp lotus 365d ${GRIEF_SERVER}`],
      },
    ],
  },
  {
    id: 'dune',
    type: ProductType.PRIVILEGE,
    name: 'DUNE',
    image: '/images/shop/dune.png',
    description: '/invsee, /book, /trash, /near, /kits',
    variants: [
      {
        id: 'dune-1m',
        label: '1 мес',
        price: 149,
        commands: [`lp user {player} parent addtemp dune 30d ${GRIEF_SERVER}`],
      },
      {
        id: 'dune-3m',
        label: '3 мес',
        price: 379,
        commands: [`lp user {player} parent addtemp dune 90d ${GRIEF_SERVER}`],
      },
      {
        id: 'dune-12m',
        label: '12 мес',
        price: 1149,
        commands: [`lp user {player} parent addtemp dune 365d ${GRIEF_SERVER}`],
      },
    ],
  },
  {
    id: 'dejavu',
    type: ProductType.PRIVILEGE,
    name: 'DEJAVU',
    image: '/images/shop/dejavu.png',
    description: '/ec (ник), /msgtoggle, /near, /grindstone, /kits',
    variants: [
      {
        id: 'dejavu-1m',
        label: '1 мес',
        price: 249,
        commands: [`lp user {player} parent addtemp dejavu 30d ${GRIEF_SERVER}`],
      },
      {
        id: 'dejavu-3m',
        label: '3 мес',
        price: 629,
        commands: [`lp user {player} parent addtemp dejavu 90d ${GRIEF_SERVER}`],
      },
      {
        id: 'dejavu-12m',
        label: '12 мес',
        price: 1899,
        commands: [`lp user {player} parent addtemp dejavu 365d ${GRIEF_SERVER}`],
      },
    ],
  },
  {
    id: 'mirage',
    type: ProductType.PRIVILEGE,
    name: 'MIRAGE',
    image: '/images/shop/mirage.png',
    description: '/nick, /realname, /near, /smithingtable, /thor, /kits',
    variants: [
      {
        id: 'mirage-1m',
        label: '1 мес',
        price: 499,
        commands: [`lp user {player} parent addtemp mirage 30d ${GRIEF_SERVER}`],
      },
      {
        id: 'mirage-3m',
        label: '3 мес',
        price: 1249,
        commands: [`lp user {player} parent addtemp mirage 90d ${GRIEF_SERVER}`],
      },
      {
        id: 'mirage-12m',
        label: '12 мес',
        price: 3749,
        commands: [`lp user {player} parent addtemp mirage 365d ${GRIEF_SERVER}`],
      },
    ],
  },
  {
    id: 'case-title',
    type: ProductType.CASE,
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
