export interface IAuthUser {
  id: string;
  email?: string;
  fullName?: string;
  phoneNumber?: string;
  roles?: string[];
}

export interface IValidatedUser {
  user: IUserData;
  roles: string[];
  permissions: string[];
}
export interface IUserData {
  id: string;
  identifier: string;
  fullName: string;
  phoneNumber: string;
  email: string;
}

export interface ILginResponse {
  accessToken: string;
  refreshToken: string;
  permissionToken: string;
  user: null | IAuthUser;
}
