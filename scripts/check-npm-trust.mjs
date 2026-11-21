import { readFileSync } from 'node:fs';

const { ACTIONS_ID_TOKEN_REQUEST_URL, ACTIONS_ID_TOKEN_REQUEST_TOKEN } =
  process.env;
if (!ACTIONS_ID_TOKEN_REQUEST_URL || !ACTIONS_ID_TOKEN_REQUEST_TOKEN) {
  throw new Error('Run in a GitHub Actions job with id-token: write.');
}

const audience = 'npm:registry.npmjs.org';
const oidcUrl = new URL(ACTIONS_ID_TOKEN_REQUEST_URL);
oidcUrl.searchParams.set('audience', audience);
const oidcResponse = await fetch(oidcUrl, {
  headers: { Authorization: `Bearer ${ACTIONS_ID_TOKEN_REQUEST_TOKEN}` },
  signal: AbortSignal.timeout(15_000),
});
if (!oidcResponse.ok) {
  throw new Error(
    `GitHub did not issue an ID token (HTTP ${oidcResponse.status}).`,
  );
}
const { value: idToken } = await oidcResponse.json();
if (typeof idToken !== 'string' || idToken.split('.').length !== 3) {
  throw new Error('GitHub returned an invalid ID token.');
}
const { sub, workflow_ref } = JSON.parse(
  Buffer.from(idToken.split('.')[1], 'base64url').toString('utf8'),
);
console.log(`GitHub subject: ${sub}\nGitHub workflow: ${workflow_ref}`);

const packages = ['tokens', 'svelte', 'react-native', 'starlight'];
for (const directory of packages) {
  const { name } = JSON.parse(
    readFileSync(
      new URL(`../packages/${directory}/package.json`, import.meta.url),
    ),
  );
  const packagePath = name.replace('/', '%2f');
  const response = await fetch(
    `https://registry.npmjs.org/-/npm/v1/oidc/token/exchange/package/${packagePath}`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${idToken}` },
      signal: AbortSignal.timeout(15_000),
    },
  );
  const result = await response.json().catch(() => ({}));
  if (response.ok && typeof result.token === 'string' && result.token) {
    console.log(`${name}: npm accepted the OIDC exchange`);
  } else {
    const reason = String(
      result.message ?? result.error ?? 'No registry reason',
    )
      .replaceAll(idToken, '[redacted]')
      .replaceAll(ACTIONS_ID_TOKEN_REQUEST_TOKEN, '[redacted]')
      .replace(/[\r\n\x1b]/g, ' ')
      .slice(0, 240);
    console.error(
      `${name}: npm exchange rejected (HTTP ${response.status}): ${reason}`,
    );
    process.exitCode = 1;
  }
}
