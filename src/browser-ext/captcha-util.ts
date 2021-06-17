declare const ___grecaptcha_cfg: any;


export function findReCaptchaParamateres()
{
  if (typeof (___grecaptcha_cfg) === 'undefined')
  {
    return null;
  }

  const allParams = Object.entries(___grecaptcha_cfg.clients).map(([cid, client]: any) =>
  {
    const data: any = { id: cid, version: cid >= 10000 ? 'V3' : 'V2' };
    const objects = Object.entries(client).filter(([_, value]) => value && typeof value === 'object');

    objects.forEach(([toplevelKey, toplevel]) =>
    {
      const found = Object.entries(toplevel).find(([_, value]) => (
        value && typeof value === 'object' && 'sitekey' in value && 'size' in value
      ));

      if (typeof toplevel === 'object' && toplevel instanceof HTMLElement && toplevel['tagName'] === 'DIV')
      {
        data.pageurl = toplevel.baseURI;
      }

      if (found)
      {
        const [sublevelKey, sublevel] = found;

        data.sitekey = sublevel.sitekey;
        const callbackKey = data.version === 'V2'? 'callback': 'promise-callback';
        const callback = sublevel[callbackKey];

        if (!callback)
        {
          data.callback = null;
          data.function = null;
        }
        else
        {
          data.function = callback;

          const keys = [cid, toplevelKey, sublevelKey, callbackKey].map((key) => `['${key}']`).join('');

          data.callback = `___grecaptcha_cfg.clients${keys}`;
        }
      }
    });

    return data;
  });

  if (!Array.isArray(allParams))
  {
    return null;
  }

  let selected: any = null;
  let maxFunLen = 0;

  for (let params of allParams)
  {
    if (typeof(params) !== "object" || typeof(params.callback) !== "string" ||
        typeof(params.callback) !== "string" || typeof(params.sitekey) !== "string" ||
        typeof(params.pageurl) !== "string")
    {
      continue;
    }

    try
    {
      const funLen = eval(params.callback+".toString().length");

      if (funLen > maxFunLen)
      {
        selected = params;
        maxFunLen = funLen;
      }
    }
    catch (error) {}
  }

  return selected;
}
