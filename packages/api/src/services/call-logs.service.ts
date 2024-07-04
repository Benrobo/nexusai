import { RESPONSE_CODE } from "../types/index.js";
import HttpException from "../lib/exception.js";
import type {
  AddCallLogMessage,
  CreateCallLogProps,
} from "../types/call-log.type.js";
import prisma from "../prisma/prisma.js";

interface ICallLogsService {}

export default class CallLogsService {
  constructor() {}

  public async getCallLogs(): Promise<any> {
    // get all call logs
  }

  public async getCallLogById({ refId }: { refId: string }) {
    // get call log by id
    const log = await prisma.callLogs.findFirst({
      where: {
        refId: refId,
      },
      include: {
        messages: true,
      },
    });

    return log;
  }

  public async addCallLogMessages(props: AddCallLogMessage) {
    const { refId, messages } = props.data;

    // check if call log exists with refId
    const log = await prisma.callLogs.findFirst({
      where: {
        refId,
      },
    });

    if (!log) {
      throw new HttpException(
        RESPONSE_CODE.NOT_FOUND,
        "Call log not found, failed to add log",
        404
      );
    }

    if (!messages.length) {
      throw new HttpException(
        RESPONSE_CODE.BAD_REQUEST,
        "No messages to add to call log",
        400
      );
    }

    // add call log message
    let logMessage;
    for (const msg of messages) {
      logMessage = await prisma.callLogsMessages.create({
        data: {
          call_log_id: log.id,
          fromId: log.from_number,
          toId: log.to_number,
          entity_type: msg.entity_type,
          content: msg.message,
        },
      });
    }
    return logMessage;
  }

  public async createCallLog(props: CreateCallLogProps) {
    const {
      refId,
      agentId,
      userId,
      caller_number,
      called_number,
      country_code,
      city,
      zipcode,
    } = props.data;

    // create call log
    const log = await prisma.callLogs.create({
      data: {
        refId,
        agentId,
        userId,
        from_number: caller_number,
        to_number: called_number,
        caller_city: city,
        caller_country: country_code,
        zip_code: zipcode,
      },
    });

    return log;
  }

  public async getCallLogEntry({ refId }: { refId: string }) {
    const log = await prisma.callLogEntry.findFirst({
      where: {
        refId,
      },
    });

    return log;
  }

  public async addCallLogEntry(props: {
    refId: string;
    callReason?: string;
    callerName?: string;
    referral?: string;
    message?: string;
  }) {
    const { refId, callReason, callerName, referral, message } = props;

    // check if call log exists with refId
    const log = await prisma.callLogEntry.findFirst({
      where: {
        refId,
      },
    });

    if (log) {
      // update
      await prisma.callLogEntry.update({
        where: {
          refId,
        },
        data: {
          callReason: callReason,
          callerName: callerName,
          referral,
          message,
        },
      });
    } else {
      // create
      await prisma.callLogEntry.create({
        data: {
          refId,
          callReason: callReason,
          callerName: callerName,
          referral,
          message,
        },
      });
    }
  }
}
