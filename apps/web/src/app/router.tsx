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

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
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
