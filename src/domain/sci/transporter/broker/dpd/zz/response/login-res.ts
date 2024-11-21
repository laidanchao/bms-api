export class LoginRes {
  code: string;
  data: LoginResData;
  msg: string;
}

export class LoginResData {
  timestamp: number;
  token: string;
  timeDifference: number;
}
