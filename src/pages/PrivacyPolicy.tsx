import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Cookie, Database, Eye, Mail } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-white/10 bg-background/90 backdrop-blur-md px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <button onClick={() => navigate(-1)} className="rounded-xl p-2 hover:bg-white/5 transition-colors" aria-label="Go back">
            <ArrowLeft size={20} className="text-muted-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-primary" />
            <h1 className="text-lg font-bold font-nunito">Privacy Policy</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-5 py-8 space-y-8">
        {/* Intro */}
        <div>
          <p className="text-sm text-muted-foreground font-dm-sans leading-relaxed">
            Last updated: March 2026
          </p>
          <p className="mt-3 text-sm text-muted-foreground font-dm-sans leading-relaxed">
            DOSE Academy is built by Odishon Corp (DBA DOSE). We take your privacy seriously — especially because our users are teens. This policy explains what data we collect, how we use it, and what choices you have. It's written to be clear, not confusing.
          </p>
        </div>

        {/* Sections */}
        <Section
          icon={<Eye size={18} className="text-primary" />}
          title="What we collect"
        >
          <ul className="space-y-2">
            <Li>
              <strong>Session data:</strong> When you use SPARK, WAVE, RSD, or Squad Focus, your session info (tool used, duration, completion status, XP earned) is stored locally on your device.
            </Li>
            <Li>
              <strong>Chat messages:</strong> If you use Slick (our chatbot), your conversation is stored securely to keep the chat flowing between visits. Messages are linked to a random device ID — not your name or email.
            </Li>
            <Li>
              <strong>Preferences:</strong> Your cookie choices, theme preference, and app settings are stored in your browser's local storage.
            </Li>
            <Li>
              <strong>Account data (if signed up):</strong> If you create an account for Study with a Friend, we collect your email, a display name, and your age bracket. For users 13-15, we also collect a parent/guardian email for consent verification.
            </Li>
            <Li>
              <strong>Data retention:</strong> Account data is retained for as long as your account is active. You or your parent/guardian can request deletion at any time. Chat data linked to device IDs is retained for up to 90 days of inactivity.
            </Li>
          </ul>
        </Section>

        <Section
          icon={<Cookie size={18} className="text-primary" />}
          title="How we use cookies"
        >
          <p className="text-sm text-muted-foreground font-dm-sans leading-relaxed mb-3">
            DOSE Academy uses two types of cookies:
          </p>
          <div className="space-y-3">
            <div className="rounded-xl border border-white/10 bg-card px-4 py-3">
              <p className="text-sm font-bold text-foreground font-nunito">Essential cookies</p>
              <p className="text-xs text-muted-foreground font-dm-sans mt-1">
                These keep the app working — remembering your session, saving your progress, and making sure things load correctly. Always on.
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-card px-4 py-3">
              <p className="text-sm font-bold text-foreground font-nunito">Analytics cookies</p>
              <p className="text-xs text-muted-foreground font-dm-sans mt-1">
                These help us understand how people use DOSE Academy so we can make it better. Totally optional — you can turn these off anytime from the cookie banner.
              </p>
            </div>
          </div>
        </Section>

        <Section
          icon={<Database size={18} className="text-primary" />}
          title="Where your data lives"
        >
          <ul className="space-y-2">
            <Li>Most of your data stays on your device in local storage — it never leaves your browser.</Li>
            <Li>Chat messages with Slick are stored in a secure cloud database so your conversation persists between visits.</Li>
            <Li>We do not sell, share, or give your data to third parties. Period.</Li>
            <Li>We do not use your data for advertising.</Li>
          </ul>
        </Section>

        <Section
          icon={<Shield size={18} className="text-primary" />}
          title="Teen safety"
        >
          <ul className="space-y-2">
            <Li>DOSE Academy is designed for ages 10–17. We follow strict principles to keep teen data safe.</Li>
            <Li>Squad Focus has zero chat or messaging — only silent co-presence and a single-word check-in.</Li>
            <Li>No real names or profile photos are ever displayed to other users.</Li>
            <Li>RSD session content is private. No parent, teacher, or counselor can see what you shared inside the tool.</Li>
          </ul>
        </Section>

        <Section
          icon={<Shield size={18} className="text-primary" />}
          title="Children's privacy (COPPA)"
        >
          <ul className="space-y-2">
            <Li>
              <strong>Under 13:</strong> Users under 13 cannot create an account. Age is verified before any personal information is collected. No email, name, or other PII is stored for users who indicate they are under 13.
            </Li>
            <Li>
              <strong>Ages 13-15:</strong> Users between 13 and 15 can create an account but require verifiable parental consent before accessing peer features (Study with a Friend). A parent or guardian must confirm consent via a unique email link.
            </Li>
            <Li>
              <strong>Ages 16+:</strong> Users 16 and older have full access to all features after age verification.
            </Li>
            <Li>
              <strong>Data minimization:</strong> After age verification, we store only the age bracket (under-13, 13-15, or 16+) — not the exact date of birth.
            </Li>
            <Li>
              <strong>What we collect from minors:</strong> Display name (shown as initials only to others), age bracket, session progress, and parent email (for 13-15 users with parental consent).
            </Li>
          </ul>
        </Section>

        <Section
          icon={<Shield size={18} className="text-primary" />}
          title="Parental rights"
        >
          <p className="text-sm text-muted-foreground font-dm-sans leading-relaxed mb-3">
            If your child is between 13 and 15, you have the following rights under COPPA:
          </p>
          <ul className="space-y-2">
            <Li><strong>Review:</strong> You can review the personal information we have collected about your child by visiting the Parent Dashboard link sent to you via email.</Li>
            <Li><strong>Revoke consent:</strong> You can revoke your consent at any time, which will remove your child's access to peer features.</Li>
            <Li><strong>Delete:</strong> You can request full deletion of your child's account and all associated data from the Parent Dashboard.</Li>
            <Li><strong>Refuse further collection:</strong> You can prevent any further collection of your child's information by revoking consent or deleting the account.</Li>
          </ul>
        </Section>

        <Section
          icon={<Eye size={18} className="text-primary" />}
          title="Your choices"
        >
          <ul className="space-y-2">
            <Li>
              <strong>Cookie preferences:</strong> You can change your cookie settings anytime by clearing your browser's local storage and refreshing the page — the cookie banner will reappear.
            </Li>
            <Li>
              <strong>Delete your data:</strong> Since most data is stored locally, clearing your browser data removes it. For chat data stored in our database, contact us and we'll delete it.
            </Li>
            <Li>
              <strong>Opt out of analytics:</strong> Choose "Save my choices" on the cookie banner with analytics toggled off.
            </Li>
          </ul>
        </Section>

        <Section
          icon={<Mail size={18} className="text-primary" />}
          title="Contact us"
        >
          <p className="text-sm text-muted-foreground font-dm-sans leading-relaxed">
            If you have questions about your privacy, want to request data deletion, or need to exercise your parental rights under COPPA, reach out:
          </p>
          <div className="mt-3 rounded-xl border border-white/10 bg-card px-4 py-3">
            <p className="text-sm font-bold text-foreground font-nunito">Odishon Corp (DBA DOSE)</p>
            <p className="text-xs text-muted-foreground font-dm-sans mt-1">
              Website: getdose.app
            </p>
            <p className="text-xs text-muted-foreground font-dm-sans mt-1">
              Email: privacy@getdose.app
            </p>
          </div>
        </Section>

        <p className="text-xs text-muted-foreground/60 font-dm-sans text-center pt-4">
          Built for DOSE Academy by Odishon Corp — the world's first crisis intervention platform for ADHD.
        </p>
      </div>

      <BottomNav />
    </div>
  );
};

const Section = ({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) => (
  <section>
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h2 className="text-base font-bold text-foreground font-nunito">{title}</h2>
    </div>
    {children}
  </section>
);

const Li = ({ children }: { children: React.ReactNode }) => (
  <li className="text-sm text-muted-foreground font-dm-sans leading-relaxed flex gap-2">
    <span className="text-primary mt-1 shrink-0">•</span>
    <span>{children}</span>
  </li>
);

export default PrivacyPolicy;
