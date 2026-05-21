type AccessTokenProvider = () => string | Promise<string | null> | null;

let accessTokenProvider: AccessTokenProvider | null = null;

export const setPostgresAccessTokenProvider = (
  provider: AccessTokenProvider | null,
) => {
  accessTokenProvider = provider;
};

export const getPostgresAccessToken = async () => {
  if (!accessTokenProvider) return null;
  return accessTokenProvider();
};
