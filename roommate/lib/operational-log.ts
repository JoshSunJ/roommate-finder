type OperationalValue = string | number | boolean | null | undefined;

export type OperationalAttributes = Record<string, OperationalValue>;

function record(event: string, attributes: OperationalAttributes) {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    event,
    ...Object.fromEntries(
      Object.entries(attributes).filter(([, value]) => value !== undefined),
    ),
  });
}

export function logOperationalInfo(event: string, attributes: OperationalAttributes = {}) {
  console.info(record(event, attributes));
}

export function logOperationalError(event: string, attributes: OperationalAttributes = {}) {
  console.error(record(event, attributes));
}
