export interface IAuth {
  id: number;
  username: string;
  realname: string;
  password: string;
  ip: string | null;
  lastlogin: number | null;
  x: number;
  y: number;
  z: number;
  world: string;
  regdate: number;
  regip: string | null;
  yaw: number | null;
  pitch: number | null;
  email: string | null;
  isLogged: number;
  hasSession: number;
  totp: string | number;
}
