import { Router } from '../../../core/router/router';
import { Routes } from '../../../types';
import { createElementWithClassId } from '../../../utils/helpers';
import style from './about.module.css';

export class AboutLinkFactory {
  public static createAboutLink(): HTMLAnchorElement {
    const link = createElementWithClassId('a', [style['about-link']]);
    link.href = `#${Routes.About}`;
    link.textContent = 'About';
    link.addEventListener('click', (e) => {
      e.preventDefault();
      Router.navigateTo(Routes.About);
    });
    return link;
  }
}
