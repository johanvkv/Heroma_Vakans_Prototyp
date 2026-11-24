// Older open tabs still request this chunk when Nämnder is clicked.
// Reload the current app instead of showing a missing-module error.
export function FeedbackSummary() {
  window.location.replace('/vikariehantering/schema');
  return null;
}
