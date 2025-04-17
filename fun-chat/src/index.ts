import './styles/modern-normalize.css';
import './styles/style.css';

import { WebSocketService } from './api/Web-socket-service';
import { Router } from './core/router/router';
import { Routes } from './types';
import { AuthForm } from './ui/components/auth-form/Auth-form';
import { Main } from './ui/layouts/main/Main';
import { BasePage } from './ui/pages/Base-page';
import { AuthState } from './core/auth/Auth-state';

export const FLEX_CLASS = 'flex';

WebSocketService.connect();

const mainClass = new Main();
export const main = mainClass.element;

export const authForm = new AuthForm();

document.body.append(main);

Router.addRoute(Routes.Authentication, () => {
  if (AuthState.isAuthorized) {
    Router.navigateTo(Routes.Chat);
    return;
  }
  BasePage.open(Routes.Authentication, authForm.container);
});

Router.addRoute(Routes.Chat, () => {
  if (!AuthState.isAuthorized) {
    Router.navigateTo(Routes.Authentication);
    return;
  }
});

Router.addRoute(Routes.About, () => {});

AuthState.init();
Router.init();
