export const SECOND  = 1000;
export const SECONDS = SECOND;
export const MINUTE  = 60*SECOND;
export const MINUTES = MINUTE;
export const HOUR    = 60*MINUTE;
export const HOURS   = HOUR;


export function sleep(ms: number)
{
  return new Promise(resolve => setTimeout(resolve, ms));
}


export function untilCondition(fun: () => boolean, timeout: number = 5000): Promise<boolean>
{
  return new Promise((resolve, reject) =>
  {
    if (fun())
    {
      resolve(true);
      return;
    }

    let intervalId: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;

    intervalId = setInterval(() =>
    {
      if (fun())
      {
        clearTimeout(timeoutId);
        clearInterval(intervalId);
        resolve(true);
      }
    }, 200);

    if (timeout)
    {
      timeoutId = setTimeout(() =>
      {
        clearInterval(intervalId);
        reject(new Error('waiting until a condition is fulfilled, timeout reached'));
      }, timeout);
    }
  });
}


export function untilEquals(value: any, fun: () => boolean, timeout: number = 5000)
{
  return untilCondition(() => fun() === value, timeout);
}


export function untilNotEquals(value: any, fun: () => boolean, timeout: number = 5000)
{
  return untilCondition(() => fun() !== value, timeout);
}


export function untilTrue(fun: () => boolean, timeout: number = 5000)
{
  return untilEquals(true, fun, timeout);
}


export function untilNotNull(fun: () => any, timeout: number = 5000)
{
  return untilNotEquals(null, fun, timeout);
}
