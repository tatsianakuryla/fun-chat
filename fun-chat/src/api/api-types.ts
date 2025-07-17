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
  MSG_READ = 'MSG_READ',
  MSG_DELETE = 'MSG_DELETE',
  MSG_EDIT = 'MSG_EDIT',

  USER_EXTERNAL_LOGIN = 'USER_EXTERNAL_LOGIN',
  USER_EXTERNAL_LOGOUT = 'USER_EXTERNAL_LOGOUT',
  Error = 'ERROR',
}

export type LoginUser = {
  login: string;
  isLogin: boolean;
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
    user: LoginUser;
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
    user: LoginUser;
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
    users: LoginUser[];
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
    users: LoginUser[];
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
    isRead: boolean;
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

export type MessageSendBroadcast = {
  id: null;
  type: RequestResponseTypes.MSG_SEND;
  payload: {
    message: Message;
  };
};

export type MessageReadRequest = {
  id: string;
  type: RequestResponseTypes.MSG_READ;
  payload: { message: { id: string } };
};

export type MessageReadResponse = {
  id: string;
  type: RequestResponseTypes.MSG_READ;
  payload: {
    message: { id: string; status: { isRead: boolean } };
  };
};

export type MessageReadBroadcast = {
  id: null;
  type: RequestResponseTypes.MSG_READ;
  payload: {
    message: { id: string; status: { isRead: boolean } };
  };
};

export type UserExternalLoginResponse = {
  id: null;
  type: RequestResponseTypes.USER_EXTERNAL_LOGIN;
  payload: {
    user: LoginUser;
  };
};

export type UserExternalLogoutResponse = {
  id: null;
  type: RequestResponseTypes.USER_EXTERNAL_LOGOUT;
  payload: {
    user: LoginUser;
  };
};

export type MessageDeleteResponse = {
  id: string;
  type: RequestResponseTypes.MSG_DELETE;
  payload: {
    message: {
      id: string;
      status: { isDeleted: boolean };
    };
  };
};

export type MessageDeleteBroadcast = {
  id: null;
  type: RequestResponseTypes.MSG_DELETE;
  payload: {
    message: {
      id: string;
      status: { isDeleted: boolean };
    };
  };
};

export type MessageEditRequest = {
  id: string;
  type: RequestResponseTypes.MSG_EDIT;
  payload: { message: { id: string; text: string } };
};

export type MessageEditResponse = {
  id: string;
  type: RequestResponseTypes.MSG_EDIT;
  payload: { message: Message };
};

export type MessageEditBroadcast = {
  id: null;
  type: RequestResponseTypes.MSG_EDIT;
  payload: {
    message: {
      id: string;
      text: string;
      status: { isEdited: boolean };
      datetime: number;
    };
  };
};

type AuthResponses =
  | AuthErrorResponse
  | AuthResponse
  | LogoutResponse
  | UserExternalLoginResponse
  | UserExternalLogoutResponse;

type UserResponses = GetActiveUsersResponse | GetInactiveUsersResponse;

type MessageUserResponses =
  | MessageFromUserResponse
  | MessageSendResponse
  | MessageReadResponse
  | MessageEditResponse
  | MessageDeleteResponse;

type MessageBroadcastResponses =
  | MessageSendBroadcast
  | MessageReadBroadcast
  | MessageEditBroadcast
  | MessageDeleteBroadcast;

export type ServerResponse =
  | AuthResponses
  | UserResponses
  | MessageUserResponses
  | MessageBroadcastResponses;
