
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({
      status: "error",
      message: "Method not allowed"
    });
  }

  try {
    // Get username from request
    const username = req.query.username;

    if (!username || !username.trim()) {
      return res.status(400).json({
        status: "error",
        message: "Username is required"
      });
    }

    // Get Google Apps Script URL from Vercel environment variables
    const googleApi = process.env.GOOGLE_PUNISHMENT_API;

    if (!googleApi) {
      throw new Error("Google API URL is not configured");
    }

    // Add username to Google API request
    const url = new URL(googleApi);
    url.searchParams.set("username", username.trim());

    // Fetch punishment history
    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Google API returned HTTP ${response.status}`);
    }

    const result = await response.json();

    if (result.status !== "success") {
      throw new Error(result.message || "Google API error");
    }

    // Return only the requested user's records
    return res.status(200).json({
      status: "success",
      username: username.trim(),
      count: result.count,
      data: result.data
    });

  } catch (error) {
    console.error("Punishment API error:", error);

    return res.status(500).json({
      status: "error",
      message: "Unable to retrieve punishment history"
    });
  }
}
