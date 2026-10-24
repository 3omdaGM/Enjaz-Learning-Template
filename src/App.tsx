import { Component, lazy } from 'react';
import type { ReactNode } from 'react';
import { Route, Routes } from 'react-router';
import AppShell, { BrandHeader } from './components/AppShell';
import { Button } from './components/ui';
import TrainingProvider from './state/TrainingProvider';
import { CourseProvider } from './course/Provider';

const HomePage = lazy(() => import('./pages/HomePage'));
const ContentPage = lazy(() => import('./course/ContentPage'));
const CourseWorkspacePage = lazy(() => import('./course/WorkspacePage'));
const CourseExamPage = lazy(() => import('./course/ExamPage'));
const StylePage = lazy(() => import('./course/StylePage'));
const UtilityPages = lazy(() => import('./pages/UtilityPages'));
const NotFoundPage = lazy(() => import('./pages/UtilityPages').then(module => ({ default: module.NotFound })));
const AccountPage = lazy(() => import('./pages/AccountPage'));
// Keep the compile-time condition at the import site so Vite omits its chunk.
const DemoToolsPage = __DEMO_TOOLS_ENABLED__ ? lazy(() => import('./course/DemoTools')) : null;

class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <><header className="site-header"><BrandHeader /></header><main className="container not-found"><h1>تعذر عرض الصفحة</h1><p>أعد تحميل الصفحة للمحاولة مجددًا، دون حذف الحالة المحلية.</p><Button onClick={() => window.location.reload()}>إعادة المحاولة</Button></main></>;
    return this.props.children;
  }
}

export default function App() {
  return <AppErrorBoundary><TrainingProvider><CourseProvider><Routes><Route element={<AppShell />}>
    <Route path="course/modules/:moduleId" element={<CourseWorkspacePage />} /><Route path="course/modules/:moduleId/lessons/:lessonId/:section" element={<CourseWorkspacePage />} /><Route path="learning-style" element={<StylePage />} /><Route index element={<HomePage />} /><Route path="content" element={<ContentPage />} />
    <Route path="goals" element={<UtilityPages />} /><Route path="goals/:moduleId" element={<UtilityPages />} /><Route path="guide" element={<UtilityPages />} /><Route path="contact" element={<UtilityPages />} />
    <Route path="login" element={<AccountPage />} /><Route path="register" element={<AccountPage />} /><Route path="recover" element={<AccountPage />} />
    <Route path="assessment/:kind/instructions" element={<CourseExamPage />} /><Route path="assessment/:kind/attempt/:attemptId" element={<CourseExamPage />} /><Route path="assessment/:kind/attempt/:attemptId/:stage" element={<CourseExamPage />} />
    {DemoToolsPage && <Route path="demo-tools" element={<DemoToolsPage />} />}
    <Route path="*" element={<NotFoundPage />} />
  </Route></Routes></CourseProvider></TrainingProvider></AppErrorBoundary>;
}
