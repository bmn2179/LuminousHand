import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { Check, Heart, Mail, ShieldCheck, Smartphone } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { SunnyCharacter } from './Characters';

interface PlansAndPricingProps {
  selectedPlan: 'free' | 'family' | 'classroom';
  onSelectPlan: (plan: 'free' | 'family' | 'classroom') => void;
}

export const PlansAndPricingView: React.FC<PlansAndPricingProps> = ({
  selectedPlan,
  onSelectPlan,
}) => {
  const [notice, setNotice] = useState('');

  const plans: {
    id: 'free' | 'family' | 'classroom';
    title: string;
    price: string;
    period: string;
    badge: string;
    features: string[];
  }[] = [
    {
      id: 'free',
      title: 'Free Explorer',
      price: '$0',
      period: 'forever',
      badge: 'Web, Google Play & App Store Starter',
      features: [
        'Alphabet A–Z dotted tracing canvas',
        'Verified ASL videos for A–E + ASL cues for all 46 signs',
        'Numbers 1–10 counting stars & Color Lab',
        '1 Baseline Supervisor RAG workflow',
      ],
    },
    {
      id: 'family',
      title: 'Family Pass',
      price: '$7.99',
      period: 'per month',
      badge: 'Best for Home Learners (Ages 5–8)',
      features: [
        'Full kid-signed A–Z, 1–10 & Colors ASL video catalog',
        'Unlimited AI Supervisor subsequent workflows & 5 RAG exports',
        'Cross-device Google Sign-In cloud sync (Web, Android, iOS)',
        'Kid ASL Video Studio webcam recording & backup',
      ],
    },
    {
      id: 'classroom',
      title: 'Classroom Annual',
      price: '$49',
      period: 'per year',
      badge: 'Educators & Early Learning Programs',
      features: [
        'Full access across Web, Google Play & Apple App Store',
        'Custom educator RAG files & Deaf mentor verification checklists',
        'Guided tracing + ASL video studio for classroom signers',
        'Priority family & educator support',
      ],
    },
  ];

  const handleChoose = (planId: 'free' | 'family' | 'classroom', label: string) => {
    onSelectPlan(planId);
    setNotice(
      `Saved "${label}" on your Luminous Hand profile. Store billing will connect at Google Play and Apple App Store launch.`
    );
  };

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] border-2 border-[#FFE3AA] bg-gradient-to-br from-[#FFF4D6] to-[#EAF8F6] p-6 sm:p-8 text-center space-y-3">
        <p className="text-xs font-extrabold uppercase tracking-wider text-[#078F89]">
          Available on Web, Google Play &amp; Apple App Store
        </p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#24334F]">
          Simple Plans for Families &amp; Classrooms
        </h1>
        <p className="text-sm sm:text-base text-[#51617B] max-w-2xl mx-auto">
          Start free right away or choose a Family or Classroom pass for cross-platform cloud sync,
          unlimited AI Supervisor RAG workflows, and full kid-signed ASL libraries.
        </p>
      </section>

      {notice && (
        <div className="rounded-2xl border-2 border-[#B3E4DE] bg-[#E8F8F5] px-5 py-3.5 text-sm font-bold text-[#078F89]">
          {notice}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = selectedPlan === plan.id;
          return (
            <div
              key={plan.id}
              className={`rounded-3xl border-2 p-6 bg-white shadow-sm flex flex-col justify-between space-y-6 ${
                isCurrent ? 'border-[#078F89]' : 'border-[#E3EAF4]'
              }`}
            >
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wider text-[#B86E00]">
                    {plan.badge}
                  </p>
                  <h2 className="text-2xl font-extrabold text-[#24334F] mt-1">{plan.title}</h2>
                  <p className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-4xl font-extrabold text-[#24334F] tabular-nums">
                      {plan.price}
                    </span>
                    <span className="text-sm font-semibold text-[#51617B]">/ {plan.period}</span>
                  </p>
                </div>

                <ul className="space-y-2.5 text-sm text-[#43536F]">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#078F89] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => handleChoose(plan.id, plan.title)}
                className={`w-full rounded-xl px-4 py-3 text-sm font-extrabold transition-colors cursor-pointer ${
                  isCurrent
                    ? 'bg-[#078F89] text-white'
                    : 'bg-[#24334F] text-white hover:bg-[#19243A]'
                }`}
              >
                {isCurrent ? 'Selected Plan' : `Select ${plan.title}`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const AboutUsView: React.FC = () => (
  <div className="space-y-8">
    <section className="rounded-[28px] border-2 border-[#FFE3AA] bg-gradient-to-br from-[#FFF4D6] via-[#FFFAF0] to-[#EAF8F6] p-6 sm:p-10 shadow-sm">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <SunnyCharacter className="w-24 h-24 shrink-0" />
        <div className="space-y-2">
          <p className="text-xs font-extrabold uppercase tracking-wider text-[#078F89]">
            Our Founding Story
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#24334F]">
            Built with love for inclusive early childhood learning
          </h1>
          <p className="text-base text-[#43536F] leading-relaxed">
            Luminous Hand began with a grandmother’s dream to give young Deaf, hard-of-hearing, and
            hearing children ages 5–8 a warm, joyful place to trace their ABCs and numbers while
            seeing real kids sign American Sign Language.
          </p>
        </div>
      </div>
    </section>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="rounded-3xl border-2 border-[#E3EAF4] bg-white p-6 space-y-2 shadow-sm">
        <Heart className="w-7 h-7 text-[#FF9800]" />
        <h2 className="text-xl font-extrabold text-[#24334F]">Kid-Centered Design</h2>
        <p className="text-sm text-[#51617B] leading-relaxed">
          Large touch targets, cheerful characters, gentle spoken prompts, and vibrant high-contrast
          colors welcome young fingers on tablets, phones, and Chromebooks.
        </p>
      </div>
      <div className="rounded-3xl border-2 border-[#E3EAF4] bg-white p-6 space-y-2 shadow-sm">
        <ShieldCheck className="w-7 h-7 text-[#078F89]" />
        <h2 className="text-xl font-extrabold text-[#24334F]">Verified ASL Respect</h2>
        <p className="text-sm text-[#51617B] leading-relaxed">
          Every kid-signed ASL video slot tracks signer role and Deaf-mentor verification so
          families and classrooms practice authentic handshapes.
        </p>
      </div>
      <div className="rounded-3xl border-2 border-[#E3EAF4] bg-white p-6 space-y-2 shadow-sm">
        <Smartphone className="w-7 h-7 text-[#438CE4]" />
        <h2 className="text-xl font-extrabold text-[#24334F]">Web, Google &amp; Apple</h2>
        <p className="text-sm text-[#51617B] leading-relaxed">
          Unified progress and AI Supervisor RAG workflows travel seamlessly from classroom laptops
          to Android and iOS family tablets.
        </p>
      </div>
    </div>
  </div>
);

interface ContactSupportViewProps {
  userUid: string | null;
  defaultName: string;
  defaultEmail: string;
  onSignIn: () => void;
}

export const ContactSupportView: React.FC<ContactSupportViewProps> = ({
  userUid,
  defaultName,
  defaultEmail,
  onSignIn,
}) => {
  const [name, setName] = useState(defaultName);
  const [email, setEmail] = useState(defaultEmail);
  const [topic, setTopic] = useState('ASL Video Feedback');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedMsg, setSubmittedMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmittedMsg('');

    if (!userUid) {
      setErrorMsg('Please sign in with Google first to submit a support request.');
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'supportTickets'), {
        ownerId: userUid,
        name: name.trim().slice(0, 100),
        email: email.trim().slice(0, 180),
        topic,
        subject: subject.trim().slice(0, 140),
        message: message.trim().slice(0, 4000),
        status: 'open',
        createdAt: serverTimestamp(),
      });
      setSubject('');
      setMessage('');
      setSubmittedMsg(
        'Thank you! Your support note has been saved. Our team replies within 24–48 business hours.'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'supportTickets');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <section className="rounded-3xl border-2 border-[#E3EAF4] bg-white p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#EDFBF9] border border-[#B3E4DE] flex items-center justify-center text-[#078F89]">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#24334F]">
              Customer Support
            </h1>
            <p className="text-sm text-[#51617B]">
              Questions about ASL videos, Google Play / Apple App Store rollout, or family accounts?
              Responses arrive within 24–48 business hours.
            </p>
          </div>
        </div>

        {!userUid && (
          <div className="rounded-2xl border border-[#FFD98A] bg-[#FFF8E6] p-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs font-bold text-[#9A5E00]">
              Sign in with Google so we can tie your support request safely to your account.
            </p>
            <button
              type="button"
              onClick={onSignIn}
              className="rounded-xl bg-[#438CE4] px-4 py-2 text-xs font-bold text-white cursor-pointer"
            >
              Sign In with Google
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1">
              <span className="text-xs font-bold text-[#51617B]">Your Name</span>
              <input
                type="text"
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border-2 border-[#DCE5F2] bg-[#FFFAF0] px-3.5 py-2.5 text-sm font-semibold text-[#24334F]"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs font-bold text-[#51617B]">Email Address</span>
              <input
                type="email"
                required
                maxLength={180}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border-2 border-[#DCE5F2] bg-[#FFFAF0] px-3.5 py-2.5 text-sm font-semibold text-[#24334F]"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1">
              <span className="text-xs font-bold text-[#51617B]">Topic</span>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full rounded-xl border-2 border-[#DCE5F2] bg-[#FFFAF0] px-3.5 py-2.5 text-sm font-semibold text-[#24334F]"
              >
                <option>ASL Video Feedback</option>
                <option>Account &amp; Sync Help</option>
                <option>School &amp; Classroom Inquiry</option>
                <option>Google Play / Apple App Store</option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-xs font-bold text-[#51617B]">Subject</span>
              <input
                type="text"
                required
                maxLength={140}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="How can we help?"
                className="w-full rounded-xl border-2 border-[#DCE5F2] bg-[#FFFAF0] px-3.5 py-2.5 text-sm font-semibold text-[#24334F]"
              />
            </label>
          </div>

          <label className="block space-y-1">
            <span className="text-xs font-bold text-[#51617B]">Message</span>
            <textarea
              required
              rows={4}
              maxLength={4000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share details..."
              className="w-full rounded-xl border-2 border-[#DCE5F2] bg-[#FFFAF0] p-3.5 text-sm font-medium text-[#24334F]"
            />
          </label>

          {errorMsg && (
            <p className="text-xs font-bold text-[#B3261E]">{errorMsg}</p>
          )}
          {submittedMsg && (
            <p className="text-xs font-bold text-[#078F89]">{submittedMsg}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-[#078F89] px-6 py-3 text-sm font-extrabold text-white hover:bg-[#067873] disabled:opacity-60 cursor-pointer"
          >
            {submitting ? 'Sending...' : 'Send Support Request'}
          </button>
        </form>
      </section>
    </div>
  );
};

export const TermsAndConditionsView: React.FC = () => {
  const sections = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      body: 'By using Luminous Hand across Web, Google Play, or Apple App Store, parents, guardians, and educators agree to these family-first terms on behalf of their household or classroom.',
    },
    {
      id: 'child-safety',
      title: '2. Child Safety & Caregiver Involvement (COPPA)',
      body: 'Luminous Hand is designed for ages 5–8 with parent or teacher supervision. Sign-in accounts, cloud sync, AI workflow generation, and customer support submissions are managed by verified adults.',
    },
    {
      id: 'asl-videos',
      title: '3. Kid-Signed ASL Video Guidelines',
      body: 'Videos recorded or linked in the Video Studio belong to the creator’s workspace unless explicitly published for classroom distribution, and require guardian consent whenever filming minors.',
    },
    {
      id: 'ai-supervisor',
      title: '4. AI Supervisor & RAG Knowledge Files',
      body: 'The AI Supervisor generates educational pacing suggestions and structured RAG files tailored to A–Z, 1–10, and Colors progress. Educators and parents remain the final guides for each child.',
    },
    {
      id: 'subscriptions',
      title: '5. Store Subscriptions & Plans',
      body: 'Free Explorer remains $0. Paid Family and Classroom tiers will follow Google Play and Apple App Store billing rules when store listings are activated.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto rounded-3xl border-2 border-[#E3EAF4] bg-white p-6 sm:p-10 shadow-sm space-y-6">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-wider text-[#078F89]">
          Luminous Hand Legal &amp; Safety
        </p>
        <h1 className="text-3xl font-extrabold text-[#24334F] mt-1">
          Terms &amp; Conditions
        </h1>
      </div>

      <div className="space-y-5">
        {sections.map((sec) => (
          <section key={sec.id} className="space-y-1.5 border-b border-[#EDF1F8] pb-4 last:border-none">
            <h2 className="text-lg font-extrabold text-[#24334F]">{sec.title}</h2>
            <p className="text-sm text-[#43536F] leading-relaxed">{sec.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
};
