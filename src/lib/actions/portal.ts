export function portal(element: HTMLElement) {
  const target = document.body;
  target.appendChild(element);

  return {
    destroy() {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }
  };
} 