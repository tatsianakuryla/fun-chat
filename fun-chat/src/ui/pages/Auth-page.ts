import { AuthForm } from '../components/auth-form/Auth-form';
import { BasePage } from './Base-page';
import { aboutPage, chatPage, primaryLayout } from '../..';

export class AuthPage extends BasePage<AuthForm> {
  public override open(): void {
    this.clear();
    chatPage.clear();
    aboutPage.clear();
    this._element = new AuthForm();
    primaryLayout.main.append(this._element.mainContainer);
  }
}
