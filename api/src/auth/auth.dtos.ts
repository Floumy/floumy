export interface SignInDto {
  email: string;
  password: string;
}

export interface OrgSignUpDto {
  name: string;
  email: string;
  password: string;
  invitationToken?: string;
  productName?: string;
}

export interface SignUpDto {
  name: string;
  email: string;
  password: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}
