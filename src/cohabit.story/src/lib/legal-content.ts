/**
 * Legal content for Cohabit, drafted to align with South African law:
 * - Privacy Policy: Protection of Personal Information Act 4 of 2013 (POPIA)
 * - Terms of Use: Consumer Protection Act 68 of 2008 (CPA) and Electronic
 *   Communications and Transactions Act 25 of 2002 (ECT Act)
 *
 * This content is provided for informational purposes and does not constitute
 * legal advice. Have it reviewed by a qualified South African attorney before
 * relying on it in production.
 */

export interface LegalSection {
  title: string
  body: string
}

export const LEGAL_CONTACT_EMAIL = "legal@cohabit.app"
export const LEGAL_OPERATOR = "Cohabit"
export const LEGAL_LAST_UPDATED = "August 2026"

export const TERMS_OF_USE: LegalSection[] = [
  {
    title: "1. Introduction and acceptance",
    body: "These Terms of Use ('Terms') govern your access to and use of the Cohabit platform ('the Platform'), including the website and any related services. By creating an account, accessing, or using the Platform, you agree to be bound by these Terms. If you do not agree, please do not use the Platform.",
  },
  {
    title: "2. The service we provide",
    body: "Cohabit is an online matching platform that helps people find compatible co-habitants and shared accommodation. We are not a letting agency, estate agent, landlord, or tenant. We do not own, lease, or manage any property, and we are not a party to any lease or occupancy agreement concluded between users. Any tenancy or cohabitation arrangement is strictly between the users themselves.",
  },
  {
    title: "3. Eligibility",
    body: "You must be at least 18 years old and legally capable of entering into a binding contract to use the Platform. By using the Platform you confirm that you are 18 or older and that the information you provide is true, accurate, and current. If you are under 18, you may not create an account.",
  },
  {
    title: "4. Electronic contracting",
    body: "These Terms are concluded electronically in terms of section 11 of the Electronic Communications and Transactions Act 25 of 2002 (ECT Act). Your acceptance of these Terms, your registration, and your use of the Platform constitute a valid and binding electronic agreement. You agree that electronic records and signatures are valid and enforceable.",
  },
  {
    title: "5. Your account and security",
    body: "You are responsible for safeguarding your account credentials and for all activity that occurs under your account. You must notify us immediately of any unauthorised use or security breach. We may suspend or close accounts that are used in breach of these Terms or that pose a risk to other users or the Platform.",
  },
  {
    title: "6. Acceptable use",
    body: "You agree not to use the Platform to: post false, misleading, or fraudulent listings or profiles; harass, threaten, or discriminate against others; share unlawful, defamatory, or infringing content; attempt to gain unauthorised access to the Platform or other users' accounts; or use the Platform for any purpose that violates South African law.",
  },
  {
    title: "7. Listings and user content",
    body: "You are solely responsible for the accuracy and lawfulness of the content you post, including listings, photos, and profile information. You grant Cohabit a non-exclusive, royalty-free licence to host, display, and process your content solely to operate and improve the Platform. We may remove content that breaches these Terms or applicable law.",
  },
  {
    title: "8. Intellectual property",
    body: "The Platform, including its software, design, branding, and content (other than user content), is owned by or licensed to Cohabit and is protected by South African and international intellectual property laws. You may not copy, modify, distribute, or reverse engineer any part of the Platform without our prior written consent.",
  },
  {
    title: "9. Fees and payments",
    body: "The Platform is currently free to use. If we introduce fees or paid features in future, we will notify you in advance and obtain your consent before charging you. Any fees will be displayed clearly and will be subject to these Terms and applicable consumer protection law.",
  },
  {
    title: "10. Disclaimers",
    body: "The Platform is provided 'as is' and 'as available'. While we work hard to keep the Platform safe and functional, we do not guarantee that it will be uninterrupted, error-free, or free of harmful components. We do not verify the identity, background, or claims of every user, and we do not guarantee that you will find a compatible co-habitant. You are responsible for conducting your own due diligence before entering into any arrangement with another user.",
  },
  {
    title: "11. Limitation of liability",
    body: "To the maximum extent permitted by law, Cohabit and its operators will not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform or your dealings with other users. Nothing in these Terms limits or excludes any rights you have as a consumer under the Consumer Protection Act 68 of 2008 (CPA) that cannot be lawfully limited or excluded, and nothing in these Terms constitutes a waiver of your rights under the CPA.",
  },
  {
    title: "12. Consumer protection",
    body: "These Terms are drafted in plain and understandable language as required by section 22 of the CPA. Nothing in these Terms limits your rights as a consumer under the CPA or any other applicable law. If any provision of these Terms is found to be unlawful, void, or unenforceable, that provision will be severed and the remaining provisions will continue in full force and effect.",
  },
  {
    title: "13. Termination and suspension",
    body: "You may stop using the Platform and delete your account at any time. We may suspend or terminate your access if you breach these Terms, if we are required to do so by law, or if continued provision of the service to you poses a risk to the Platform or other users. On termination, your right to use the Platform ends, and we will handle your personal information in line with our Privacy Policy and POPIA.",
  },
  {
    title: "14. Changes to these Terms",
    body: "We may update these Terms from time to time to reflect changes in our service or the law. We will notify you of material changes through the Platform or by email. Continued use of the Platform after changes take effect constitutes acceptance of the updated Terms.",
  },
  {
    title: "15. Governing law and jurisdiction",
    body: "These Terms are governed by and construed in accordance with the laws of the Republic of South Africa. Any dispute arising out of or in connection with these Terms will be subject to the exclusive jurisdiction of the courts of South Africa.",
  },
  {
    title: "16. Disputes and complaints",
    body: "If you have a complaint about the Platform or these Terms, please contact us first at " + LEGAL_CONTACT_EMAIL + " and we will do our best to resolve it. As a consumer you may also approach the National Consumer Commission (www.thencc.gov.za) or the National Consumer Tribunal (www.thenct.org.za) in respect of matters regulated by the CPA.",
  },
  {
    title: "17. Contact us",
    body: "If you have any questions about these Terms, please contact us at " + LEGAL_CONTACT_EMAIL + ".",
  },
]

