export type ButtonTypes = 'button' | 'submit' | 'reset';
export type InputTypes =
  | 'button'
  | 'checkbox'
  | 'color'
  | 'date'
  | 'datetime-local'
  | 'email'
  | 'file'
  | 'hidden'
  | 'image'
  | 'month'
  | 'number'
  | 'password'
  | 'radio'
  | 'range'
  | 'reset'
  | 'search'
  | 'submit'
  | 'tel'
  | 'text'
  | 'time'
  | 'url'
  | 'week';

export enum AuthFormFields {
  Login = 'login',
  Password = 'password',
  Search = 'search',
}

export type ValidatorResponse = {
  isValid: boolean;
  messages: string[];
};

export enum Routes {
  Authentication = 'authentication',
  Chat = 'chat',
  About = 'about',
}

export enum UserStatus {
  Online = 'online',
  Offline = 'offline',
}
