export function fmtQueryParams(obj: any): string {
  const keys = Object.keys(obj);
  let params = "";

  keys.forEach((prop, i) => {
    params += `${prop}=${encodeURIComponent(obj[prop])}`;

    if (i < keys.length) {
      params += "&";
    }
  });

  return params;
}