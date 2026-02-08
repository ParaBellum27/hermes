/**
 * Client for AI extraction API endpoints
 */

export interface ExtractFieldValueRequest {
  transcript: string;
  fieldLabel: string;
}

export interface ExtractFieldValueResponse {
  value: string;
}

class ExtractionClient {
  async extractFieldValue(transcript: string, fieldLabel: string): Promise<string> {
    const response = await fetch("/api/extract-field-value", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        transcript,
        fieldLabel,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const data: ExtractFieldValueResponse = await response.json();
    return data.value;
  }
}

export const extractionClient = new ExtractionClient();
