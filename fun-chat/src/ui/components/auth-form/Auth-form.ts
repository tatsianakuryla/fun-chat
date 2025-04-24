import { Router } from '../../../core/router/router';
import { FLEX_CLASS } from '../../..';
import { AuthFormValidator } from '../../../core/auth/Auth-validator';
import type { InputTypes, ValidatorResponse } from '../../../types';
import { AuthFormFields, Routes } from '../../../types';
import { createElementWithClassId } from '../../../utils/helpers';
import { ButtonFactory } from '../Button';
import { ContainerFactory } from '../container/Container';
import { InputFactory } from '../Input';
import { LabelFactory } from '../Label';
import style from './auth-form.module.css';
import { LocalStorage } from '../../../core/local-storge/Local-storage';
import { LocalStorageKeys } from '../../../core/local-storge/local-storage-types';
import { AuthState } from '../../../core/auth/Auth-state';
import { WebSocketService } from '../../../api/Web-socket-service';
import { AboutLinkFactory } from '../about/about-link';

export class AuthForm {
  private static readonly SPACE_REGEX = /\s/g;
  private static readonly _LOGIN_PLACEHOLDER = 'Enter your login';
  private static readonly _PASSWORD_PLACEHOLDER = 'Enter your password';
  private static readonly _SUBMIT_BUTTON_TEXT = 'Log In';
  private static readonly _TIMEOUT = 500;

  private _form: HTMLFormElement;
  private _mainContainer = ContainerFactory.create('auth-form');
  private _loginInput = AuthForm._createInput(
    AuthFormFields.Login,
    'text',
    AuthForm._LOGIN_PLACEHOLDER,
  );
  private _loginErrorMessage = AuthForm._createErrorMessageElement();
  private _passwordInput = AuthForm._createInput(
    AuthFormFields.Password,
    'password',
    AuthForm._PASSWORD_PLACEHOLDER,
  );
  private _passwordErrorMessage = AuthForm._createErrorMessageElement();
  private _submitButton = AuthForm._createSubmitButton();
  private _showPasswordButton = AuthForm._createShowPasswordButton();
  private _authErrorMessage = createElementWithClassId('div', [
    style['auth-form__auth-error'],
  ]);
  private _isLoginValid = false;
  private _isPasswordValid = false;
  private _inputTimeout!: ReturnType<typeof setTimeout>;

  constructor() {
    this._form = this._createForm();
    this._implementEventListeners();
    this._mainContainer.append(AboutLinkFactory.createAboutLink(), this._form);
    this._inputsValidation();
    this._cleanInputs();
    this._updateSubmitButton();
  }

  public get mainContainer(): HTMLElement {
    return this._mainContainer;
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

  private static _preventSpacesInputs(input: HTMLInputElement): void {
    input.value = input.value.replace(AuthForm.SPACE_REGEX, '');
  }

  private static _updateErrorMessage(
    element: HTMLElement,
    messages: string[],
  ): void {
    element.textContent = messages.join(', ');
  }

  private static _createInput(
    id: AuthFormFields,
    type: InputTypes,
    placeholder: string,
  ): HTMLInputElement {
    const input = InputFactory.create(
      [style['auth-form__input'], style[`auth-form__input_${id}`]],
      type,
      id,
      placeholder,
    );

    const storedLogin = LocalStorage.getUserData(LocalStorageKeys.Login);
    input.value =
      id === AuthFormFields.Login && storedLogin !== null ? storedLogin : '';
    return input;
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
    input: HTMLElement,
    errorMessage: HTMLElement,
  ): HTMLElement {
    const wrapper = createElementWithClassId('div', [
      FLEX_CLASS,
      style['auth-form__input-label-wrapper'],
    ]);
    wrapper.append(AuthForm._createLabel(name), input, errorMessage);
    return wrapper;
  }

  private _implementEventListeners(): void {
    this._loginInput.addEventListener('input', this._handleLoginInput);
    this._passwordInput.addEventListener('input', this._handlePasswordInput);
    this._showPasswordButton.addEventListener(
      'click',
      this._togglePasswordInputType,
    );
    this._form.addEventListener('submit', this._handleFormSubmit);
  }

  private _createForm(): HTMLFormElement {
    const form = createElementWithClassId('form', [
      FLEX_CLASS,
      style['auth-form'],
    ]);

    form.append(
      AuthForm._createWrapper(
        AuthFormFields.Login,
        this._loginInput,
        this._loginErrorMessage,
      ),
      this._createPasswordWrapper(),
      this._submitButton,
      this._authErrorMessage,
    );

    return form;
  }

  private _createPasswordWrapper(): HTMLElement {
    const inputWrapper = createElementWithClassId('div', [
      style['auth-form__password-input-wrapper'],
      FLEX_CLASS,
    ]);
    inputWrapper.append(this._passwordInput, this._showPasswordButton);
    const passwordWrapper = AuthForm._createWrapper(
      AuthFormFields.Password,
      inputWrapper,
      this._passwordErrorMessage,
    );

    return passwordWrapper;
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
      LocalStorage.setUserData(LocalStorageKeys.Login, this._loginInput.value);
    }, AuthForm._TIMEOUT);
  };

  private _handlePasswordInput = (): void => {
    AuthForm._preventSpacesInputs(this._passwordInput);
    AuthForm._updateErrorMessage(this._passwordErrorMessage, []);
    clearTimeout(this._inputTimeout);

    this._inputTimeout = setTimeout(() => {
      this._validateField(
        this._passwordInput.value,
        AuthFormValidator.validatePassword,
        this._passwordErrorMessage,
        (isValid) => (this._isPasswordValid = isValid),
      );
      LocalStorage.setUserData(
        LocalStorageKeys.Password,
        this._passwordInput.value,
      );
    }, AuthForm._TIMEOUT);
  };

  private _inputsValidation(): void {
    if (this._loginInput.value) {
      this._validateField(
        this._loginInput.value,
        AuthFormValidator.validateLogin,
        this._loginErrorMessage,
        (isValid) => (this._isLoginValid = isValid),
      );
    }

    if (this._passwordInput.value) {
      this._validateField(
        this._passwordInput.value,
        AuthFormValidator.validatePassword,
        this._passwordErrorMessage,
        (isValid) => (this._isPasswordValid = isValid),
      );
    }
  }

  private _handleFormSubmit = (event: SubmitEvent): void => {
    event.preventDefault();

    this._inputsValidation();

    if (!(this._isLoginValid && this._isPasswordValid)) {
      return;
    }

    WebSocketService.loginUser(
      this._loginInput.value,
      this._passwordInput.value,
    )
      .then((user) => {
        AuthState.setUser(user, this._passwordInput.value);
        Router.navigateTo(Routes.Chat);
        this._cleanInputs();
      })
      .catch((error) => {
        AuthForm._updateErrorMessage(this._authErrorMessage, [error]);
      });
  };

  private _clearErrors(): void {
    AuthForm._updateErrorMessage(this._authErrorMessage, []);
    AuthForm._updateErrorMessage(this._loginErrorMessage, []);
    AuthForm._updateErrorMessage(this._passwordErrorMessage, []);
  }

  private _cleanInputs(): void {
    this._loginInput.value =
      LocalStorage.getUserData(LocalStorageKeys.Login) ?? '';
    this._passwordInput.value = '';
    this._isPasswordValid = false;
    this._updateSubmitButton();
    this._clearErrors();
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
      style['auth-form__toggle-password_shown'],
      isHidden,
    );
  };
}
