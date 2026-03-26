import 'server-only';

import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

const SUBMISSION_PREVIEW_COOKIE = 'venue_submission_preview';
const SUBMISSION_PREVIEW_TTL_SECONDS = 60 * 60 * 24 * 7;
const MAX_PREVIEW_IDS = 12;

type SubmissionPreviewPayload = {
  exp: number;
  ids: string[];
};

function getPreviewSecret() {
  return process.env.PREVIEW_COOKIE_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
}

function sign(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('base64url');
}

function normalizeIds(ids: string[]) {
  return Array.from(
    new Set(
      ids
        .map((id) => id.trim())
        .filter(Boolean)
    )
  ).slice(0, MAX_PREVIEW_IDS);
}

function encodePayload(payload: SubmissionPreviewPayload, secret: string) {
  const serializedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = sign(serializedPayload, secret);
  return `${serializedPayload}.${signature}`;
}

function decodePayload(rawValue?: string) {
  const secret = getPreviewSecret();

  if (!rawValue || !secret) {
    return [];
  }

  const separatorIndex = rawValue.lastIndexOf('.');

  if (separatorIndex === -1) {
    return [];
  }

  const serializedPayload = rawValue.slice(0, separatorIndex);
  const signature = rawValue.slice(separatorIndex + 1);
  const expectedSignature = sign(serializedPayload, secret);

  if (signature.length !== expectedSignature.length) {
    return [];
  }

  if (!timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return [];
  }

  try {
    const parsed = JSON.parse(Buffer.from(serializedPayload, 'base64url').toString('utf8')) as SubmissionPreviewPayload;

    if (!parsed || !Array.isArray(parsed.ids) || typeof parsed.exp !== 'number' || parsed.exp < Date.now()) {
      return [];
    }

    return normalizeIds(parsed.ids);
  } catch {
    return [];
  }
}

export async function getSubmissionPreviewIds() {
  const cookieStore = await cookies();
  return decodePayload(cookieStore.get(SUBMISSION_PREVIEW_COOKIE)?.value);
}

export async function appendSubmissionPreviewId(id: string) {
  const secret = getPreviewSecret();

  if (!secret) {
    return;
  }

  const cookieStore = await cookies();
  const existingIds = decodePayload(cookieStore.get(SUBMISSION_PREVIEW_COOKIE)?.value);
  const nextIds = normalizeIds([id, ...existingIds]);

  cookieStore.set(SUBMISSION_PREVIEW_COOKIE, encodePayload({
    exp: Date.now() + SUBMISSION_PREVIEW_TTL_SECONDS * 1000,
    ids: nextIds
  }, secret), {
    httpOnly: true,
    maxAge: SUBMISSION_PREVIEW_TTL_SECONDS,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
}
