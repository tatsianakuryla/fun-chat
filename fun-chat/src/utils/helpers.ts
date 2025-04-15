export function createElementWithClassId<T extends keyof HTMLElementTagNameMap>(
  tag: T,
  classes?: string[],
  id?: string,
): HTMLElementTagNameMap[T] {
  const element = document.createElement(tag);
  if (classes) {
    element.classList.add(...classes);
  }
  if (id) {
    element.id = id;
  }

  return element;
}

export function textToUpperCase(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}
