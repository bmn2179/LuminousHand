/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { Menu, X } from 'lucide-react';
import {
  auth,
  db,
  handleFirestoreError,
  OperationType,
  signInWithGoogle,
  signOutUser,
} from './firebase';
import { buildDefaultVideoCatalog } from './data/curriculum';
import type {
  AgentRagFile,
  AppRoute,
  AslVideoEntry,
  LearningWorkflow,
  LessonCategory,
} from './types/luminous';
import { buildBaselineRagFiles } from './utils/ragTemplates';
import { loadAllVideoBlobUrls } from './utils/localVideoStore';
import { SunnyCharacter } from './components/Characters';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HomeAndDashboard } from './components/HomeAndDashboard';
import { LearningLabs } from './components/LearningLabs';
import { VideoStudioView } from './components/VideoStudioView';
import { SupervisorStudioView } from './components/SupervisorStudioView';
import { ProgressView } from './components/ProgressView';
import {
  AboutUsView,
  ContactSupportView,
  PlansAndPricingView,
  TermsAndConditionsView,
} from './components/InfoPages';

function sanitizeId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64) || 'item';
}

function LuminousHandApp() {
  const [route, setRoute] = useState<AppRoute>('home');
  const [labTab, setLabTab] = useState<LessonCategory>('alphabet');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authMessage, setAuthMessage] = useState('');

  // Core app state (persisted to Firestore when signed in, local state fallback when guest)
  const [learnerName, setLearnerName] = useState('Little Learner');
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'family' | 'classroom'>('free');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [workflows, setWorkflows] = useState<LearningWorkflow[]>([]);
  const [subAssignmentsCache, setSubAssignmentsCache] = useState<
    Record<string, LearningWorkflow['subAgentAssignments']>
  >({});
  const [cloudVideos, setCloudVideos] = useState<AslVideoEntry[]>([]);
  const [localPreviewMap, setLocalPreviewMap] = useState<Record<string, string>>({});
  const [ragFiles, setRagFiles] = useState<AgentRagFile[]>(() =>
    buildBaselineRagFiles('Little Learner', [], buildDefaultVideoCatalog())
  );

  const learnerSaveTimerRef = useRef<number | null>(null);

  // Load locally persisted recorded/uploaded ASL clips from IndexedDB (zero Cloud Billing)
  useEffect(() => {
    loadAllVideoBlobUrls().then((urls) => {
      if (Object.keys(urls).length > 0) {
        setLocalPreviewMap((prev) => ({ ...urls, ...prev }));
      }
    });
  }, []);

  // Merge default curriculum video slots + Firestore saved records + session webcam blob URLs
  const mergedVideos = useMemo<AslVideoEntry[]>(() => {
    const defaults = buildDefaultVideoCatalog();
    const byId = new Map<string, AslVideoEntry>();
    for (const def of defaults) {
      byId.set(def.id, {
        ...def,
        localPreviewUrl: localPreviewMap[def.id],
      });
    }
    for (const saved of cloudVideos) {
      byId.set(saved.id, {
        ...saved,
        localPreviewUrl: localPreviewMap[saved.id] || saved.localPreviewUrl,
      });
    }
    return Array.from(byId.values());
  }, [cloudVideos, localPreviewMap]);

  const mergedWorkflows = useMemo<LearningWorkflow[]>(() => {
    return workflows.map((wf) => ({
      ...wf,
      subAgentAssignments: wf.subAgentAssignments || subAssignmentsCache[wf.id],
    }));
  }, [workflows, subAssignmentsCache]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setAuthReady(true);

      if (!user) {
        return;
      }

      try {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);

        if (!snap.exists()) {
          const safeDisplay = (user.displayName || user.email || 'Parent').slice(0, 60);
          await setDoc(userRef, {
            uid: user.uid,
            displayName: safeDisplay,
            learnerName: 'Little Learner',
            role: 'parent',
            selectedPlan: 'free',
            soundEnabled: true,
            completedLessons: [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });

          // Seed baseline 5 RAG files for the new user
          const baselineRags = buildBaselineRagFiles(
            'Little Learner',
            [],
            buildDefaultVideoCatalog()
          );
          const batch = writeBatch(db);
          for (const rag of baselineRags) {
            const ragRef = doc(db, 'users', user.uid, 'ragFiles', rag.id);
            batch.set(ragRef, {
              id: rag.id,
              ownerId: user.uid,
              agentName: rag.agentName.slice(0, 80),
              agentRole: rag.agentRole,
              markdownContent: rag.markdownContent.slice(0, 20000),
              chunks: rag.chunks.slice(0, 30).map((c) => c.slice(0, 600)),
              version: 1,
              updatedAt: serverTimestamp(),
            });
          }
          await batch.commit();
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
      }
    });

    return () => unsubscribe();
  }, []);

  // Firestore real-time listeners (strictly gated on authReady && firebaseUser)
  useEffect(() => {
    if (!authReady || !firebaseUser) return;
    const uid = firebaseUser.uid;

    const unsubProfile = onSnapshot(
      doc(db, 'users', uid),
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        if (typeof data.learnerName === 'string') setLearnerName(data.learnerName);
        if (
          data.selectedPlan === 'free' ||
          data.selectedPlan === 'family' ||
          data.selectedPlan === 'classroom'
        ) {
          setSelectedPlan(data.selectedPlan);
        }
        if (typeof data.soundEnabled === 'boolean') setSoundEnabled(data.soundEnabled);
        if (Array.isArray(data.completedLessons)) {
          setCompletedLessons(
            data.completedLessons.filter((x: unknown): x is string => typeof x === 'string')
          );
        }
      },
      (err) => handleFirestoreError(err, OperationType.GET, `users/${uid}`)
    );

    const wfQuery = query(
      collection(db, 'users', uid, 'workflows'),
      where('ownerId', '==', uid)
    );
    const unsubWorkflows = onSnapshot(
      wfQuery,
      (snapshot) => {
        const rows: LearningWorkflow[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: String(data.id || d.id),
            title: String(data.title || 'Learning Workflow'),
            summary: String(data.summary || ''),
            focusArea: data.focusArea || 'alphabet',
            assignedAgent: String(data.assignedAgent || 'Sunny · Supervisor Agent'),
            nextLessons: Array.isArray(data.nextLessons) ? data.nextLessons.map(String) : [],
            status: data.status === 'completed' ? 'completed' : 'active',
          };
        });
        rows.sort((a, b) => b.id.localeCompare(a.id));
        setWorkflows(rows);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/workflows`)
    );

    const ragQuery = query(
      collection(db, 'users', uid, 'ragFiles'),
      where('ownerId', '==', uid)
    );
    const unsubRags = onSnapshot(
      ragQuery,
      (snapshot) => {
        if (snapshot.empty) return;
        const rows: AgentRagFile[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: String(data.id || d.id),
            agentName: String(data.agentName || d.id),
            agentRole: data.agentRole || 'supervisor',
            markdownContent: String(data.markdownContent || ''),
            chunks: Array.isArray(data.chunks) ? data.chunks.map(String) : [],
            version: typeof data.version === 'number' ? data.version : 1,
          };
        });
        const order = [
          'supervisor-rag',
          'alphabet-agent-rag',
          'numbers-agent-rag',
          'colors-agent-rag',
          'video-studio-agent-rag',
        ];
        rows.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
        setRagFiles(rows);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/ragFiles`)
    );

    const vidQuery = query(
      collection(db, 'users', uid, 'aslVideos'),
      where('ownerId', '==', uid)
    );
    const unsubVideos = onSnapshot(
      vidQuery,
      (snapshot) => {
        const rows: AslVideoEntry[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: String(data.id || d.id),
            lessonId: String(data.lessonId || d.id),
            category: data.category || 'alphabet',
            label: String(data.label || d.id),
            videoUrl: String(data.videoUrl || ''),
            signerName: String(data.signerName || ''),
            signerType: data.signerType || 'kid',
            verified: Boolean(data.verified),
          };
        });
        setCloudVideos(rows);
      },
      (err) => handleFirestoreError(err, OperationType.LIST, `users/${uid}/aslVideos`)
    );

    return () => {
      unsubProfile();
      unsubWorkflows();
      unsubRags();
      unsubVideos();
    };
  }, [authReady, firebaseUser]);

  const navigate = (nextRoute: AppRoute) => {
    if (nextRoute === 'alphabet' || nextRoute === 'numbers' || nextRoute === 'colors') {
      setLabTab(nextRoute);
      setRoute('labs');
    } else {
      setRoute(nextRoute);
    }
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSignIn = async () => {
    setAuthMessage('');
    try {
      await signInWithGoogle();
    } catch (err) {
      setAuthMessage(
        err instanceof Error ? err.message : 'Unable to complete Google Sign-In.'
      );
    }
  };

  const handleSignOut = async () => {
    setAuthMessage('');
    try {
      await signOutUser();
    } catch (err) {
      setAuthMessage(err instanceof Error ? err.message : 'Unable to sign out.');
    }
  };

  const handleLearnerNameChange = (nextName: string) => {
    const clean = nextName.slice(0, 35);
    setLearnerName(clean);
    if (!firebaseUser) return;

    if (learnerSaveTimerRef.current) {
      window.clearTimeout(learnerSaveTimerRef.current);
    }
    learnerSaveTimerRef.current = window.setTimeout(async () => {
      try {
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
          learnerName: clean,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`);
      }
    }, 500);
  };

  const handleToggleSound = async () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (!firebaseUser) return;
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        soundEnabled: next,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`);
    }
  };

  const handleSelectPlan = async (plan: 'free' | 'family' | 'classroom') => {
    setSelectedPlan(plan);
    if (!firebaseUser) return;
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        selectedPlan: plan,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`);
    }
  };

  const handleToggleLessonComplete = async (lessonId: string) => {
    const next = completedLessons.includes(lessonId)
      ? completedLessons.filter((id) => id !== lessonId)
      : [...completedLessons, lessonId].slice(0, 60);

    setCompletedLessons(next);
    if (!firebaseUser) {
      setRagFiles(buildBaselineRagFiles(learnerName, next, mergedVideos));
      return;
    }

    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        completedLessons: next,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`);
    }
  };

  const handleResetProgress = async () => {
    setCompletedLessons([]);
    if (!firebaseUser) {
      setRagFiles(buildBaselineRagFiles(learnerName, [], mergedVideos));
      return;
    }
    try {
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        completedLessons: [],
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`);
    }
  };

  const handleSaveVideo = async (entry: AslVideoEntry) => {
    if (entry.localPreviewUrl) {
      setLocalPreviewMap((prev) => ({ ...prev, [entry.id]: entry.localPreviewUrl! }));
    }

    if (!firebaseUser) {
      setCloudVideos((prev) => {
        const filtered = prev.filter((v) => v.id !== entry.id);
        return [...filtered, entry];
      });
      return;
    }

    const safeId = sanitizeId(entry.id);
    const path = `users/${firebaseUser.uid}/aslVideos/${safeId}`;
    try {
      await setDoc(doc(db, 'users', firebaseUser.uid, 'aslVideos', safeId), {
        id: safeId,
        ownerId: firebaseUser.uid,
        lessonId: entry.lessonId.slice(0, 40),
        category: entry.category,
        label: entry.label.slice(0, 40),
        videoUrl: entry.videoUrl.slice(0, 500),
        signerName: entry.signerName.slice(0, 60),
        signerType: entry.signerType,
        verified: Boolean(entry.verified),
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  };

  const handleSaveGeneratedState = async (
    workflow: LearningWorkflow,
    updatedRags: AgentRagFile[]
  ) => {
    if (workflow.subAgentAssignments) {
      setSubAssignmentsCache((prev) => ({
        ...prev,
        [workflow.id]: workflow.subAgentAssignments,
      }));
    }

    if (!firebaseUser) {
      setWorkflows((prev) => [workflow, ...prev]);
      setRagFiles(updatedRags);
      return;
    }

    const uid = firebaseUser.uid;
    const safeWfId = sanitizeId(workflow.id);
    try {
      const batch = writeBatch(db);
      const wfRef = doc(db, 'users', uid, 'workflows', safeWfId);
      batch.set(wfRef, {
        id: safeWfId,
        ownerId: uid,
        title: workflow.title.slice(0, 120),
        summary: workflow.summary.slice(0, 1500),
        focusArea: workflow.focusArea,
        assignedAgent: workflow.assignedAgent.slice(0, 80),
        nextLessons: workflow.nextLessons.slice(0, 12).map((s) => s.slice(0, 60)),
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      for (const rag of updatedRags) {
        const safeRagId = sanitizeId(rag.id);
        const ragRef = doc(db, 'users', uid, 'ragFiles', safeRagId);
        batch.set(ragRef, {
          id: safeRagId,
          ownerId: uid,
          agentName: rag.agentName.slice(0, 80),
          agentRole: rag.agentRole,
          markdownContent: rag.markdownContent.slice(0, 20000),
          chunks: rag.chunks.slice(0, 30).map((c) => c.slice(0, 600)),
          version: Math.max(1, Math.floor(rag.version || 1)),
          updatedAt: serverTimestamp(),
        });
      }

      await batch.commit();
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${uid}/workflows/${safeWfId}`);
    }
  };

  const handleCompleteWorkflow = async (workflowId: string) => {
    const existing = workflows.find((w) => w.id === workflowId);
    if (existing?.status === 'completed') return;

    if (!firebaseUser) {
      setWorkflows((prev) =>
        prev.map((w) => (w.id === workflowId ? { ...w, status: 'completed' } : w))
      );
      return;
    }

    const uid = firebaseUser.uid;
    try {
      await updateDoc(doc(db, 'users', uid, 'workflows', workflowId), {
        status: 'completed',
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${uid}/workflows/${workflowId}`);
    }
  };

  const navItems: { label: string; route: AppRoute; isActive: boolean }[] = [
    { label: 'Home', route: 'home', isActive: route === 'home' },
    { label: 'Learning Labs', route: 'labs', isActive: route === 'labs' },
    { label: 'Video Studio', route: 'video-studio', isActive: route === 'video-studio' },
    { label: 'AI Supervisor', route: 'supervisor', isActive: route === 'supervisor' },
    { label: 'My Progress', route: 'progress', isActive: route === 'progress' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFAF0] text-[#24334F]">
      {/* Strict 3-Zone Header */}
      <header className="sticky top-0 z-40 border-b-2 border-[#EFE5D1] bg-[#FFFAF0]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          {/* Zone 1: Brand */}
          <button
            type="button"
            onClick={() => navigate('home')}
            className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 cursor-pointer"
          >
            <SunnyCharacter className="w-9 h-9 shrink-0" />
            <span className="font-extrabold text-xl tracking-tight text-[#24334F]">
              Luminous Hand
            </span>
          </button>

          {/* Zone 2: Primary Navigation (max 5 concise links) */}
          <nav className="hidden lg:flex items-center gap-1.5" aria-label="Primary Navigation">
            {navItems.map((item) => (
              <button
                key={item.route}
                type="button"
                onClick={() => navigate(item.route)}
                className={`rounded-xl px-3.5 py-2 text-sm font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  item.isActive
                    ? 'bg-[#078F89] text-white'
                    : 'text-[#24334F] hover:bg-[#FFF0D1]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Account CTA */}
          <div className="flex items-center gap-2 shrink-0">
            {firebaseUser ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-xl border-2 border-[#DCE5F2] bg-white px-4 py-2 text-sm font-bold text-[#24334F] hover:bg-[#F3F7FD] whitespace-nowrap shrink-0 cursor-pointer"
              >
                Sign Out
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSignIn}
                className="rounded-xl bg-[#FF9800] px-4 py-2 text-sm font-extrabold text-white hover:bg-[#E78900] whitespace-nowrap shrink-0 cursor-pointer"
              >
                Sign In
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileNavOpen((o) => !o)}
              aria-label="Toggle navigation menu"
              className="lg:hidden rounded-xl border-2 border-[#DCE5F2] bg-white p-2 text-[#24334F] cursor-pointer"
            >
              {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileNavOpen && (
          <nav
            className="lg:hidden border-t border-[#EFE5D1] bg-white px-4 py-3 flex flex-col gap-1.5"
            aria-label="Mobile Navigation"
          >
            {navItems.map((item) => (
              <button
                key={item.route}
                type="button"
                onClick={() => navigate(item.route)}
                className={`rounded-xl px-4 py-2.5 text-left text-sm font-bold cursor-pointer ${
                  item.isActive
                    ? 'bg-[#078F89] text-white'
                    : 'text-[#24334F] hover:bg-[#FFF5DF]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        )}

        {authMessage && (
          <div className="bg-[#FFF2F2] border-t border-[#F5B5B5] px-4 py-2 text-center text-xs font-bold text-[#B3261E]">
            {authMessage}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {route === 'home' && (
          <HomeAndDashboard
            learnerName={learnerName}
            onLearnerNameChange={handleLearnerNameChange}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            completedLessons={completedLessons}
            videos={mergedVideos}
            activeWorkflow={mergedWorkflows[0]}
            isSignedIn={Boolean(firebaseUser)}
            onSignIn={handleSignIn}
            onNavigate={navigate}
          />
        )}

        {route === 'labs' && (
          <LearningLabs
            initialTab={labTab}
            onTabChange={setLabTab}
            completedLessons={completedLessons}
            onToggleComplete={handleToggleLessonComplete}
            videos={mergedVideos}
            soundEnabled={soundEnabled}
            onNavigate={navigate}
          />
        )}

        {route === 'video-studio' && (
          <VideoStudioView videos={mergedVideos} onSaveVideo={handleSaveVideo} />
        )}

        {route === 'supervisor' && (
          <SupervisorStudioView
            learnerName={learnerName}
            completedLessons={completedLessons}
            videos={mergedVideos}
            workflows={mergedWorkflows}
            ragFiles={ragFiles}
            onSaveGeneratedState={handleSaveGeneratedState}
            onCompleteWorkflow={handleCompleteWorkflow}
            onNavigate={navigate}
          />
        )}

        {route === 'progress' && (
          <ProgressView
            learnerName={learnerName}
            completedLessons={completedLessons}
            videos={mergedVideos}
            workflows={mergedWorkflows}
            onToggleLesson={handleToggleLessonComplete}
            onResetProgress={handleResetProgress}
          />
        )}

        {route === 'pricing' && (
          <PlansAndPricingView
            selectedPlan={selectedPlan}
            onSelectPlan={handleSelectPlan}
          />
        )}

        {route === 'about' && <AboutUsView />}

        {route === 'contact' && (
          <ContactSupportView
            userUid={firebaseUser?.uid || null}
            defaultName={firebaseUser?.displayName || ''}
            defaultEmail={firebaseUser?.email || ''}
            onSignIn={handleSignIn}
          />
        )}

        {route === 'terms' && <TermsAndConditionsView />}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[#EFE5D1] bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="text-center sm:text-left">
            <p className="font-extrabold text-[#24334F]">Luminous Hand</p>
            <p className="text-xs text-[#51617B]">
              Early-childhood ASL &amp; tracing platform · Web, Google Play &amp; Apple App Store
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 font-bold text-[#078F89]">
            <button
              type="button"
              onClick={() => navigate('pricing')}
              className="hover:underline cursor-pointer"
            >
              Plans &amp; Pricing
            </button>
            <button
              type="button"
              onClick={() => navigate('about')}
              className="hover:underline cursor-pointer"
            >
              About Us
            </button>
            <button
              type="button"
              onClick={() => navigate('contact')}
              className="hover:underline cursor-pointer"
            >
              Customer Support
            </button>
            <button
              type="button"
              onClick={() => navigate('terms')}
              className="hover:underline cursor-pointer"
            >
              Terms &amp; Conditions
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <LuminousHandApp />
    </ErrorBoundary>
  );
}
