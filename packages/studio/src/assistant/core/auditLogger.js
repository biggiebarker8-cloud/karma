export function createAuditLogger({ maxEvents = 500 } = {}) {
  const events = [];

  function addEvent(event) {
    const normalizedEvent = {
      timestamp: new Date().toISOString(),
      ...event,
    };

    events.push(normalizedEvent);
    if (events.length > maxEvents) {
      events.shift();
    }
    return normalizedEvent;
  }

  return {
    log(event) {
      return addEvent(event);
    },
    list() {
      return [...events];
    },
    clear() {
      events.length = 0;
    },
  };
}

