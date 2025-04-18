import { Chat } from '../components/chat/Сhat';
import { BasePage } from './Base-page';
import { authPage, primaryLayout } from '../..';

export class ChatPage extends BasePage<Chat> {
  public override open(): void {
    authPage.clear();
    this._element = new Chat();
    primaryLayout.header.appendChild(this._element.headerContainer);
  }
}
