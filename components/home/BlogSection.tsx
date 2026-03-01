import Link from "next/link";
import Image from "next/image";
import Container from "@/components/ui/Container";
import SectionHeading from "@/components/ui/SectionHeading";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/lib/getDictionary";
import { blogData } from "@/lib/blogData";

export default function BlogSection({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const posts = blogData[locale].slice(0, 6);

  return (
    <section id="blog" className="bg-white pb-8 pt-0 md:pb-14 md:pt-1">
      <Container>
        <SectionHeading
          title={dict.home.blog.title}
          className="mb-6 text-center text-brand-blue [font-size:var(--text-blog-title)]"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/${locale}/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-[22px] border-2 border-brand-orange bg-white transition-all hover:shadow-lg h-full"
            >
              {/* Image Container */}
              <div className="relative h-52 w-full">
                <Image
                  src={post.coverImage || "/assets/img/BLOGPOST.png"}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Badge */}
                <span className="absolute right-4 top-4 z-10 rounded-full bg-brand-orange px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
                  {post.category}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-orange">
                  <span>{dict.blog.featured}</span>
                  <span className="text-gray-300">/</span>
                  <span className="text-gray-500">{post.readingTime} {dict.blog.readingTime}</span>
                </div>
                <h3 className="mb-3 text-xl font-bold text-brand-blue line-clamp-3">
                  {post.title}
                </h3>
                <p className="mb-4 flex-1 text-sm text-gray-500 line-clamp-3">
                  {post.excerpt}
                </p>
                <span className="text-xs font-bold text-brand-blue uppercase hover:underline">
                  {dict.blog.readMore} »
                </span>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
