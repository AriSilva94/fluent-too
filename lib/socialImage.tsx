import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { localeLabels, type Locale } from "@/lib/i18n";

export const socialImageSize = {
  width: 1200,
  height: 630,
} as const;

export const socialImageContentType = "image/png";

const socialImageCopy: Record<
  Locale,
  {
    eyebrow: string;
    heroLines: [string, string];
    heroAccent: string;
    tags: [string, string, string];
    sideNote: string;
    sideHighlights: [string, string];
  }
> = {
  "pt-br": {
    eyebrow: "Aprenda idiomas com clareza",
    heroLines: ["Desbloqueie uma", "nova língua com"],
    heroAccent: "fluência",
    tags: ["Quizzes", "Artigos", "Recursos práticos"],
    sideNote: "Conteúdo direto, útil e feito para prática real.",
    sideHighlights: ["Estude no seu ritmo", "Evolua com consistência"],
  },
  "en-us": {
    eyebrow: "Learn languages with clarity",
    heroLines: ["Unlock a", "new language with"],
    heroAccent: "fluency",
    tags: ["Quizzes", "Articles", "Practical resources"],
    sideNote: "Straightforward content designed for real practice.",
    sideHighlights: ["Study at your pace", "Improve consistently"],
  },
  "fr-fr": {
    eyebrow: "Progressez en langues avec clarté",
    heroLines: ["Débloquez une", "nouvelle langue avec"],
    heroAccent: "aisance",
    tags: ["Quizzes", "Articles", "Ressources pratiques"],
    sideNote: "Un contenu clair, utile et conçu pour la pratique réelle.",
    sideHighlights: ["Avancez à votre rythme", "Progressez avec régularité"],
  },
};

let cachedLogoDataUrl: string | null = null;

async function getLogoDataUrl() {
  if (cachedLogoDataUrl) return cachedLogoDataUrl;

  const logoBuffer = await readFile("app/icon.png");
  cachedLogoDataUrl = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return cachedLogoDataUrl;
}

export async function createSocialImage(locale: Locale) {
  const copy = socialImageCopy[locale];
  const logoSrc = await getLogoDataUrl();
  const palette = {
    orange: "#ff6700",
    blue: "#4184f9",
    text: "#171717",
    white: "#ffffff",
    orangeSoft: "#fff2e8",
    blueSoft: "#eef5ff",
    border: "rgba(23, 23, 23, 0.08)",
  };

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, #ffefe3 0%, #ffffff 48%, #edf4ff 100%)",
          color: palette.text,
          fontFamily:
            '"Segoe UI", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, rgba(65, 132, 249, 0.14), transparent 34%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -60,
            width: 420,
            height: 420,
            borderRadius: 999,
            background: "rgba(65, 132, 249, 0.08)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -140,
            left: -90,
            width: 360,
            height: 360,
            borderRadius: 999,
            background: "rgba(255, 103, 0, 0.12)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: "100%",
            padding: "52px 64px 44px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 18,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 88,
                  height: 88,
                  borderRadius: 26,
                  background: palette.blue,
                  border: "1px solid rgba(255, 255, 255, 0.18)",
                  boxShadow: "0 18px 40px rgba(65, 132, 249, 0.28)",
                }}
              >
                {/* next/og renders plain HTML; next/image is not supported here */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Fluent Too logo"
                  src={logoSrc}
                  style={{
                    width: 58,
                    height: 58,
                    objectFit: "cover",
                    filter: "brightness(0) invert(1)",
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    textTransform: "uppercase",
                    letterSpacing: 3,
                    color: palette.orange,
                  }}
                >
                  {copy.eyebrow}
                </div>
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    letterSpacing: -0.8,
                    color: palette.blue,
                  }}
                >
                  fluent-too.com
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 94,
                padding: "14px 20px",
                borderRadius: 999,
                background: "rgba(255, 255, 255, 0.8)",
                border: `1px solid ${palette.border}`,
                fontSize: 20,
                fontWeight: 700,
                color: palette.blue,
              }}
            >
              {localeLabels[locale]}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 40,
              marginTop: 12,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                color: palette.blue,
                maxWidth: 760,
              }}
            >
                <div
                  style={{
                    fontSize: 64,
                    lineHeight: 1.02,
                    fontWeight: 500,
                    letterSpacing: -2.2,
                  }}
                >
                  {copy.heroLines[0]}
                </div>
                <div
                  style={{
                    fontSize: 64,
                    lineHeight: 1.02,
                    fontWeight: 500,
                    letterSpacing: -2.2,
                  }}
                >
                  {copy.heroLines[1]}
                </div>
                <div
                  style={{
                    fontSize: 104,
                    lineHeight: 0.92,
                    fontWeight: 700,
                    letterSpacing: -4.2,
                    color: palette.orange,
                  }}
                >
                  {copy.heroAccent}
                </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 20,
                width: 300,
                marginTop: 28,
                padding: "26px 26px 24px",
                borderRadius: 32,
                background: "linear-gradient(180deg, rgba(255, 255, 255, 0.82) 0%, rgba(255, 255, 255, 0.68) 100%)",
                border: `1px solid ${palette.border}`,
                boxShadow: "0 22px 56px rgba(65, 132, 249, 0.10)",
                backdropFilter: "blur(6px)",
                color: palette.text,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  textTransform: "uppercase",
                  letterSpacing: 3.2,
                  color: palette.orange,
                  fontWeight: 700,
                }}
              >
                Fluent Too
              </div>
              <div
                style={{
                  fontSize: 27,
                  lineHeight: 1.22,
                  fontWeight: 600,
                  letterSpacing: -0.8,
                }}
              >
                {copy.sideNote}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 0,
                  borderTop: `1px solid ${palette.border}`,
                  paddingTop: 14,
                }}
              >
                {copy.sideHighlights.map((item, index) => (
                  <div
                    key={item}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: index === 0 ? "0 0 12px" : "12px 0 0",
                      borderTop: index === 0 ? "none" : `1px solid ${palette.border}`,
                      fontSize: 18,
                      lineHeight: 1.35,
                      color: palette.blue,
                      fontWeight: 600,
                    }}
                  >
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 999,
                        background: palette.orange,
                        flexShrink: 0,
                      }}
                    />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "flex-end",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: 14,
                flexWrap: "wrap",
                paddingTop: 10,
                paddingBottom: 2,
              }}
            >
              {copy.tags.map((item, index) => (
                <div
                  key={item}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "14px 18px",
                    borderRadius: 999,
                    background:
                      index === 0
                        ? palette.orangeSoft
                        : index === 1
                          ? palette.blueSoft
                          : "rgba(255, 255, 255, 0.82)",
                    border: `1px solid ${palette.border}`,
                    fontSize: 22,
                    color: index === 0 ? palette.orange : palette.blue,
                    fontWeight: 700,
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    socialImageSize,
  );
}
