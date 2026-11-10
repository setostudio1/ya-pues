export type User = {
  id: string;
  name: string;
  email: string;
};

export type Account = User & {
  salt: string;
  passwordHash: string;
  createdAt: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegistrationInput = LoginInput & {
  name: string;
  confirmPassword: string;
};
