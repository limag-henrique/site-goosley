import { PortalError } from "./errors";

type JsonRecord = Record<string, unknown>;

export function asRecord(value: unknown, context = "payload"): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new PortalError(`Invalid ${context}`, 422, "VALIDATION_ERROR");
  }

  return value as JsonRecord;
}

export function stringField(body: JsonRecord, key: string, options?: { min?: number; max?: number; optional?: false }): string;
export function stringField(body: JsonRecord, key: string, options: { min?: number; max?: number; optional: true }): string | undefined;
export function stringField(body: JsonRecord, key: string, options: { min?: number; max?: number; optional?: boolean } = {}) {
  const value = body[key];
  if (value == null && options.optional) {
    return undefined;
  }

  if (typeof value !== "string") {
    throw new PortalError(`${key} must be a string`, 422, "VALIDATION_ERROR");
  }

  const trimmed = value.trim();
  if (options.min && trimmed.length < options.min) {
    throw new PortalError(`${key} must be at least ${options.min} characters`, 422, "VALIDATION_ERROR");
  }

  if (options.max && trimmed.length > options.max) {
    throw new PortalError(`${key} must be at most ${options.max} characters`, 422, "VALIDATION_ERROR");
  }

  return trimmed;
}

export function numberField(body: JsonRecord, key: string, options?: { min?: number; max?: number; optional?: false }): number;
export function numberField(body: JsonRecord, key: string, options: { min?: number; max?: number; optional: true }): number | undefined;
export function numberField(body: JsonRecord, key: string, options: { min?: number; max?: number; optional?: boolean } = {}) {
  const value = body[key];
  if (value == null && options.optional) {
    return undefined;
  }

  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new PortalError(`${key} must be a number`, 422, "VALIDATION_ERROR");
  }

  if (options.min != null && value < options.min) {
    throw new PortalError(`${key} must be at least ${options.min}`, 422, "VALIDATION_ERROR");
  }

  if (options.max != null && value > options.max) {
    throw new PortalError(`${key} must be at most ${options.max}`, 422, "VALIDATION_ERROR");
  }

  return value;
}

export function integerCents(body: JsonRecord, key: string, options?: { optional?: false; min?: number }): number;
export function integerCents(body: JsonRecord, key: string, options: { optional: true; min?: number }): number | undefined;
export function integerCents(body: JsonRecord, key: string, options: { optional?: boolean; min?: number } = {}) {
  const value = options.optional
    ? numberField(body, key, { optional: true, min: options.min })
    : numberField(body, key, { min: options.min });
  if (value == null) {
    return undefined;
  }

  if (!Number.isInteger(value)) {
    throw new PortalError(`${key} must be an integer amount in cents`, 422, "VALIDATION_ERROR");
  }

  return value;
}

export function enumField<T extends string>(
  body: JsonRecord,
  key: string,
  allowed: readonly T[],
  options?: { optional?: false }
): T;
export function enumField<T extends string>(
  body: JsonRecord,
  key: string,
  allowed: readonly T[],
  options: { optional: true }
): T | undefined;
export function enumField<T extends string>(
  body: JsonRecord,
  key: string,
  allowed: readonly T[],
  options: { optional?: boolean } = {}
) {
  const value = body[key];
  if (value == null && options.optional) {
    return undefined;
  }

  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new PortalError(`${key} must be one of: ${allowed.join(", ")}`, 422, "VALIDATION_ERROR");
  }

  return value as T;
}

export function emailField(body: JsonRecord, key = "email") {
  const email = stringField(body, key, { min: 5, max: 254 }).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new PortalError(`${key} must be a valid email`, 422, "VALIDATION_ERROR");
  }

  return email;
}

export function optionalStringArray(body: JsonRecord, key: string) {
  const value = body[key];
  if (value == null) {
    return [];
  }

  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new PortalError(`${key} must be an array of strings`, 422, "VALIDATION_ERROR");
  }

  return value.map((item) => item.trim()).filter(Boolean);
}

export function safeJsonRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
}
