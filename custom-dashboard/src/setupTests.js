// Setup tests environment
// Provide global mocks for ResizeObserver and other browser APIs used by Recharts/Monaco.

import '@testing-library/jest-dom';

class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = global.ResizeObserver || ResizeObserver;

if (typeof window !== 'undefined') {
  window.ResizeObserver = window.ResizeObserver || ResizeObserver;

  // minimal matchMedia mock for components that check media queries
  window.matchMedia = window.matchMedia || function () {
    return {
      matches: false,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    };
  };

  // Mock getBoundingClientRect to avoid Recharts zero-size errors in jsdom tests
  const originalGetBoundingClientRect = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = function () {
    // If element has explicit data-test-size attribute, respect it
    if (this.dataset && this.dataset.testWidth && this.dataset.testHeight) {
      return {
        width: Number(this.dataset.testWidth),
        height: Number(this.dataset.testHeight),
        top: 0,
        left: 0,
        right: Number(this.dataset.testWidth),
        bottom: Number(this.dataset.testHeight),
      };
    }
    // default non-zero size for chart containers
    return { width: 1000, height: 400, top: 0, left: 0, right: 1000, bottom: 400 };
  };
}