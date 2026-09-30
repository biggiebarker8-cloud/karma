const REACT_RECOVERABLE_TYPE = Symbol.for('react.recoverable');

const BROWSER_ONLY_MESSAGE =
  "Recoverable Exception: This is not a real error! It's an implementation detail of `use(browser())` to defer rendering to the browser. `use(browser())` can only be used inside a `<Suspense>` boundary. If a server render errors with this as its cause, the component that called `use(browser())` does not have a `<Suspense>` boundary above it.";

/**
 * Returns a recoverable signal that defers a subtree to a browser renderer.
 *
 * The signal is intentionally an Error so renderers can preserve the call
 * site when a Suspense boundary is missing, while its React recoverable tag
 * lets compatible renderers handle it without treating it as an application
 * error.
 */
export function browser() {
  const recoverable = new Error(BROWSER_ONLY_MESSAGE);
  Object.defineProperty(recoverable, '$$typeof', {
    configurable: false,
    enumerable: false,
    value: REACT_RECOVERABLE_TYPE,
    writable: false,
  });
  return recoverable;
}

export { REACT_RECOVERABLE_TYPE };
