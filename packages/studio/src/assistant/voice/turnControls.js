export function createTurnController() {
  const state = {
    paused: false,
    interrupted: false,
    confirmationRequired: false,
  };

  return {
    pause() {
      state.paused = true;
    },
    resume() {
      state.paused = false;
    },
    interrupt() {
      state.interrupted = true;
    },
    clearInterrupt() {
      state.interrupted = false;
    },
    requireConfirmation() {
      state.confirmationRequired = true;
    },
    confirm() {
      state.confirmationRequired = false;
    },
    snapshot() {
      return { ...state };
    },
  };
}

