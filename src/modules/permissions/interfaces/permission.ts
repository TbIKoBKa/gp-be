import { IPermissionInheritance } from './permissionInheritance';

export interface IPermission {
  id: number;
  name: string;
  type: number;
  permission: string;
  value: string;
  permissionInheritance?: IPermissionInheritance;
}
