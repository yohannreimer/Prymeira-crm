// Based on https://github.com/supabase/supabase/blob/master/examples/edge-functions/supabase/functions/_shared/jwt/default.ts
import * as jose from "jsr:@panva/jose@6";
import { createErrorResponse } from "./utils.ts";

export type AuthenticatedUser = {
  id: string;
  email?: string;
};

let clerkJwtKeys: ReturnType<typeof jose.createRemoteJWKSet> | null = null;

export function getAuthToken(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    throw new Error("Missing authorization header");
  }
  const [bearer, token] = authHeader.split(" ");
  if (bearer !== "Bearer" || !token) {
    throw new Error(`Auth header is not 'Bearer {token}'`);
  }

  return token;
}

const getClerkJwtIssuer = () => {
  const issuer = Deno.env.get("CLERK_JWT_ISSUER");
  if (!issuer) {
    throw new Error("Missing CLERK_JWT_ISSUER");
  }
  return issuer;
};

const getClerkJwksUrl = () => {
  const configuredUrl = Deno.env.get("CLERK_JWKS_URL");
  if (configuredUrl) return configuredUrl;

  return `${getClerkJwtIssuer().replace(/\/$/, "")}/.well-known/jwks.json`;
};

const getClerkJwtKeys = () => {
  if (!clerkJwtKeys) {
    clerkJwtKeys = jose.createRemoteJWKSet(new URL(getClerkJwksUrl()));
  }
  return clerkJwtKeys;
};

export async function verifyClerkJWT(jwt: string) {
  return await jose.jwtVerify(jwt, getClerkJwtKeys(), {
    issuer: getClerkJwtIssuer(),
  });
}

const userFromJwtPayload = (payload: jose.JWTPayload): AuthenticatedUser => {
  if (!payload.sub) {
    throw new Error("Missing JWT subject");
  }

  const email =
    typeof payload.email === "string"
      ? payload.email
      : typeof payload.primary_email_address === "string"
        ? payload.primary_email_address
        : undefined;

  return {
    id: payload.sub,
    email,
  };
};

/**
 * Validates the Authorization header to ensure that a user is authenticated.
 */
export const AuthMiddleware = async (
  req: Request,
  next: (req: Request) => Promise<Response>,
) => {
  if (req.method === "OPTIONS") return await next(req);

  try {
    const token = getAuthToken(req);
    await verifyClerkJWT(token);

    return await next(req);
  } catch (e) {
    return createErrorResponse(401, e?.toString() || "Unauthorized");
  }
};

/**
 * Get the authenticated user using the authorization header.
 * User will be undefined for OPTIONS requests.
 */
export const UserMiddleware = async (
  req: Request,
  next: (req: Request, user?: AuthenticatedUser) => Promise<Response>,
) => {
  if (req.method === "OPTIONS") return await next(req);

  try {
    const token = getAuthToken(req);
    const { payload } = await verifyClerkJWT(token);

    return next(req, userFromJwtPayload(payload));
  } catch (err) {
    return createErrorResponse(401, err?.toString() || "Unauthorized");
  }
};
