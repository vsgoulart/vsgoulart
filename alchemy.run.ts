// alchemy.run.ts
import * as Alchemy from "alchemy";
import { adopt } from "alchemy/AdoptPolicy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";

export default Alchemy.Stack(
  "PersonalWebsite",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const zone = yield* Cloudflare.Zone.Zone("Domain", {
      name: "goulart.dev",
    }).pipe(adopt(true));

    yield* Cloudflare.Zone.Zone("DomainVsgoulartCom", {
      name: "vsgoulart.com",
    }).pipe(adopt(true));

    yield* Cloudflare.Zone.Zone("DomainGoulartCodes", {
      name: "goulart.codes",
    }).pipe(adopt(true));

    const assets = yield* Cloudflare.R2.Bucket("Assets");

    const site = yield* Cloudflare.Worker("Site", {
      assets: {
        directory: "./public",
        notFoundHandling: "404-page",
      },
      domain: {
        name: "goulart.dev",
        redirects: [
          "www.goulart.dev",
          "vsgoulart.com",
          "www.vsgoulart.com",
          "goulart.codes",
          "www.goulart.codes",
        ],
      },
    });

    return {
      url: site.url,
      domain: zone.name,
      zoneStatus: zone.status,
      assetsBucketName: assets.bucketName,
    };
  }),
);
