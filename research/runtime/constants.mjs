/**
 * Leaf-level shared constants for the research runtime.
 *
 * This module must stay a leaf: it imports nothing, so any runtime module can
 * consume these names without closing an import cycle. event-log.mjs and
 * evidence-store.mjs both need MANIFEST_FILENAME; before this module existed,
 * one of them had to duplicate the literal to keep the dependency direction
 * one-way (evidence-store imports event-log for chain verification).
 */

/** Reserved manifest filename whose presence freezes a run directory. */
export const MANIFEST_FILENAME = "MANIFEST.sha256";
