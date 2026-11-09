export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      status: "error",
      message: "Method not allowed"
    });
  }

  try {
    const username = req.query.username?.trim();

    if (!username) {
      return res.status(400).json({
        status: "error",
        message: "Username is required."
      });
    }

    // Your Google Apps Script URL
    const GOOGLE_API =
      "https://script.google.com/macros/s/AKfycbxEFGA5CCM7fI1hMPiVnwbLi16AvsAkc1BGkfDu0rAZuXCp2FGVWlM0epzvqaNfg3c-/exec";

    const url = new URL(GOOGLE_API);
    url.searchParams.set("username", username);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`Google API error: ${response.status}`);
    }

    const result = await response.json();

    if (result.status !== "success") {
      throw new Error(result.message || "Google API failed.");
    }

    const records = (result.data || []).filter(record =>
      String(record.username || "").trim().toLowerCase() ===
      username.toLowerCase()
    );

    return res.status(200).json({
      status: "success",
      username: username,
      count: records.length,
      data: records
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      status: "error",
      message: error.message
    });
  }
}
