export class QuerySetter {
  private excluded: string[];

  exclude(params: string[]) {
    this.excluded = params;
  }

  getQueryParams(): { [key: string]: string } {
    const queryParams = new URLSearchParams(location.search);
    const entries = queryParams['entries']();

    const params = {};
    for (const entry of entries) {
      if (this.excluded?.includes(entry[0])) {
        return;
      }
      params[entry[0]] = entry[1];
    }
    return params;
  }

  removeQueryParams(query: { [key: string]: string }) {
    const queryParams = new URLSearchParams();
    Object.keys(query).forEach((key) => {
      if (this.excluded?.includes(key)) {
        return;
      }
      queryParams.delete(key);
    });
    window.history.replaceState({}, '', `${location.pathname}?${queryParams}`);
  }

  setQueryParams(query: { [key: string]: string }) {
    const queryParams = new URLSearchParams();
    Object.keys(query).forEach((key) => {
      if (this.excluded?.includes(key)) {
        return;
      }
      queryParams.set(key, query[key]);
    });
    window.history.replaceState({}, '', `${location.pathname}?${queryParams}`);
  }
}