export const PRIVACY_POLICY: LegalSection[] = [
  {
    title: "1. Introduction and responsible party",
    body: "This Privacy Policy explains how Cohabit ('we', 'us', 'our') collects, uses, and protects your personal information. We are the responsible party for the purposes of the Protection of Personal Information Act 4 of 2013 (POPIA). You can contact us at " + LEGAL_CONTACT_EMAIL + ".",
  },
  {
    title: "2. What personal information we collect",
    body: "We collect only the personal information needed to operate the Platform, including: your name, email address, cellphone number, date of birth, gender, location, profile photo, and biography; information you provide for verification; details of listings you create; messages and inquiries you send; and technical information such as device and usage data.",
  },
  {
    title: "3. Why we process your information",
    body: "We process your personal information lawfully and for specified purposes only, in line with section 11 of POPIA. The lawful grounds we rely on include: your consent; the performance of a contract with you (providing the Platform); compliance with a legal obligation; and our legitimate interests, such as keeping the Platform safe and improving our service. We will not process your information for any incompatible purpose without obtaining your consent.",
  },
  {
    title: "4. How we use your information",
    body: "We use your personal information to create and manage your account, match you with potential co-habitants, display your profile to other members you interact with, process your listings and inquiries, verify your identity where required, keep the Platform safe, and improve our services. We do not sell, rent, or trade your personal information to anyone.",
  },
  {
    title: "5. Sharing and disclosure",
    body: "We share your personal information only to the minimum extent necessary: with service providers (operators) such as hosting and email providers who process information on our behalf under written agreements that require them to protect it; and where required or permitted by law. Your profile is shown to other members only in the context of the Platform's matching features.",
  },
  {
    title: "6. Cross-border transfers",
    body: "Where we transfer your personal information outside South Africa, we do so in accordance with section 72 of POPIA, ensuring that the recipient is subject to a law, binding corporate rules, or a binding agreement that provides an adequate level of protection substantially similar to POPIA.",
  },
  {
    title: "7. Security safeguards",
    body: "We take appropriate, reasonable technical and organisational measures to secure the integrity and confidentiality of your personal information and to protect it against loss, damage, and unauthorised access or processing, as required by section 19 of POPIA. In the event of a security compromise, we will notify you and the Information Regulator as required by law.",
  },
  {
    title: "8. Retention",
    body: "We keep your personal information only for as long as necessary to achieve the purpose for which it was collected, or for as long as the law requires. When you delete your account, we will delete or de-identify your personal information unless we are required by law to retain it.",
  },
  {
    title: "9. Your rights",
    body: "Under POPIA you have the right to: request access to the personal information we hold about you; request that we correct or delete inaccurate, irrelevant, excessive, or outdated information; object to the processing of your personal information; withdraw your consent at any time; and object to direct marketing. To exercise any of these rights, contact us at " + LEGAL_CONTACT_EMAIL + ". We may need to verify your identity before responding.",
  },
  {
    title: "10. Children's privacy",
    body: "The Platform is intended for users who are 18 years or older. In line with sections 34 and 35 of POPIA, we do not knowingly process the personal information of children without the consent of a competent person. If you believe a child has provided us with personal information, please contact us so we can remove it.",
  },
  {
    title: "11. Cookies and analytics",
    body: "We may use cookies and similar technologies to keep you signed in, remember your preferences, and understand how the Platform is used. You can control cookies through your browser settings. We do not use cookies to sell your data or to track you across unrelated websites.",
  },
  {
    title: "12. Changes to this policy",
    body: "We may update this Privacy Policy from time to time to reflect changes in our practices or the law. We will notify you of material changes through the Platform or by email. The date at the top of this policy indicates when it was last updated.",
  },
  {
    title: "13. Complaints",
    body: "If you believe we have interfered with your privacy rights, please contact us first at " + LEGAL_CONTACT_EMAIL + " and we will investigate. You also have the right to lodge a complaint with the Information Regulator of South Africa: website www.inforegulator.org.za; postal address PO Box 31533, Braamfontein, Johannesburg, 2017; email POPIAComplaints@inforegulator.org.za.",
  },
]