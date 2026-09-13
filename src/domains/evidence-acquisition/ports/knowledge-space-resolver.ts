export interface KnowledgeSpaceResolver {
  exists(profileId: string): Promise<boolean>;
}
