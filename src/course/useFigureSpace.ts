import { useLayoutEffect, useRef } from 'react';

// Reserve actual text and controls first. Only illustrations shrink;
// short screens and enlarged text retain normal page scrolling.
export function useFigureSpace(questionKey: string | null) {
  const ref = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    const section = ref.current;
    const card = section?.querySelector<HTMLElement>('.course-style-test');
    const figures = card?.querySelector<HTMLElement>('.course-figures');
    if (!questionKey || !section || !card || !figures) return;
    const px = (value: string) => Number.parseFloat(value) || 0;
    const outerHeight = (element: Element) => {
      const css = getComputedStyle(element);
      return element.getBoundingClientRect().height + px(css.marginTop) + px(css.marginBottom);
    };
    const update = () => {
      const css = getComputedStyle(card), figureCss = getComputedStyle(figures);
      let reserved = card.getBoundingClientRect().top + window.scrollY
        + px(css.paddingTop) + px(css.paddingBottom) + px(css.borderTopWidth) + px(css.borderBottomWidth)
        + px(figureCss.marginTop) + px(figureCss.marginBottom);
      for (const child of card.children) if (child !== figures) reserved += outerHeight(child);
      reserved += Math.max(...Array.from(figures.querySelectorAll('figcaption'), outerHeight));
      for (const selector of ['.content-frame', '.main-content']) {
        const element = section.closest(selector);
        if (element) { const style = getComputedStyle(element); reserved += px(style.paddingBottom) + px(style.borderBottomWidth); }
      }
      const footer = document.querySelector('.site-footer');
      if (footer) reserved += outerHeight(footer);
      section.style.setProperty('--figure-height', `${Math.max(180, Math.min(350, Math.floor(window.innerHeight - reserved - 4)))}px`);
    };
    const observer = new ResizeObserver(update);
    for (const element of [document.querySelector('.site-header'), document.querySelector('.site-footer'), ...card.children, ...figures.querySelectorAll('figcaption')]) {
      if (element && element !== figures) observer.observe(element);
    }
    window.addEventListener('resize', update);
    update();
    return () => { observer.disconnect(); window.removeEventListener('resize', update); };
  }, [questionKey]);
  return ref;
}
