'use strict';

// Passenger and other launchers sometimes `require()` the entry file.
// This wrapper ensures the ESM build produced by @sveltejs/adapter-node
// is loaded correctly via dynamic import.
(async () => {
  try {
    await import('./build/index.js');
  } catch (error) {
    console.error('Failed to start SvelteKit server from build/index.js:', error);
    process.exit(1);
  }
})();
