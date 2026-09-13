import { DestinationPublicationConflictError, DestinationPublicationValidationError, type StaticPortfolioPublicationRequest } from "../domain/destination-publication.js";
import type { CredentialProvider, DestinationPublisher, PublicationDigester, PublicationLedger, StaticPortfolioReader } from "../ports/destination-publication-ports.js";

export class PublishCareerPortfolio {
  public constructor(
    private readonly portfolios: StaticPortfolioReader,
    private readonly credentials: CredentialProvider,
    private readonly publisher: DestinationPublisher,
    private readonly ledger: PublicationLedger,
    private readonly digester: PublicationDigester,
  ) {}

  public async execute(request: StaticPortfolioPublicationRequest) {
    if (!request.confirmed) throw new DestinationPublicationValidationError("Explicit public publication confirmation is required.");
    if (request.idempotencyKey.trim().length === 0) throw new DestinationPublicationValidationError("Idempotency key must not be empty.");
    if (request.destination.requestedVisibility !== "public") {
      throw new DestinationPublicationValidationError("This static hosting adapter supports public visibility only.");
    }
    if (!["preview-channel", "live"].includes(request.destination.mode)) {
      throw new DestinationPublicationValidationError("Unknown Firebase Hosting publication mode.");
    }
    if (!/^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(request.destination.projectId)) {
      throw new DestinationPublicationValidationError("Project ID must be a valid Firebase project ID.");
    }
    if (!/^[a-z0-9](?:[a-z0-9-]{0,28}[a-z0-9])?$/.test(request.destination.siteId)) {
      throw new DestinationPublicationValidationError("Hosting site ID must be a valid hostname label of at most 30 characters.");
    }
    if (request.destination.mode === "preview-channel" && !request.destination.channel?.trim()) {
      throw new DestinationPublicationValidationError("A preview channel name is required.");
    }
    if (request.destination.channel && !/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(request.destination.channel)) {
      throw new DestinationPublicationValidationError("Preview channel contains unsupported characters.");
    }
    if (request.destination.expires && !/^\d+[dhw]$/.test(request.destination.expires)) {
      throw new DestinationPublicationValidationError("Preview expiry must use a bounded duration such as 7d.");
    }
    const fingerprint = this.digester.sha256(JSON.stringify({ portfolioDirectory: request.portfolioDirectory,
      manifest: request.manifest, destination: request.destination, credentialSource: request.credentialSource }));
    const existing = await this.ledger.find(request.idempotencyKey);
    if (existing !== undefined) {
      if (existing.fingerprint !== fingerprint) {
        throw new DestinationPublicationConflictError("Idempotency key was already used for a different publication request.");
      }
      return Object.freeze({ publication: existing.result, reused: true });
    }
    const validation = await this.portfolios.validate(request.portfolioDirectory, request.manifest);
    if (!validation.valid) throw new DestinationPublicationValidationError(`Portfolio validation failed: ${validation.errors.join(" ")}`);
    const credential = await this.credentials.resolve(request.credentialSource);
    if (credential === undefined) throw new DestinationPublicationValidationError(`Credential source ${request.credentialSource} is unavailable.`);
    const publication = await this.publisher.publish(request, credential);
    await this.ledger.save(request.idempotencyKey, fingerprint, publication);
    return Object.freeze({ publication, reused: false });
  }
}
