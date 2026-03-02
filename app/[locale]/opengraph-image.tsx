import type { Locale } from "@/lib/i18n";
import { createSocialImage, socialImageContentType, socialImageSize } from "@/lib/socialImage";

export const size = socialImageSize;
export const contentType = socialImageContentType;
export const alt = "Fluent Too social preview";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return await createSocialImage(locale);
}
