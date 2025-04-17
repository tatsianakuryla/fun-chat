import { Routes } from '../../types';

export class Router {
  private static _routes: Record<string, () => void> = {};

  public static init(): void {
    window.addEventListener('hashchange', () => this._handleRoute());
    document.addEventListener('DOMContentLoaded', () => this._handleRoute());
    this._handleRoute();
  }

  public static navigateTo(route: Routes): void {
    if (location.hash !== `#${route}`) {
      location.hash = `#${route}`;
    }
  }

  public static addRoute(route: Routes, routeHandler: () => void): void {
    if (!this._routes[route]) {
      this._routes[route] = routeHandler;
    }
  }

  private static _handleRoute(): void {
    const route = location.hash.slice(1) || Routes.Authentication;

    if (this._routes[route]) {
      this._routes[route]();
    }
  }
}
