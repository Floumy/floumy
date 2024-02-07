export interface SignInDto {
  email: string;
  password: string;
}

export interface SignUpDto {
  name: string;
  email: string;
  password: string;
  invitationToken?: string;
}

export interface RefreshTokenDto {
  refreshToken: string;
}
