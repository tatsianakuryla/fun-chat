import { BasePage } from './Base-page';
import { authPage, chatPage, primaryLayout } from '../..';
import { About } from '../components/about/about';

export class AboutPage extends BasePage<About> {
  public override open(): void {
    this.clear();
    chatPage.clear();
    authPage.clear();
    this._element = new About();
    primaryLayout.main.append(this._element.mainContainer);
  }
}
