import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Articles from './pages/Articles';
import ArticleReader from './pages/ArticleReader';
import About from './pages/About';
import Authors from './pages/Authors';
import SubjectCategoryHub from './pages/subjects/SubjectCategoryHub';
import { AuthProvider } from './components/AuthProvider';
import Login from './pages/Login';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Editor from './pages/admin/Editor';
import TranslationHelper from './pages/admin/TranslationHelper';

// New Bank/Level Restructuring
import SyllabusSelector from './pages/SyllabusSelector';
import SyllabusReader from './pages/SyllabusReader';
import OldQuestionsSelector from './pages/OldQuestionsSelector';
import OldQuestionsArchive from './pages/OldQuestionsArchive';
import OldQuestionsReader from './pages/OldQuestionsReader';
import SolutionsSelector from './pages/SolutionsSelector';
import MaterialsHub from './pages/MaterialsHub';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Website */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="articles" element={<Articles />} />
            <Route path="authors" element={<Authors />} />
            <Route path="about" element={<About />} />
            <Route path="subjects/:category" element={<SubjectCategoryHub />} />
            
            {/* New Taxonomy Selectors */}
            <Route path="syllabus" element={<SyllabusSelector />} />
            <Route path="old-questions" element={<OldQuestionsSelector />} />
            <Route path="solutions" element={<SolutionsSelector />} />
            <Route path="materials" element={<MaterialsHub />} />
          </Route>
          
          <Route path="articles/:id" element={<ArticleReader />} />
          
          {/* Readers & Archives */}
          <Route path="syllabus/:bank/:level/view" element={<SyllabusReader />} />
          <Route path="old-questions/:bank/:level" element={<OldQuestionsArchive />} />
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
      </Router>
    </AuthProvider>
  );
};

export default App;

