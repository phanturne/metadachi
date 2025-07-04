# Firecrawl Integration for Metadachi

This document explains how to set up and use Firecrawl for enhanced web page text extraction in Metadachi.

## Overview

Firecrawl is a web scraping service that provides better content extraction than simple `fetch()` requests. This integration uses the **Firecrawl v1 API** for enhanced features. It can handle:

- JavaScript-rendered content
- Dynamic content loading
- Anti-bot protection
- Content cleaning and formatting
- Metadata extraction
- Markdown formatting support
- Link and image extraction

## Setup

### 1. Get a Firecrawl API Key

1. Sign up at [Firecrawl](https://firecrawl.dev)
2. Create an API key in your dashboard
3. Add the API key to your environment variables:

```bash
# .env.local or your deployment environment
FIRECRAWL_API_KEY=your_firecrawl_api_key_here
```

### 2. Environment Variables

Add the following to your environment configuration:

```bash
# Required for Firecrawl integration
FIRECRAWL_API_KEY=your_api_key_here

# Optional: Configure Firecrawl base URL (defaults to https://api.firecrawl.dev)
FIRECRAWL_BASE_URL=https://api.firecrawl.dev
```

## Usage

### Basic Usage

The `extractTextFromUrl` function automatically uses Firecrawl when configured:

```typescript
import { extractTextFromUrl } from '@/app/lib/summarize';

// Basic usage - automatically uses Firecrawl if configured
const content = await extractTextFromUrl('https://example.com/article');
```

### Advanced Configuration

You can customize the Firecrawl v1 behavior with options:

```typescript
const content = await extractTextFromUrl('https://example.com/article', {
  onlyMainContent: true, // Extract only main content, skip navigation/ads
  includeMetadata: true, // Include page metadata (title, description, etc.)
  waitFor: 3000, // Wait for dynamic content to load (ms)
  extractText: true, // Extract text content
  skipImages: true, // Skip image processing
  maxRetries: 3, // Number of retry attempts
  format: 'text', // 'text' or 'markdown'
});
```

## Configuration Options

| Option            | Type                     | Default  | Description                                        |
| ----------------- | ------------------------ | -------- | -------------------------------------------------- |
| `onlyMainContent` | boolean                  | `true`   | Extract only main content, skip navigation/ads     |
| `includeMetadata` | boolean                  | `true`   | Include page metadata (title, description, author) |
| `waitFor`         | number                   | `2000`   | Wait time for dynamic content (milliseconds)       |
| `extractText`     | boolean                  | `true`   | Extract text content from the page                 |
| `skipImages`      | boolean                  | `true`   | Skip image processing for faster extraction        |
| `maxRetries`      | number                   | `2`      | Number of retry attempts on failure                |
| `format`          | `'text'` \| `'markdown'` | `'text'` | Output format (text or markdown)                   |

## Fallback Behavior

The integration includes robust fallback behavior:

1. **No API Key**: Falls back to simple `fetch()` if `FIRECRAWL_API_KEY` is not configured
2. **API Errors**: Falls back to simple `fetch()` if Firecrawl API fails
3. **No Content**: Falls back to simple `fetch()` if Firecrawl returns no content
4. **Retry Logic**: Automatically retries failed requests with exponential backoff
5. **Error Handling**: Graceful handling of various error conditions

## Error Handling

The integration handles various error scenarios:

- **Invalid URLs**: Throws error for malformed URLs
- **Network Errors**: Retries with exponential backoff
- **API Errors**: Falls back to simple fetch for 4xx errors, retries for 5xx errors
- **No Content**: Falls back to simple fetch if no content is extracted

## Performance Considerations

### When to Use Firecrawl

**Use Firecrawl for:**

- JavaScript-heavy websites
- Single-page applications (SPAs)
- Sites with dynamic content loading
- Pages with anti-bot protection
- Sites that require proper user agents

**Use Fallback for:**

- Simple static HTML pages
- When Firecrawl API is unavailable
- When you want to minimize API costs

### Rate Limiting

Firecrawl has its own rate limits. The integration includes:

- Exponential backoff for retries
- Configurable retry attempts
- Graceful fallback to simple fetch

## Cost Optimization

To optimize costs:

1. **Use fallback for simple sites**: The integration automatically falls back to simple `fetch()` when Firecrawl fails
2. **Configure retry limits**: Set `maxRetries` to 1 or 2 for non-critical content
3. **Monitor usage**: Check your Firecrawl dashboard for usage statistics

## Troubleshooting

### Common Issues

1. **"Firecrawl API key not configured"**

   - Ensure `FIRECRAWL_API_KEY` is set in your environment variables
   - Check that the API key is valid

2. **"All Firecrawl attempts failed"**

   - Check your internet connection
   - Verify the Firecrawl API is accessible
   - Check your API key permissions

3. **"No content found in Firecrawl response"**
   - The page might be blocking automated access
   - Try adjusting the `waitFor` option
   - Check if the URL is accessible

### Debugging

Enable detailed logging by checking the console for:

- Firecrawl API responses
- Retry attempts
- Fallback behavior
- Error messages

## Migration from Simple Fetch

The integration is designed to be a drop-in replacement for the existing `extractTextFromUrl` function. No changes are required to existing code - it will automatically use Firecrawl when configured and fall back to the original behavior when not.

## API Reference

### `extractTextFromUrl(url: string, options?: FirecrawlV1Options): Promise<string>`

Extracts text content from a URL using Firecrawl v1 API with fallback to simple fetch.

**Parameters:**

- `url`: The URL to extract content from
- `options`: Optional configuration for Firecrawl behavior

**Returns:** Promise<string> - The extracted text content

**Throws:** Error if URL is invalid or content extraction fails
