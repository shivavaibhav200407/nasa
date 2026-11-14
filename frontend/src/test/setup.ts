import '@testing-library/jest-dom';

// Mock matchMedia for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});

// Mock HTMLCanvasElement.getContext for procedural Canvas and Starfield
if (!HTMLCanvasElement.prototype.getContext) {
  // @ts-expect-error Mocking canvas 2D context
  HTMLCanvasElement.prototype.getContext = (contextType: string) => {
    if (contextType === '2d') {
      return {
        clearRect: () => {},
        fillRect: () => {},
        beginPath: () => {},
        arc: () => {},
        ellipse: () => {},
        fill: () => {},
        stroke: () => {},
        drawImage: () => {},
        createRadialGradient: () => ({
          addColorStop: () => {},
        }),
        setTransform: () => {},
      };
    }
    return null;
  };
}
