import { useEffect, useId, useState } from 'react';
import { actions, load } from '../../lib/persistence/store';
import { inline } from './inline';

// An understanding check: output prediction, code reading, debugging or
// interpretation. Feedback explains every option. A correct answer is
// recorded locally as evidence of competence (distinct from visiting).

interface Props {
  /** Unique within the lesson; stored as "<lesson>/<id>". */
  id: string;
  lesson: string;
  kind?: 'predict' | 'read' | 'debug' | 'model' | 'interpret';
  question: string;
  /** Optional code shown with the question (plain text, monospace). */
  code?: string;
  options: string[];
  answer: number;
  /** One explanation per option; the correct option's text is the main explanation. */
  feedback: string[];
}

const KIND_LABEL = {
  predict: 'Predict the output',
  read: 'Read the code',
  debug: 'Find the bug',
  model: 'Model reasoning',
  interpret: 'Interpret the result',
} as const;

export default function CheckIsland({ id, lesson, kind = 'read', question, code, options, answer, feedback }: Props) {
  const key = `${lesson}/${id}`;
  const uid = useId();
  const [choice, setChoice] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [passedBefore, setPassedBefore] = useState(false);

  useEffect(() => {
    setPassedBefore(Boolean(load().checks[key]));
  }, [key]);

  const correct = submitted && choice === answer;
  const submit = () => {
    if (choice === null) return;
    setSubmitted(true);
    if (choice === answer) {
      actions.passCheck(key);
      setPassedBefore(true);
    }
  };

  return (
    <section className={`check${submitted ? (correct ? ' is-correct' : ' is-wrong') : ''}`} aria-labelledby={`${uid}-q`}>
      <p className="check-kind">
        {KIND_LABEL[kind]}
        {passedBefore && <span className="status status-good"> answered correctly before</span>}
      </p>
      <p className="check-q" id={`${uid}-q`}>{inline(question)}</p>
      {code && (
        <pre className="check-code">
          <code>{code}</code>
        </pre>
      )}
      <fieldset className="check-options" disabled={submitted && correct}>
        <legend className="sr-only">Options</legend>
        {options.map((opt, i) => (
          <label key={i} className={`check-option${submitted && i === choice ? (i === answer ? ' is-right' : ' is-chosen-wrong') : ''}`}>
            <input
              type="radio"
              name={uid}
              checked={choice === i}
              onChange={() => {
                setChoice(i);
                setSubmitted(false);
              }}
            />
            <span>{inline(opt)}</span>
          </label>
        ))}
      </fieldset>
      <div className="check-actions">
        <button type="button" className="btn" onClick={submit} disabled={choice === null || (submitted && correct)}>
          Check my answer
        </button>
        {submitted && !correct && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              setChoice(null);
              setSubmitted(false);
            }}
          >
            Try again
          </button>
        )}
      </div>
      <div role="status" aria-live="polite">
        {submitted && choice !== null && (
          <div className="check-feedback">
            <p>
              <strong>{correct ? 'Correct. ' : 'Not quite. '}</strong>
              {inline(feedback[choice] ?? '')}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
