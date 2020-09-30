export class QuerySetter {
  getQueryParams(): { [key: string]: string } {
    const queryParams = new URLSearchParams(location.search);
    const entries = queryParams['entries']();

    const params = {};
    for (const entry of entries) {
      params[entry[0]] = entry[1];
    }
    return params;
  }

  setQueryParams(query: { [key: string]: string }) {
    const queryParams = new URLSearchParams(location.search);
    Object.keys(query).forEach((key) => {
      queryParams.set(key, query[key]);
    });
    window.history.replaceState({}, '', `${location.pathname}?${queryParams.toString()}`);
  }
}
