import { FLEX_CLASS } from '../../..';
import { AuthFormFields, InputTypes } from '../../../types';
import { createElementWithClassId } from '../../../utils/helpers';
import { ButtonFactory } from '../Button';
import { ContainerFactory } from '../container/Container';
import { InputFactory } from '../Input';
import { LabelFactory } from '../Label';
import style from './auth-form.module.css';

export class AuthForm {
  private static readonly _LOGIN_PLACEHOLDER = 'Enter your login';
  private static readonly _PASSWORD_PLACEHOLDER = 'Enter your password';
  private static readonly _SUBMIT_BUTTON_TEXT = 'Log In';

  private _form: HTMLFormElement;
  private _container: HTMLElement;
  private _loginInput: HTMLInputElement;
  private _passwordInput: HTMLInputElement;

  private _submitButton: HTMLButtonElement;

  constructor() {
    this._loginInput = AuthForm._createInput(
      AuthFormFields.Login,
      'text',
      AuthForm._LOGIN_PLACEHOLDER,
    );
    this._passwordInput = AuthForm._createInput(
      AuthFormFields.Password,
      'password',
      AuthForm._PASSWORD_PLACEHOLDER,
    );
    this._submitButton = AuthForm._createSubmitButton();
    this._form = this._createForm();
    this._container = ContainerFactory.create('auth-form');
    this._container.append(this._form);
  }

  public get container(): HTMLElement {
    return this._container;
  }

  private static _createLabel(name: AuthFormFields): HTMLLabelElement {
    return LabelFactory.create([style[`auth-form__label_${name}`]], name);
  }

  private static _createSubmitButton(): HTMLButtonElement {
    return ButtonFactory.create(
      [style['auth-form__button'], style['auth-form__button_submit']],
      'submit',
      AuthForm._SUBMIT_BUTTON_TEXT,
    );
  }

  private static _createInput(
    name: AuthFormFields,
    type: InputTypes,
    placeholder: string,
  ): HTMLInputElement {
    return InputFactory.create(
      [style['auth-form__input'], style[`auth-form__input_${name}`]],
      type,
      name,
      placeholder,
    );
  }

  private _createWrapper(
    name: AuthFormFields,
    input: HTMLInputElement,
  ): HTMLElement {
    const wrapper = createElementWithClassId('div', [
      FLEX_CLASS,
      style['auth-form__input-label-wrapper'],
    ]);
    wrapper.append(AuthForm._createLabel(name), input);
    return wrapper;
  }

  private _createForm(): HTMLFormElement {
    const form = createElementWithClassId('form', [
      FLEX_CLASS,
      style['auth-form'],
    ]);

    form.append(
      this._createWrapper(AuthFormFields.Login, this._loginInput),
      this._createWrapper(AuthFormFields.Password, this._passwordInput),
      this._submitButton,
    );

    return form;
  }
}
