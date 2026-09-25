export function createContinuousLearningStore({ auditLogger } = {}) {
  const feedback = [];

  return {
    capture(entry) {
      const normalized = {
        timestamp: new Date().toISOString(),
        rating: entry.rating,
        correction: entry.correction || null,
        context: entry.context || null,
      };
      feedback.push(normalized);
      auditLogger?.log?.({ type: 'learning.feedback_captured', rating: entry.rating });
      return normalized;
    },
    list() {
      return [...feedback];
    },
    summarize() {
      const likes = feedback.filter((item) => item.rating === 'up').length;
      const dislikes = feedback.filter((item) => item.rating === 'down').length;
      return {
        total: feedback.length,
        likes,
        dislikes,
        needsReview: feedback.filter((item) => item.correction).length,
      };
    },
  };
}

