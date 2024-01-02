import { SNSHandler } from "aws-lambda";
import { SES_EMAIL_FROM, SES_EMAIL_TO, SES_REGION } from "../env";
import { SESClient, SendEmailCommand, SendEmailCommandInput } from "@aws-sdk/client-ses";


const client = new SESClient({ region: SES_REGION });

export const handler: SNSHandler = async (event: any) => {
    console.log("Event ", event);
    
    for (const snsRecord of event.Records) {
      const snsMessage = JSON.parse(snsRecord.Sns.Message);
  
      if (snsMessage.Records) {
        console.log("SNS Record ", JSON.stringify(snsMessage));
  
        for (const messageRecord of snsMessage.Records) {
          const s3e = messageRecord.s3;
          const srcBucket = s3e.bucket.name;
          const srcKey = decodeURIComponent(s3e.object.key.replace(/\+/g, " "));
  
          try {
            const message = `Image received. URL ://${srcBucket}/${srcKey}`;
            await sendEmailMessage(message);
          } catch (error: unknown) {
            console.log("ERROR : ", error);
          }
        }
      }
    }
  };

  async function sendEmailMessage(message: string) {
    const parameters: SendEmailCommandInput = {
      Destination: {
        ToAddresses: [SES_EMAIL_TO],
      },
      Message: {
        Body: {
          Html: {
            Charset: "UTF-8",
            Data: `<html><body><p style="font-size:18px">${message}</p></body></html>`,
          },
        },
        Subject: {
          Charset: "UTF-8",
          Data: `New Image`,
        },
      },
      Source: SES_EMAIL_FROM,
    };
    await client.send(new SendEmailCommand(parameters));
  }