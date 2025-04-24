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

export const FLEX_CLASS = 'flex';
export const primaryLayout = new PrimaryLayout();
export const authPage = new AuthPage();
export const chatPage = new ChatPage();
export const aboutPage = new AboutPage();

function appInit(): void {
  AuthState.init();

  WebSocketService.onDisconnect(() => {
    // ERROR
  });

  WebSocketService.onReconnect(() => {
    // HIDE ERROR
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
