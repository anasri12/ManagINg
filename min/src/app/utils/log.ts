import { LogInterface } from "../zods/db/log";

async function logAPIUsage(payload: LogInterface["post"]) {
  try {
    await fetch("/api/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error("Failed to log API usage:", error);
  }
}

// utils/fetchWithLogging.ts

type FetchOptions = Omit<RequestInit, "body"> & { body?: any };

export async function fetchWithLogging<T>(
  url: string,
  options: FetchOptions,
  userId: string
): Promise<T> {
  const { method = "GET", body, ...rest } = options;

  const start = performance.now(); // Start timing the request
  let status: number | null = null;

  try {
    console.log("Fetching URL:", url, "Method:", method, "Body:", body);

    const response = await fetch(url, {
      ...rest,
      method,
      headers: {
        "Content-Type": "application/json",
        ...(rest.headers || {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    status = response.status; // Capture the response status
    const responseBody = await response.json();

    console.log("Response:", responseBody);
    return responseBody;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  } finally {
    const end = performance.now(); // End timing the request
    const responseTime = Math.round(end - start);

    // Log the API usage
    await fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        User_ID: userId,
        Endpoint: url,
        Method: method,
        Status: status ?? 500, // Default to 500 if status is null
        Response_Time: responseTime,
      }),
    });
  }
}
