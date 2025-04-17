import { Router } from '../../../core/router/router';
import { FLEX_CLASS } from '../../..';
import { AuthService } from '../../../core/auth/Auth-service';
import { AuthFormValidator } from '../../../core/auth/Auth-validator';
import type { InputTypes, ValidatorResponse } from '../../../types';
import { AuthFormFields, Routes } from '../../../types';
import { createElementWithClassId } from '../../../utils/helpers';
import { ButtonFactory } from '../Button';
import { ContainerFactory } from '../container/Container';
import { InputFactory } from '../Input';
import { LabelFactory } from '../Label';
import style from './auth-form.module.css';

export class AuthForm {
  private static readonly SPACE_REGEX = /\s/g;
  private static readonly _LOGIN_PLACEHOLDER = 'Enter your login';
  private static readonly _PASSWORD_PLACEHOLDER = 'Enter your password';
  private static readonly _SUBMIT_BUTTON_TEXT = 'Log In';
  private static readonly _TIMEOUT = 500;

  private _form: HTMLFormElement;
  private _container: HTMLElement;
  private _loginInput: HTMLInputElement;
  private _loginErrorMessage: HTMLElement;
  private _passwordInput: HTMLInputElement;
  private _passwordErrorMessage: HTMLElement;
  private _submitButton: HTMLButtonElement;
  private _showPasswordButton: HTMLButtonElement;
  private _authErrorMessage: HTMLElement;
  private _isLoginValid = false;
  private _isPasswordValid = false;
  private _inputTimeout!: ReturnType<typeof setTimeout>;

  constructor() {
    this._loginInput = AuthForm._createInput(
      AuthFormFields.Login,
      'text',
      AuthForm._LOGIN_PLACEHOLDER,
    );
    this._loginErrorMessage = AuthForm._createErrorMessageElement();

    this._loginInput.addEventListener('input', this._handleLoginInput);

    this._passwordInput = AuthForm._createInput(
      AuthFormFields.Password,
      'password',
      AuthForm._PASSWORD_PLACEHOLDER,
    );
    this._passwordErrorMessage = AuthForm._createErrorMessageElement();
    this._showPasswordButton = AuthForm._createShowPasswordButton();

    this._passwordInput.addEventListener('input', this._handlePasswordInput);
    this._showPasswordButton.addEventListener(
      'click',
      this._togglePasswordInputType,
    );

    this._authErrorMessage = createElementWithClassId('div', [
      style['auth-form__auth-error'],
    ]);

    this._submitButton = AuthForm._createSubmitButton();
    this._updateSubmitButton();

    this._form = this._createForm();
    this._form.addEventListener('submit', this._handleFormSubmit);

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

  private static _createShowPasswordButton(): HTMLButtonElement {
    return ButtonFactory.create(
      [style['auth-form__toggle-password_hidden']],
      'button',
      '',
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

  private static _preventSpacesInputs(input: HTMLInputElement): void {
    input.value = input.value.replace(AuthForm.SPACE_REGEX, '');
  }

  private static _updateErrorMessage(
    element: HTMLElement,
    messages: string[],
  ): void {
    element.textContent = messages.join(', ');
  }

  private static _createErrorMessageElement(): HTMLElement {
    const element = createElementWithClassId('div', [
      style['auth-form__error'],
    ]);
    element.setAttribute('aria-live', 'polite');

    return element;
  }

  private static _createWrapper(
    name: AuthFormFields,
    input: HTMLInputElement,
    errorMessage: HTMLElement,
  ): HTMLElement {
    const wrapper = createElementWithClassId('div', [
      FLEX_CLASS,
      style['auth-form__input-label-wrapper'],
    ]);
    wrapper.append(AuthForm._createLabel(name), input, errorMessage);
    return wrapper;
  }

  private _createForm(): HTMLFormElement {
    const form = createElementWithClassId('form', [
      FLEX_CLASS,
      style['auth-form'],
    ]);

    const passwordWrapper = AuthForm._createWrapper(
      AuthFormFields.Password,
      this._passwordInput,
      this._passwordErrorMessage,
    );
    passwordWrapper.append(this._showPasswordButton);

    form.append(
      AuthForm._createWrapper(
        AuthFormFields.Login,
        this._loginInput,
        this._loginErrorMessage,
      ),
      passwordWrapper,
      this._submitButton,
      this._authErrorMessage,
    );

    return form;
  }

  private _validateField(
    value: string,
    validator: (value: string) => ValidatorResponse,
    errorElement: HTMLElement,
    onValidChange: (isValid: boolean) => void,
  ): void {
    const { isValid, messages } = validator(value);
    AuthForm._updateErrorMessage(errorElement, isValid ? [] : messages);
    onValidChange(isValid);
    this._updateSubmitButton();
  }

  private _handleLoginInput = (): void => {
    AuthForm._preventSpacesInputs(this._loginInput);
    AuthForm._updateErrorMessage(this._loginErrorMessage, []);
    clearTimeout(this._inputTimeout);

    this._inputTimeout = setTimeout(() => {
      this._validateField(
        this._loginInput.value,
        AuthFormValidator.validateLogin,
        this._loginErrorMessage,
        (isValid) => (this._isLoginValid = isValid),
      );
    }, AuthForm._TIMEOUT);
  };

  private _handlePasswordInput = (): void => {
    AuthForm._preventSpacesInputs(this._passwordInput);
    AuthForm._updateErrorMessage(this._loginErrorMessage, []);
    clearTimeout(this._inputTimeout);

    this._inputTimeout = setTimeout(() => {
      this._validateField(
        this._passwordInput.value,
        AuthFormValidator.validatePassword,
        this._passwordErrorMessage,
        (isValid) => (this._isPasswordValid = isValid),
      );
    }, AuthForm._TIMEOUT);
  };

  private _handleFormSubmit = (event: SubmitEvent): void => {
    event.preventDefault();
    this._validateField(
      this._loginInput.value,
      AuthFormValidator.validateLogin,
      this._loginErrorMessage,
      (isValid) => (this._isLoginValid = isValid),
    );

    this._validateField(
      this._passwordInput.value,
      AuthFormValidator.validatePassword,
      this._passwordErrorMessage,
      (isValid) => (this._isPasswordValid = isValid),
    );

    if (!(this._isLoginValid && this._isPasswordValid)) {
      return;
    }

    this._cleanInputs();

    AuthService.login(this._loginInput.value, this._passwordInput.value)
      .then((user) => {
        console.log(user);
        this._cleanInputs();
        Router.navigateTo(Routes.Chat);
      })
      .catch((error) => {
        AuthForm._updateErrorMessage(this._authErrorMessage, [error]);
      });
  };

  private _cleanInputs(): void {
    this._loginInput.value = '';
    this._passwordInput.value = '';
    AuthForm._updateErrorMessage(this._authErrorMessage, []);
    AuthForm._updateErrorMessage(this._loginErrorMessage, []);
    AuthForm._updateErrorMessage(this._passwordErrorMessage, []);
  }

  private _updateSubmitButton(): void {
    this._submitButton.disabled = !(
      this._isLoginValid && this._isPasswordValid
    );
  }

  private _togglePasswordInputType = (): void => {
    const isHidden = this._passwordInput.type === 'password';
    this._passwordInput.type = isHidden ? 'text' : 'password';
    this._showPasswordButton.classList.toggle(
      style['auth-form__toggle-password_show'],
      !isHidden,
    );
  };
}
