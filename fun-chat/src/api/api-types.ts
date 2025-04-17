type User = {
  login: string;
  password: string;
};

export type LoginedUser = {
  login: string;
  isLogined: boolean;
};

export type AuthRequest = {
  id: string;
  type: 'USER_LOGIN';
  payload: {
    user: User;
  };
};

export type AuthResponse = {
  id: string;
  type: 'USER_LOGIN';
  payload: {
    user: LoginedUser;
  };
};

export type AuthErrorResponse = {
  id: string;
  type: 'ERROR';
  payload: {
    error: AuthErrorsMessages;
  };
};

export enum AuthErrorsMessages {
  alreadyLogged = 'A user with this login is already authorized',
  anotherLogged = 'Another user is already authorized in this connection',
  incorrectPassword = 'Incorrect password',
}
