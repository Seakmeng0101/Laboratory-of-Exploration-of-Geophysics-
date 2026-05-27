export enum Role {
  ADMIN     = 'admin',
  MODERATOR = 'moderator',
}

export interface JwtPayload {
  userId: string;
  email:  string;
  role:   Role;
}

export interface TokenPair {
  accessToken:  string;
  refreshToken: string;
}

export interface RegisterUserDto {
  name:     string;
  email:    string;
  password: string;
  role?:    Role;
}

export interface LoginDto {
  email:    string;
  password: string;
}