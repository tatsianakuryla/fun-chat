import { createElementWithClassId } from '../../../utils/helpers';
import { ContainerFactory } from '../container/Container';
import style from './about.module.css';

export class About {
  private static readonly _TITLE_TEXTCONTENT = 'About FunChat';
  private static readonly _INFO_TEXTCONTENT =
    'FunChat — это учебное приложение для обмена сообщениями в реальном времени. ' +
    'Реализовано на TypeScript, WebSocket, без бэкенда на фреймворках.';
  private static readonly _AUTOR_TEXTCONTENT = `<a href="https://github.com/tatsianakuryla/" target="_blank">Tatsiana Kuryla</a>`;

  private _mainContainer = ContainerFactory.create('about-main');

  constructor() {
    this._mainContainer.append(
      About._createTitle(),
      About._createAboutInfo(),
      About._createAuthorInfo(),
    );
  }
  public get mainContainer(): HTMLElement {
    return this._mainContainer;
  }
  private static _createTitle(): HTMLHeadingElement {
    const title = createElementWithClassId('h2', [style['about__title']]);
    title.textContent = this._TITLE_TEXTCONTENT;
    return title;
  }

  private static _createAboutInfo(): HTMLParagraphElement {
    const info = createElementWithClassId('p', [style['about__info']]);
    info.textContent = this._INFO_TEXTCONTENT;
    return info;
  }

  private static _createAuthorInfo(): HTMLParagraphElement {
    const author = createElementWithClassId('div', [
      style['about__author-info'],
    ]);
    author.innerHTML = this._AUTOR_TEXTCONTENT;
    return author;
  }
}
