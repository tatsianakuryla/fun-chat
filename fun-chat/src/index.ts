import './styles/modern-normalize.css';
import './styles/style.css';
import { AuthForm } from './ui/components/auth-form/Auth-form';
import { Main } from './ui/layouts/main/Main';
import { BasePage } from './ui/pages/Base-page';

export const FLEX_CLASS = 'flex';

const mainClass = new Main();
export const main = mainClass.element;

const authForm = new AuthForm();

document.body.append(main);
BasePage.open(authForm.container);
