// CodeMirror 6 editor for C++, loaded on demand (dynamic import) the first
// time a reader chooses "Edit". Colours come from the same CSS variables as
// the static code blocks.
import { EditorView, basicSetup } from 'codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { EditorState } from '@codemirror/state';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

const vellumHighlight = HighlightStyle.define([
  { tag: [t.keyword, t.controlKeyword, t.operatorKeyword, t.modifier, t.definitionKeyword], color: 'var(--code-token-keyword)' },
  { tag: [t.number, t.bool, t.null, t.atom], color: 'var(--code-token-constant)' },
  { tag: [t.string, t.character, t.special(t.string)], color: 'var(--code-token-string)' },
  { tag: [t.comment, t.lineComment, t.blockComment], color: 'var(--code-token-comment)', fontStyle: 'italic' },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: 'var(--code-token-function)' },
  { tag: [t.typeName, t.namespace, t.className], color: 'var(--code-token-function)' },
  { tag: [t.processingInstruction, t.meta], color: 'var(--code-token-keyword)' },
  { tag: [t.punctuation, t.operator, t.bracket], color: 'var(--code-token-punctuation)' },
]);

const vellumTheme = EditorView.theme({
  '&': { backgroundColor: 'var(--panel)', color: 'var(--v-ink)', fontSize: '0.86rem' },
  '.cm-content': { fontFamily: 'var(--v-font-mono)', caretColor: 'var(--v-ink)', padding: '14px 0' },
  '.cm-gutters': { backgroundColor: 'var(--panel)', color: 'var(--v-muted)', border: 'none' },
  '.cm-activeLine': { backgroundColor: 'color-mix(in srgb, var(--v-indigo-tint) 25%, transparent)' },
  '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--v-ink)' },
  '.cm-selectionBackground, ::selection': { backgroundColor: 'var(--v-indigo-tint) !important' },
  '&.cm-focused': { outline: '2px solid var(--accent)', outlineOffset: '-2px' },
  '.cm-cursor': { borderLeftColor: 'var(--v-ink)' },
});

export function createEditor(parent: HTMLElement, doc: string, onChange: () => void, label: string) {
  return new EditorView({
    parent,
    state: EditorState.create({
      doc,
      extensions: [
        basicSetup,
        cpp(),
        syntaxHighlighting(vellumHighlight),
        vellumTheme,
        EditorView.contentAttributes.of({ 'aria-label': `Editable C++ source: ${label}` }),
        EditorView.updateListener.of((u) => {
          if (u.docChanged) onChange();
        }),
      ],
    }),
  });
}
