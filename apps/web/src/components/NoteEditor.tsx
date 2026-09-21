import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { useEffect, useRef } from "react";
import { yCollab } from "y-codemirror.next";
import type { Awareness } from "y-protocols/awareness";
import type * as Y from "yjs";

export function NoteEditor({
  ytext,
  awareness,
}: {
  ytext: Y.Text;
  awareness?: Awareness | null;
}) {
  const parent = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!parent.current) {
      return;
    }
    const view = new EditorView({
      state: EditorState.create({
        doc: ytext.toString(),
        extensions: [basicSetup, EditorView.lineWrapping, yCollab(ytext, awareness ?? null)],
      }),
      parent: parent.current,
    });
    return () => view.destroy();
  }, [ytext, awareness]);

  return <div className="editor" ref={parent} />;
}
