import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  SUPPORTED_LOCALES,
  isLocale,
  type Locale,
} from "@/lib/i18n-config";

function negotiateFromHeader(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const preferences = acceptLanguage
    .split(",")
    .map((part) => part.split(";")[0].trim().toLowerCase().slice(0, 2));
  for (const candidate of preferences) {
    const match = SUPPORTED_LOCALES.find((l) => l === candidate);
    if (match) return match;
  }
  return DEFAULT_LOCALE;
}

export default getRequestConfig(async () => {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);

  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale: Locale = isLocale(cookieLocale)
    ? cookieLocale
    : negotiateFromHeader(headerStore.get("accept-language"));

  const messages = (await import(`../messages/${locale}.json`)).default;

  return { locale, messages };
});
