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

export type Message = {
  id: string;
  from: string;
  to: string;
  text: string;
  datetime: number;
  status: {
    isDelivered: boolean;
    isReaded: boolean;
    isEdited: boolean;
  };
};

export type MessageFromUserRequest = {
  id: string;
  type: RequestResponseTypes.MSG_FROM_USER;
  payload: {
    user: { login: string };
  };
};

export type MessageFromUserResponse = {
  id: string;
  type: RequestResponseTypes.MSG_FROM_USER;
  payload: {
    messages: Message[];
  };
};

export type MessageSendRequest = {
  id: string;
  type: RequestResponseTypes.MSG_SEND;
  payload: {
    message: {
      to: string;
      text: string;
    };
  };
};

export type MessageSendResponse = {
  id: string;
  type: RequestResponseTypes.MSG_SEND;
  payload: {
    message: Message;
  };
};

export type MessageReadRequest = {
  id: string;
  type: RequestResponseTypes.MSG_READED;
  payload: {
    message: { id: string };
  };
};

export type MessageReadResponse = {
  id: string;
  type: RequestResponseTypes.MSG_READED;
  payload: {
    message: {
      id: string;
      status: { isReaded: boolean };
    };
  };
};

export type MessageSendedFromServerResponse = {
  id: null;
  type: RequestResponseTypes.MSG_SENDED_FROM_SERVER;
  payload: {
    message: Message;
  };
};

export type MessageSendPush = {
  id: null;
  type: RequestResponseTypes.MSG_SEND;
  payload: {
    message: Message;
  };
};

export type UserExternalLoginResponse = {
  id: null;
  type: RequestResponseTypes.USER_EXTERNAL_LOGIN;
  payload: {
    user: LoginedUser;
  };
};

export type UserExternalLogoutResponse = {
  id: null;
  type: RequestResponseTypes.USER_EXTERNAL_LOGOUT;
  payload: {
    user: LoginedUser;
  };
};

export type MessageDeleteRequest = {
  id: string;
  type: RequestResponseTypes.MSG_DELETE;
  payload: { message: { id: string } };
};

export type MessageDeleteResponse = {
  id: string;
  type: RequestResponseTypes.MSG_DELETE;
  payload: {
    messageId: string;
  };
};

export type MessageDeletedFromServerResponse = {
  id: null;
  type: RequestResponseTypes.MSG_DELETED_FROM_SERVER;
  payload: {
    messageId: string;
  };
};

export type MessageEditRequest = {
  id: string;
  type: RequestResponseTypes.MSG_EDIT;
  payload: {
    message: { id: string; newText: string };
  };
};

export type MessageEditResponse = {
  id: string;
  type: RequestResponseTypes.MSG_EDIT;
  payload: {
    message: { id: string; text: string; datetime: number };
  };
};

export type MessageEditedFromServerResponse = {
  id: null;
  type: RequestResponseTypes.MSG_EDITED_FROM_SERVER;
  payload: {
    message: { id: string; text: string; datetime: number };
  };
};

export type ServerResponse =
  | AuthErrorResponse
  | AuthResponse
  | LogoutResponse
  | GetActiveUsersResponse
  | GetInactiveUsersResponse
  | MessageFromUserResponse
  | MessageSendResponse
  | MessageReadResponse
  | MessageSendedFromServerResponse
  | MessageSendPush
  | UserExternalLogoutResponse
  | UserExternalLoginResponse
  | MessageDeleteResponse
  | MessageDeleteResponse
  | MessageDeletedFromServerResponse
  | MessageEditResponse
  | MessageEditedFromServerResponse;
