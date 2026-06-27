const crypto = require('crypto');

const service = 's3';

function hash(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function hmac(key, value, encoding) {
  return crypto.createHmac('sha256', key).update(value).digest(encoding);
}

function getSigningKey(secretAccessKey, dateStamp, region) {
  const kDate = hmac(`AWS4${secretAccessKey}`, dateStamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, 'aws4_request');
}

function getS3Config() {
  const {
    AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY,
    AWS_SESSION_TOKEN,
    AWS_REGION,
    AWS_S3_BUCKET,
    AWS_S3_PUBLIC_BASE_URL
  } = process.env;

  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION || !AWS_S3_BUCKET) {
    const error = new Error('S3 is not configured');
    error.code = 'S3_NOT_CONFIGURED';
    throw error;
  }

  return {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
    sessionToken: AWS_SESSION_TOKEN,
    region: AWS_REGION,
    bucket: AWS_S3_BUCKET,
    publicBaseUrl: AWS_S3_PUBLIC_BASE_URL
  };
}

function sanitizeFilename(filename) {
  return String(filename || 'receipt.jpg')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/^_+/, '');
}

async function uploadReceipt({ fileBase64, filename, mimeType }) {
  const config = getS3Config();
  const buffer = Buffer.from(fileBase64, 'base64');
  const safeFilename = sanitizeFilename(filename);
  const key = `receipts/${Date.now()}_${crypto.randomUUID()}_${safeFilename}`;
  const host = `${config.bucket}.s3.${config.region}.amazonaws.com`;
  const url = `https://${host}/${key}`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStamp = amzDate.slice(0, 8);
  const payloadHash = hash(buffer);

  const headers = {
    host,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate
  };

  if (mimeType) {
    headers['content-type'] = mimeType;
  }

  if (config.sessionToken) {
    headers['x-amz-security-token'] = config.sessionToken;
  }

  const signedHeaderNames = Object.keys(headers).sort();
  const canonicalHeaders = signedHeaderNames
    .map((name) => `${name}:${headers[name]}\n`)
    .join('');
  const signedHeaders = signedHeaderNames.join(';');
  const canonicalRequest = [
    'PUT',
    `/${key}`,
    '',
    canonicalHeaders,
    signedHeaders,
    payloadHash
  ].join('\n');
  const credentialScope = `${dateStamp}/${config.region}/${service}/aws4_request`;
  const stringToSign = [
    'AWS4-HMAC-SHA256',
    amzDate,
    credentialScope,
    hash(canonicalRequest)
  ].join('\n');
  const signature = hmac(getSigningKey(config.secretAccessKey, dateStamp, config.region), stringToSign, 'hex');
  const authorization = `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      ...headers,
      Authorization: authorization
    },
    body: buffer
  });

  if (!response.ok) {
    const error = new Error(`S3 upload failed with status ${response.status}`);
    error.code = 'S3_UPLOAD_FAILED';
    error.details = await response.text().catch(() => '');
    throw error;
  }

  return {
    key,
    file_url: config.publicBaseUrl
      ? `${config.publicBaseUrl.replace(/\/$/, '')}/${key}`
      : url
  };
}

module.exports = {
  uploadReceipt
};
