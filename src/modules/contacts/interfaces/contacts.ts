export interface IContact {
  id: number;
  url: string;
}

export interface IContacts {
  email: IContact;
  discord: IContact;
  tg: IContact;
}
