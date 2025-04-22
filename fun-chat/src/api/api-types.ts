type User = {
  login: string;
  password: string;
};

export enum RequestResponseTypes {
  Login = 'USER_LOGIN',
  Logout = 'USER_LOGOUT',
  USER_ACTIVE = 'USER_ACTIVE',
  USER_INACTIVE = 'USER_INACTIVE',
  MSG_FROM_USER = 'MSG_FROM_USER',
  MSG_SEND = 'MSG_SEND',
  MSG_READED = 'MSG_READ',
  MSG_DELETE = 'MSG_DELETE',
  MSG_EDIT = 'MSG_EDIT',

  // server
  USER_EXTERNAL_LOGIN = 'USER_EXTERNAL_LOGIN',
  USER_EXTERNAL_LOGOUT = 'USER_EXTERNAL_LOGOUT',
  MSG_READED_FROM_SERVER = 'MSG_READED_FROM_SERVER',
  MSG_DELETED_FROM_SERVER = 'MSG_DELETED_FROM_SERVER',
  MSG_EDITED_FROM_SERVER = 'MSG_EDITED_FROM_SERVER',
  MSG_SENDED_FROM_SERVER = 'MSG_SENDED_FROM_SERVER',
  MSG_DELIVERED = 'MSG_DELIVER',
  Error = 'ERROR',
}

export type LoginedUser = {
  login: string;
  isLogined: boolean;
};

export type AuthRequest = {
  id: string;
  type: RequestResponseTypes.Login;
  payload: {
    user: User;
  };
};

export type AuthResponse = {
  id: string;
  type: RequestResponseTypes.Login;
  payload: {
    user: LoginedUser;
  };
};

export type AuthErrorResponse = {
  id: string;
  type: RequestResponseTypes.Error;
  payload: {
    error: AuthErrorsMessages;
  };
};

export enum AuthErrorsMessages {
  alreadyLogged = 'A user with this login is already authorized',
  anotherLogged = 'Another user is already authorized in this connection',
  incorrectPassword = 'Incorrect password',
}

export type LogoutRequest = {
  id: string;
  type: RequestResponseTypes.Logout;
  payload: {
    user: User;
  };
};

export type LogoutResponse = {
  id: string;
  type: RequestResponseTypes.Logout;
  payload: {
    user: LoginedUser;
  };
};

// export type GetAuthorizedUsersRequest = {
//   id: string;
//   type: RequestResponseTypes.GET_AUTHORIZED_USERS;
// };

// export type GetAuthorizedUsersResponse = {
//   id: string;
//   type: RequestResponseTypes.GET_AUTHORIZED_USERS;
//   payload: {
//     users: LoginedUser[];
//   };
// };

export type GetActiveUsersRequest = {
  id: string;
  type: RequestResponseTypes.USER_ACTIVE;
  payload: null;
};

export type GetActiveUsersResponse = {
  id: string;
  type: RequestResponseTypes.USER_ACTIVE;
  payload: {
    users: LoginedUser[];
  };
};

export type GetInactiveUsersRequest = {
  id: string;
  type: RequestResponseTypes.USER_INACTIVE;
  payload: null;
};

export type GetInactiveUsersResponse = {
  id: string;
  type: RequestResponseTypes.USER_INACTIVE;
  payload: {
    users: LoginedUser[];
  };
};
