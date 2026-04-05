import React, { Suspense, lazy } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { AuthProvider } from './components/AuthProvider';

// Lazy load all page components for better performance
const Home = lazy(() => import('./pages/Home'));
const Articles = lazy(() => import('./pages/Articles'));
const ArticleReader = lazy(() => import('./pages/ArticleReader'));
const About = lazy(() => import('./pages/About'));
const Authors = lazy(() => import('./pages/Authors'));
const SubjectCategoryHub = lazy(() => import('./pages/subjects/SubjectCategoryHub'));
const Login = lazy(() => import('./pages/Login'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const Dashboard = lazy(() => import('./pages/admin/Dashboard'));
const Editor = lazy(() => import('./pages/admin/Editor'));
const TranslationHelper = lazy(() => import('./pages/admin/TranslationHelper'));

// New Bank/Level Restructuring
const SyllabusSelector = lazy(() => import('./pages/SyllabusSelector'));
const SyllabusReader = lazy(() => import('./pages/SyllabusReader'));
const OldQuestionsSelector = lazy(() => import('./pages/OldQuestionsSelector'));
const OldQuestionsArchive = lazy(() => import('./pages/OldQuestionsArchive'));
const OldQuestionsReader = lazy(() => import('./pages/OldQuestionsReader'));
const SolutionsSelector = lazy(() => import('./pages/SolutionsSelector'));
const SolutionsArchive = lazy(() => import('./pages/SolutionsArchive'));
const MaterialsHub = lazy(() => import('./pages/MaterialsHub'));

// Simple loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
    <div className="w-12 h-12 border-4 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
  </div>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Website */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="articles" element={<Articles />} />
              <Route path="authors" element={<Authors />} />
              <Route path="about" element={<About />} />
              <Route path="subjects/:category" element={<SubjectCategoryHub />} />
              
              {/* New Taxonomy Selectors */}
              <Route path="syllabus/:bank?" element={<SyllabusSelector />} />
              <Route path="old-questions/:bank?" element={<OldQuestionsSelector />} />
              <Route path="solutions/:bank?" element={<SolutionsSelector />} />
              <Route path="materials" element={<MaterialsHub />} />
            </Route>
            
            <Route path="articles/:id" element={<ArticleReader />} />
            
            {/* Readers & Archives */}
            <Route path="syllabus/:bank/:level/view" element={<SyllabusReader />} />
            <Route path="old-questions/:bank/:level" element={<OldQuestionsArchive />} />
            <Route path="solutions/:bank/:level" element={<SolutionsArchive />} />
            <Route path="old-questions/:bank/:level/:id/view" element={<OldQuestionsReader />} />
            
            {/* Login */}
            <Route path="login" element={<Login />} />

            {/* Legacy Redirects for old bookmarks/cache */}
            <Route path="subjects/:category/syllabus/view" element={<SyllabusSelector />} />
            <Route path="subjects/:category/old-questions" element={<OldQuestionsSelector />} />
            <Route path="subjects/:category/old-solutions" element={<SolutionsSelector />} />

            {/* Protected Admin routes */}
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="editor" element={<Editor />} />
              <Route path="translation-helper" element={<TranslationHelper />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
};

export default App;

