const DEFAULT_ERROR = "Não foi possível completar a requisição.";

const normalizeBase = (baseUrl = "") => baseUrl.replace(/\/$/, "");

const shouldTreatAsFormData = (body) => typeof FormData !== "undefined" && body instanceof FormData;

const parseResponse = async (response) => {
  const contentType = response.headers.get("Content-Type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  const text = await response.text();
  return text ? { detail: text } : null;
};

export function createHttpClient({ baseUrl, refreshPath, getTokens, setTokens } = {}) {
  const normalizedBase = normalizeBase(baseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "");

  const withBase = (path) => {
    if (!path) {
      throw new Error("Path obrigatório");
    }
    if (path.startsWith("http")) {
      return path;
    }
    if (!path.startsWith("/")) {
      throw new Error("Os caminhos devem começar com '/'");
    }
    return `${normalizedBase}${path}`;
  };

  const refreshTokens = async () => {
    if (!refreshPath || !getTokens || !setTokens) {
      return null;
    }
    const currentTokens = getTokens();
    if (!currentTokens?.refresh) {
      return null;
    }

    const response = await fetch(withBase(refreshPath), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: currentTokens.refresh }),
    });

    if (!response.ok) {
      setTokens(null);
      return null;
    }

    const data = await response.json();
    const nextTokens = {
      access: data.access,
      refresh: data.refresh ?? currentTokens.refresh,
    };
    setTokens(nextTokens);
    return nextTokens;
  };

  const request = async (path, options = {}) => {
    const {
      method = "GET",
      body,
      headers: customHeaders = {},
      auth = true,
      token,
      retry = true,
      ...rest
    } = options;

    const headers = new Headers(customHeaders);
    let finalBody = body;

    if (body && !shouldTreatAsFormData(body)) {
      headers.set("Content-Type", "application/json");
      finalBody = JSON.stringify(body);
    }

    if (auth && (token || getTokens)) {
      const authToken = token || getTokens?.()?.access;
      if (authToken) {
        headers.set("Authorization", `Bearer ${authToken}`);
      }
    }

    const response = await fetch(withBase(path), {
      method,
      body: finalBody,
      headers,
      ...rest,
    });

    if (response.status === 401 && auth && retry && refreshPath) {
      const refreshed = await refreshTokens();
      if (refreshed?.access) {
        return request(path, { ...options, retry: false });
      }
    }

    if (!response.ok) {
      const errorData = await parseResponse(response);
      const detail = errorData?.detail || errorData?.error || DEFAULT_ERROR;
      throw new Error(detail);
    }

    if (response.status === 204) {
      return null;
    }

    return parseResponse(response);
  };

  return { request };
}
