import { ValidatorResponse } from '../../types';

export class AuthFormValidator {
  private static readonly MIN_LOGIN_LENGTH = 3;
  private static readonly MIN_PASSWORD_LENGTH = 6;

  private static readonly _ERRORS = {
    login: {
      length: `Login must be at least ${AuthFormValidator.MIN_LOGIN_LENGTH} characters`,
      cyrillic: 'Please use Latin letters only',
    },
    password: {
      length: `Password must be at least ${AuthFormValidator.MIN_PASSWORD_LENGTH} characters`,
      letter: 'Password must contain at least one Latin letter',
      number: 'Password must contain at least one number',
      cyrillic: 'Please use Latin letters only',
    },
  };

  private static readonly CYRILLIC_REGEX = /[а-яА-ЯёЁ]/;
  private static readonly LATIN_LETTER_REGEX = /[a-zA-Z]/;
  private static readonly DIGIT_REGEX = /\d/;

  public static validateLogin(value: string): ValidatorResponse {
    const messages: string[] = [];

    if (value.length < AuthFormValidator.MIN_LOGIN_LENGTH) {
      messages.push(AuthFormValidator._ERRORS.login.length);
    }

    if (AuthFormValidator.CYRILLIC_REGEX.test(value)) {
      messages.push(AuthFormValidator._ERRORS.login.cyrillic);
    }

    return {
      isValid: messages.length === 0,
      messages,
    };
  }

  public static validatePassword(value: string): ValidatorResponse {
    const messages: string[] = [];

    if (value.trim().length < AuthFormValidator.MIN_PASSWORD_LENGTH) {
      messages.push(AuthFormValidator._ERRORS.password.length);
    }

    if (AuthFormValidator.CYRILLIC_REGEX.test(value)) {
      messages.push(AuthFormValidator._ERRORS.password.cyrillic);
    }

    if (!AuthFormValidator.LATIN_LETTER_REGEX.test(value)) {
      messages.push(AuthFormValidator._ERRORS.password.letter);
    }

    if (!AuthFormValidator.DIGIT_REGEX.test(value)) {
      messages.push(AuthFormValidator._ERRORS.password.number);
    }

    return {
      isValid: messages.length === 0,
      messages,
    };
  }
}
