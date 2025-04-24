import './styles/modern-normalize.css';
import './styles/style.css';

import { WebSocketService } from './api/Web-socket-service';
import { Router } from './core/router/router';
import { Routes } from './types';
import { AuthPage } from './ui/pages/Auth-page';
import { AuthState } from './core/auth/Auth-state';
import { PrimaryLayout } from './ui/layouts/primary-layout';
import { ChatPage } from './ui/pages/Chat-page';
import { AboutPage } from './ui/pages/About-page';
import { ErrorNotification } from './ui/components/error-notification/Error-notification';

export const FLEX_CLASS = 'flex';
export const SERVER_ERROR_TEXTCONTENT =
  'Connection lost. Attempting to reconnect...';
export const SERVER_SUCCESS_INFO = 'Connection established successfully.';
export const primaryLayout = new PrimaryLayout();
export const authPage = new AuthPage();
export const chatPage = new ChatPage();
export const aboutPage = new AboutPage();
export const errorNotificationClass = new ErrorNotification();

function appInit(): void {
  AuthState.init();

  WebSocketService.onDisconnect(() => {
    errorNotificationClass.open(SERVER_ERROR_TEXTCONTENT);
  });

  WebSocketService.onReconnect(() => {
    const user = AuthState.user;
    const pw = AuthState.password;
    if (user && pw) {
      WebSocketService.loginUser(user.login, pw).then((u) =>
        AuthState.setUser(u, pw),
      );
    }
  });

  WebSocketService.connect();
  primaryLayout.render();

  Router.addRoute(Routes.Authentication, () => {
    if (AuthState.isAuthorized) {
      Router.navigateTo(Routes.Chat);
      return;
    }
    authPage.open();
  });

  Router.addRoute(Routes.Chat, () => {
    if (!AuthState.isAuthorized) {
      Router.navigateTo(Routes.Authentication);
      return;
    }
    chatPage.open();
  });

  Router.addRoute(Routes.About, () => {
    aboutPage.open();
  });

  Router.init();
}

appInit();
