interface Env {
  AVATARS: R2Bucket;
  BADGES: R2Bucket;
  ICONS: R2Bucket;
  PLACEHOLDERS: R2Bucket;
  UTILITY: R2Bucket;
}

const CACHE_CONTROL = "public, max-age=31536000, immutable";

const BUCKETS: Record<string, keyof Env> = {
  avatars: "AVATARS",
  badges: "BADGES",
  icons: "ICONS",
  placeholders: "PLACEHOLDERS",
  utility: "UTILITY",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const segments = url.pathname.split("/").filter(Boolean);

    if (segments.length < 2) {
      return new Response("Not found", { status: 404 });
    }

    const [kind, ...keyParts] = segments;
    const bucketBinding = BUCKETS[kind];

    if (!bucketBinding) {
      return new Response("Not found", { status: 404 });
    }

    const key = keyParts.join("/");
    if (!key) {
      return new Response("Not found", { status: 404 });
    }

    const object = await env[bucketBinding].get(key);
    if (!object) {
      return new Response("Not found", { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("cache-control", CACHE_CONTROL);

    return new Response(object.body, { headers });
  },
};
