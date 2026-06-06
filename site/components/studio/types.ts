// Shared types for the studio. Keeping them in one tiny module so any
// component change doesn't force the others to re-typecheck.

export type StudioIconMeta = {
  name: string;
  displayName: string;
  pascal: string;
  motion: string | null;
};
