export class ResponseData<D> {
  data: D | D[];
  statusCode: number;
  message: string;
  error?: any;

  constructor(
    data: D | D[],
    statusCode: number,
    message: string,
    error: any = null,
  ) {
    this.data = data;
    this.statusCode = statusCode;
    this.message = message;
    this.error = error;
    return this;
  }
}
