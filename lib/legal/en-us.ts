import type { LegalPack } from "./types";

export const enUsLegal: LegalPack = {
  terms: {
    title: "Terms of use",
    summary: "These rules apply to everyone who accesses and uses Fluent Too. By creating an account, you agree to them.",
    sections: [
      {
        heading: "1. About the platform",
        body: [
          "Fluent Too is a language study platform with level-based quizzes, supporting material, and progress tracking.",
          "Public content needs no account. Saving progress, creating quizzes, and reviewing applications require one.",
        ],
      },
      {
        heading: "2. Your account",
        body: [
          "You are responsible for the information you provide at sign-up and for keeping your password private.",
          "Accounts are personal and non-transferable. If you notice misuse of your account, write to {email}.",
          "An account can be created with e-mail and password or through Google sign-in.",
        ],
      },
      {
        heading: "3. Profiles and permissions",
        body: [
          "Students take quizzes and follow their own history.",
          "Teachers can create and edit quizzes in the languages approved in their application, which is reviewed manually by the team.",
          "Approving an application is a Fluent Too decision and may be reconsidered if these terms are broken.",
        ],
      },
      {
        heading: "4. Content you publish",
        body: [
          "By publishing quizzes or materials, you confirm you hold the necessary rights over that content and allow Fluent Too to display it on the platform.",
          "You remain the owner of what you create.",
          "Content that infringes third-party rights, contains hate speech, or spreads misleading information may be unpublished.",
        ],
      },
      {
        heading: "5. Acceptable use",
        body: [
          "You may not try to access other people's accounts, bypass permission rules, scrape data automatically, or overload the platform.",
          "Breaking these rules may lead to suspension or account termination.",
        ],
      },
      {
        heading: "6. Availability and changes",
        body: [
          "The platform evolves continuously: features may be added, changed, or removed.",
          "We work to keep the service running, but it is offered as is, with no guarantee of uninterrupted availability.",
        ],
      },
      {
        heading: "7. Termination",
        body: [
          "You may request account deletion at any time by writing to {email}.",
          "We may terminate accounts that break these terms, with notice whenever possible.",
        ],
      },
      {
        heading: "8. Limitation of liability",
        body: [
          "Study content is educational and does not replace professional guidance or official language certification.",
          "To the extent permitted by law, we are not liable for indirect damages arising from use of the platform.",
        ],
      },
      {
        heading: "9. Governing law",
        body: ["These terms are governed by Brazilian law."],
      },
      {
        heading: "10. Contact",
        body: ["Questions about these terms: {email}."],
      },
    ],
  },
  privacy: {
    title: "Privacy policy",
    summary: "How Fluent Too collects, uses, and protects your personal data under Brazil's General Data Protection Law (LGPD).",
    sections: [
      {
        heading: "1. Data we collect",
        body: [
          "Sign-up: e-mail, username, and password (stored only in encrypted form).",
          "Platform use: quizzes taken, scores, answer dates, and the study language you choose.",
          "Teacher application: bio, experience, languages taught and, when provided, a credential link and an attached file.",
          "Google sign-in: the e-mail and basic account name, when you choose that method.",
        ],
      },
      {
        heading: "2. Why we use it",
        body: [
          "To authenticate your access and keep your session active.",
          "To record and show your study progress.",
          "To review teacher applications and communicate the decision.",
          "To send operational e-mails such as sign-up confirmation and password reset.",
        ],
      },
      {
        heading: "3. Legal bases",
        body: [
          "Performance of a contract, for everything needed to run your account.",
          "Consent, for documents sent with a teacher application.",
          "Legal obligation and legitimate interest, for security and abuse prevention.",
        ],
      },
      {
        heading: "4. Cookies",
        body: [
          "We use strictly necessary cookies to keep you signed in and remember your chosen language.",
          "We use no advertising or cross-site tracking cookies.",
        ],
      },
      {
        heading: "5. Sharing",
        body: [
          "We do not sell personal data.",
          "We share only with providers required to operate the service, such as hosting, database, and e-mail delivery, and with Google when you choose social sign-in.",
        ],
      },
      {
        heading: "6. Retention",
        body: [
          "We keep your data while your account exists.",
          "After termination, we delete or anonymize it, except what must be kept by legal obligation.",
        ],
      },
      {
        heading: "7. Your rights",
        body: [
          "You may request access, correction, portability, anonymization, or deletion of your data, and withdraw consent.",
          "To exercise any of these rights, write to {email}. We reply within 15 days.",
        ],
      },
      {
        heading: "8. Security",
        body: [
          "Passwords are hashed, traffic is protected by HTTPS, and administrative access is restricted by permission role.",
          "No system is fully immune to incidents; in case of a relevant breach, we will notify the people affected and the Brazilian data protection authority.",
        ],
      },
      {
        heading: "9. Children and teenagers",
        body: ["People under 16 should use the platform only with a legal guardian's consent."],
      },
      {
        heading: "10. Changes",
        body: ["We may update this policy. The date of the latest update is shown at the top of this page."],
      },
      {
        heading: "11. Contact",
        body: ["Questions about privacy and data protection: {email}."],
      },
    ],
  },
};
