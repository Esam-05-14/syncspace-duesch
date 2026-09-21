import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Layout } from "../components/Layout.js";
import { BoardChrome } from "../features/boards/BoardChrome.js";
import { BoardPage } from "../features/boards/BoardPage.js";
import { HomePage } from "../features/home/HomePage.js";
import { PracticePage } from "../features/practice/PracticePage.js";
import { ReviewPage } from "../features/review/ReviewPage.js";
import { SettingsPage } from "../features/settings/SettingsPage.js";
import { SyncPage } from "../features/sync-inspector/SyncPage.js";
import { VocabularyPage } from "../features/vocabulary/VocabularyPage.js";
import { LearnChrome } from "../features/learn/LearnChrome.js";
import { AlphabetPage } from "../features/learn/pages/AlphabetPage.js";
import { BuilderPage } from "../features/learn/pages/BuilderPage.js";
import { GrammarPage } from "../features/learn/pages/GrammarPage.js";
import { MapperPage } from "../features/learn/pages/MapperPage.js";
import { PhrasesPage } from "../features/learn/pages/PhrasesPage.js";
import { RoadmapPage } from "../features/learn/pages/RoadmapPage.js";
import { SoundsPage } from "../features/learn/pages/SoundsPage.js";
import { SourcesPage } from "../features/learn/pages/SourcesPage.js";
import { WordsPage } from "../features/learn/pages/WordsPage.js";

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/learn" element={<LearnChrome />}>
            <Route index element={<RoadmapPage />} />
            <Route path="alphabet" element={<AlphabetPage />} />
            <Route path="sounds" element={<SoundsPage />} />
            <Route path="words" element={<WordsPage />} />
            <Route path="phrases" element={<PhrasesPage />} />
            <Route path="grammar" element={<GrammarPage />} />
            <Route path="mapper" element={<MapperPage />} />
            <Route path="builder" element={<BuilderPage />} />
            <Route path="sources" element={<SourcesPage />} />
          </Route>
          <Route path="/review" element={<ReviewPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/sync/:id" element={<SyncPage />} />
          <Route path="/board/:id" element={<BoardChrome />}>
            <Route index element={<BoardPage />} />
            <Route path="vocabulary" element={<VocabularyPage />} />
            <Route path="practice" element={<PracticePage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
