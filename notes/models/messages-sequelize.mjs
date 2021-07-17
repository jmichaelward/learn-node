import Sequelize from 'sequelize';
import {
  connectDB as connectSequlz,
  close as closeSequlz,
} from './sequlz.mjs';
import EventEmitter from 'events';
import DBG from 'debug';

const debug = DBG('notes:model-messages');
const error = DBG('notes:error-messages');

class MessagesEmitter extends EventEmitter {}

export const emitter = new MessagesEmitter();

let sequelize;

export class SQMessage extends Sequelize.Model {}

async function connectDB() {
  if (sequelize) {
    return;
  }

  sequelize = await connectSequlz();

  SQMessage.init({
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        from: Sequelize.STRING,
        room: Sequelize.STRING,
        message: Sequelize.STRING(1024),
        timestamp: Sequelize.DATE,
      },
      {
        hooks: {
          afterCreate: (message, options) => {
            const toEmit = sanitizedMessage(message);
            emitter.emit('newmessage', toEmit);
          },
          afterDestroy: (message, options) => {
            emitter.emit('destroymessage', {
              id: message.id,
              namespace: message.namespace,
              room: message.room,
            });
          },
        },
        sequelize,
        modelName: 'SQMessage',
      });

  await SQMessage.sync();
}
