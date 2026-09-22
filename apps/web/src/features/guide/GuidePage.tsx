import { Link } from "react-router-dom";

export function GuidePage() {
  return (
    <main className="page guide">
      <h1>How to use SyncSpace Deutsch</h1>
      <p className="lede">
        This is a small study workspace for German. You learn on this device. Ratings stay in this
        browser profile. A friend can sit with you on a shared board if the sync process is running
        on this computer. It is ordinary software, not a tutor and not an exam.
      </p>

      <section>
        <h2>The simple daily loop</h2>
        <p>
          Do a little, then come back. That is the whole method. One sitting can look like this:
        </p>
        <ol>
          <li>
            Open <Link to="/learn">Lessons</Link> and take the next station on the roadmap. Tick it
            when you have actually worked through it. A tick is a private note in this profile. It
            is not a certificate and not “you are now B1”.
          </li>
          <li>
            When a word feels useful, add it to private review from Inquire, the cover drill, or a
            lecture note.
          </li>
          <li>
            Next time you sit down, start on the home page. If Review shows a number, clear those
            cards first. Then continue the last lesson.
          </li>
        </ol>
        <p>
          Short and regular beats a long cram. Ten focused minutes with articles and sound is worth
          more than an hour of scrolling lists.
        </p>
      </section>

      <section>
        <h2>Learn from the start</h2>
        <p>
          The path is alphabet → sounds → words → phrases → grammar. English explanations sit next
          to the German. Starter material is <strong>draft</strong> until a human German-language
          review is recorded. We do not invent that review.
        </p>
        <p>
          Official Goethe and Deutsche Welle pages stay on their own sites. Use{" "}
          <Link to="/learn/sources">Sources</Link> and <Link to="/learn/skills">Four skills</Link>{" "}
          when you want listening, reading, writing, or speaking practice from those organisations.
          We do not host their videos or exam papers.
        </p>
      </section>

      <section>
        <h2>Look things up without leaving the path</h2>
        <p>
          Press <kbd>/</kbd> anywhere in Lessons, or open <Link to="/learn/inquire">Inquire</Link>.
          Type a German word, an English gloss, or a slightly wrong spelling such as{" "}
          <code>strasse</code> — it still finds <em>Straße</em>.
        </p>
        <p>A few useful shapes:</p>
        <ul>
          <li>
            <code>der Tisch</code> — look up by article
          </li>
          <li>
            <code>#food Apfel</code> — stay inside a topic
          </li>
          <li>
            <code>pos:verb gehen</code> — filter by part of speech
          </li>
        </ul>
        <p>
          <Link to="/learn/mapper">Mapper</Link> turns an English noun into a German article + word
          from the authored list. <Link to="/learn/builder">Builder</Link> puts that noun into a
          small sentence so you see case, not only a flashcard.
        </p>
      </section>

      <section>
        <h2>Keep words warm</h2>
        <p>
          <Link to="/learn/drill">Cover drill</Link> hides the English, then the German. Say the
          article out loud before you uncover it. Add a noun to the private queue when you want it
          again later.
        </p>
        <p>
          <Link to="/review">Review</Link> is that queue. For a noun you type <em>der</em>,{" "}
          <em>die</em>, or <em>das</em>, then mark <strong>Again</strong> or <strong>Got it</strong>.
          The next due time is a simple box schedule, not a scientific promise. Ratings never go
          onto the shared board.
        </p>
      </section>

      <section>
        <h2>Notes for a video or class</h2>
        <p>
          In <Link to="/learn/lectures">Lectures</Link>, paste an https link to a YouTube clip,
          Vimeo clip, or the class page you already opened. Each video or lecture gets its own note
          on this device: free text, words, phrases, facts. We do not host the video. Class pages
          that cannot embed stay a new-tab link.
        </p>
        <p>
          If you want a spelling or grammar hint, consent and click <strong>Check German</strong>.
          That sends the note to LanguageTool. A clean check is not a human review and not
          guaranteed German. You can also send a saved word into private review.
        </p>
      </section>

      <section>
        <h2>Study with a friend on this computer</h2>
        <p>
          You do not need a public website. On this machine run the app as usual, then:
        </p>
        <ol>
          <li>
            On the <Link to="/">home page</Link>, open the sample shared board (the sync process
            must be running on this computer).
          </li>
          <li>
            In <Link to="/settings">Settings</Link>, show the sample invitation. Anyone with that
            link is an editor. Do not paste it into the shared board, a screenshot, or git.
          </li>
          <li>
            Your friend opens a <strong>separate browser profile</strong> (or another browser) and
            pastes the invitation. Two tabs in the same profile are the same person.
          </li>
        </ol>
        <p>
          You both edit the <strong>shared board</strong>. Each of you keeps a private review
          history. A friend on another laptop cannot join through <code>127.0.0.1</code> — that
          address is only this computer.
        </p>
      </section>

      <section>
        <h2>Read the status line as four facts</h2>
        <p>On a shared board the bar is not one green “all saved” badge. Read each part:</p>
        <ul>
          <li>
            <strong>Saved on this device</strong> — this browser has a local copy.
          </li>
          <li>
            <strong>Connected</strong> — the socket is up. It does not mean the latest keystroke is
            on disk.
          </li>
          <li>
            <strong>Initial synchronization complete</strong> — this tab has finished the first
            catch-up.
          </li>
          <li>
            <strong>Server checkpoint recorded</strong> — the server wrote a binary snapshot at that
            sequence. Later local edits may not be in it yet.
          </li>
        </ul>
        <p>
          You can open a standalone board on this device with no sync process at all. Publishing
          that board later would be a new room identity, not the same shared document.
        </p>
      </section>

      <section>
        <h2>Keep a copy of your private work</h2>
        <p>
          Browser storage can be cleared. In <Link to="/settings">Settings</Link>, export private
          review when you care about the queue. Board export is visible material only: no tokens, no
          ratings. Import restores this profile, not your friend’s.
        </p>
      </section>

      <section>
        <h2>What this will not do</h2>
        <p>
          It will not mark you B1, encrypt the shared board end-to-end, or prove learning gains. It
          will not replace a teacher or copy a Goethe word list. Suggestions from LanguageTool can
          be wrong. Treat the workspace as a calm place to practise, look things up, and sit next to
          one friend — then go and use the language.
        </p>
      </section>
    </main>
  );
}
