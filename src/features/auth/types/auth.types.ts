export type JwtPayload = {
  sub: string;
  role: 'user' | 'admin';
};

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
