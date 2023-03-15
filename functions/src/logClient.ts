export const project = "jameelahs-functions";

const createLogger = function(req:any, res:any, next:any) {
  // Add log correlation to nest all log messages beneath request log in Log Viewer.
  // (This only works for HTTP-based invocations where `req` is defined.)
  if (typeof req !== "undefined") {
    const traceHeader = req.header("X-Cloud-Trace-Context");
    if (traceHeader && project) {
      const [trace] = traceHeader.split("/");
      globalLogFields[
          "logging.googleapis.com/trace"
      ] = `projects/${project}/traces/${trace}`;
    }
  }
  // log("firebase-functions", "NOTICE", "Logger Created by Req:", req.body);
};

export const globalLogFields:any = {};

const log = function(component:string, severity: string, message: string, data?:any) {
  const dataStr = data ? JSON.stringify(data): "";

  // Complete a structured log entry.
  const entry = Object.assign(
      {
        severity: severity,
        message: `${message}, data:${dataStr}`,
        // Log viewer accesses 'component' as 'jsonPayload.component'.
        component: component,
      },
      globalLogFields
  );

  // Serialize to a JSON string and output.
  console.log(JSON.stringify(entry));
};


export {createLogger, log};
