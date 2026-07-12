import { Role } from '../enums/user-role.enum';
export class PublicUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  createdAt: Date;
}
