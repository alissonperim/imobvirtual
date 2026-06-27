-- CreateIndex
CREATE INDEX "properties_ownerId_idx" ON "properties"("ownerId");

-- CreateIndex
CREATE INDEX "properties_status_idx" ON "properties"("status");

-- CreateIndex
CREATE INDEX "properties_deletedAt_createdAt_idx" ON "properties"("deletedAt", "createdAt");

-- CreateIndex
CREATE INDEX "properties_ownerId_status_deletedAt_idx" ON "properties"("ownerId", "status", "deletedAt");
