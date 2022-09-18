export interface IContact {
  id: number;
  url: string;
}

export interface IContacts {
  vk: IContact;
  discord: IContact;
}
