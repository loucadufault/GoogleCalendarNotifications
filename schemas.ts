import * as coda from "@codahq/packs-sdk";


export const reminderSchema = coda.makeObjectSchema({
  type: coda.ValueType.Object,
  properties: {
    method: { type: coda.ValueType.String },
    minutes: { type: coda.ValueType.Number },
  },
});
