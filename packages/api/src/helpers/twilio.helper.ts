import { Response } from "express";

// Twilio Helper Functions

export const sendXMLResponse = (res: Response, data: string) => {
  res.set("Content-Type", "text/xml");
  res.send(data);
  res.end();

  // log response
  console.log("\n");
  console.log(data);
  console.log("\n");
};
