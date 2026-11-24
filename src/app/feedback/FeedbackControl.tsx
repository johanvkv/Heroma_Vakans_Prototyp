import { useEffect, useState } from 'react';

export function FeedbackControl() {
  const [active, setActive] = useState(() => document.documentElement.dataset.feedbackActive === 'true');

  useEffect(() => {
    const update = (event: Event) => setActive((event as CustomEvent<boolean>).detail);
    window.addEventListener('feedback:state', update);
    return () => window.removeEventListener('feedback:state', update);
  }, []);

  return <button
    type="button"
    className={`feedback-ui feedback-header-button${active ? ' is-active' : ''}`}
    aria-pressed={active}
    onClick={() => window.dispatchEvent(new Event('feedback:toggle'))}
  >
    <i className="fa-regular fa-comment" aria-hidden="true" />
    <span>{active ? 'Avsluta kommentarer' : 'Kommentera'}</span>
  </button>;
}
