import type { CredentialProvider, ResolvedCredential } from "../../domains/publication/ports/destination-publication-ports.js";

export class EnvironmentCredentialProvider implements CredentialProvider {
  public constructor(private readonly environment: NodeJS.ProcessEnv) {}
  public async resolve(source: "GOOGLE_APPLICATION_CREDENTIALS"): Promise<ResolvedCredential | undefined> {
    const value = this.environment[source]?.trim();
    return value ? Object.freeze({ source, secret: value }) : undefined;
  }
}
