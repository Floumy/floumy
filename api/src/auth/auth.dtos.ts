export interface SignInDto {
  email: string;
  password: string;
}

export interface OrgSignUpDto {
  name: string;
  email: string;
  password: string;
  projectName?: string;
  invitationToken?: string;
}

export interface SignUpDto {
  name: string;
  email: string;
  password: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}
