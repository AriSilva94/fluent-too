You are a senior Next.js engineer.

We have a Next.js project using the App Router, TypeScript, and Tailwind CSS. Implement internationalization (i18n) for the entire website based on the official Next.js App Router i18n guide:
https://nextjs.org/docs/app/guides/internationalization

Languages/locales:
- pt-BR (default)
- en-US
- fr-FR

Goals:
1) Add locale-aware routing so every page works under:
   /pt-br/...
   /en-us/...
   /fr-fr/...
   (use these URL slugs exactly: pt-br, en-us, fr-fr)

2) Provide a simple, reusable translation system for static UI strings (header menu, buttons, section titles, etc.):
   - Create message files for each locale (JSON is fine).
   - Example keys: nav.home, nav.resources, nav.blog, nav.student, nav.schedule, nav.contact, home.hero.titleLine1, etc.
   - Implement a small helper to load the dictionary for the active locale on the server (App Router friendly).

3) Add a language switcher component in the Header:
   - Shows PT-BR, EN, FR options.
   - Switching language should keep the user on the same page/path when possible.
   - Use Next.js navigation APIs in a way compatible with App Router.

4) Ensure SEO-friendly metadata per locale:
   - Localized <title> and description for at least Home, Blog, Quizzes.
   - Use Next.js metadata API (generateMetadata) in the locale routes.

5) Persistence / detection:
   - Default locale: pt-BR
   - If user previously chose a language, persist it via cookie.
   - If no cookie, use Accept-Language to choose a best match, otherwise fallback to pt-BR.
   - Implement middleware for redirecting from non-locale paths to the correct locale path.

6) Developer experience:
   - Strict typing for locales (TypeScript union).
   - A single source of truth for locales and defaultLocale.
   - Provide clear folder structure for i18n files and routing.

Implementation constraints:
- Do NOT use external i18n libraries (no next-intl, no i18next). Use the approach recommended in the Next.js docs + a minimal custom dictionary loader.
- Keep all existing routes and components working—just make them locale-aware.
- The UI text must be translated for the main navigation and the Home page sections (Header, Hero, Newsletter, Blog, Quiz, Footer) with realistic translations in pt-BR, en-US, fr-FR.
- Keep styling intact (Tailwind), do not redesign the UI.

Deliverables:
- Show the final folder structure.
- Provide the full code for all new/updated files:
  - middleware.ts
  - app/[locale]/layout.tsx and any route updates needed
  - i18n config (locales constants + types)
  - dictionary loader utility
  - message JSON files (pt-br.json, en-us.json, fr-fr.json)
  - updated Header with LanguageSwitcher
  - updated pages/components to use translations
- Include a short “How to add a new translation key” note at the end.

Now implement it.
