# Fluent Too

Your platform for learning, quizzes, and knowledge sharing — built with **Next.js 16**, **React 19**, and **Tailwind CSS 4**.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
fluent-too/
├── app/
│   ├── layout.tsx              # Root layout (shared Header + Footer)
│   ├── page.tsx                # / — Home
│   ├── about/page.tsx          # /about
│   ├── blog/
│   │   ├── page.tsx            # /blog — post list
│   │   └── [slug]/page.tsx     # /blog/:slug — post detail
│   ├── quizzes/
│   │   ├── page.tsx            # /quizzes — quiz list
│   │   └── [id]/page.tsx       # /quizzes/:id — quiz attempt
│   ├── login/page.tsx          # /login
│   ├── dashboard/page.tsx      # /dashboard — logged-in area
│   └── admin/page.tsx          # /admin — teacher/admin area
├── components/
│   ├── ui/
│   │   └── SkeletonBox.tsx     # Reusable placeholder block
│   └── home/
│       ├── Header.tsx          # Top nav with active-route styling
│       ├── Hero.tsx            # Hero / presentation section
│       ├── Newsletter.tsx      # Newsletter signup form
│       ├── BlogSection.tsx     # 3 latest post cards
│       ├── QuizSection.tsx     # 3 popular quiz cards
│       └── Footer.tsx          # Site footer
```

## Routes

| Route | Description |
|---|---|
| `/` | Home — Hero, Newsletter, Blog preview, Quiz preview |
| `/about` | About page |
| `/blog` | Blog post list |
| `/blog/[slug]` | Individual blog post |
| `/quizzes` | Quiz list |
| `/quizzes/[id]` | Quiz attempt |
| `/login` | Sign-in form |
| `/dashboard` | User dashboard (authenticated) |
| `/admin` | Admin/teacher panel |

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router + Turbopack)
- **UI**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) via `@tailwindcss/postcss`
- **Language**: TypeScript

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |
