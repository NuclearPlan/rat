import { MessageTemplate } from './templates';
import { MessageType } from './types';

export interface Message<T extends MessageTemplate = MessageTemplate> {
  readonly _type: MessageType;
  readonly type: any;
  readonly data: T;
  _id?: number;
}

export function createMessage<T extends MessageTemplate>(_type: MessageType) {
  return class implements Message<T> {
    readonly _type: MessageType;
    readonly type: any;
    readonly data: T;
    _id?: number;

    constructor(data: T) {
      this._type = _type;
      this.type = _type;
      this.data = data;
    }
  };
}