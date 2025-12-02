// Manual type definitions for Deno to satisfy the IDE
// This is needed because the Deno extension might not be active or configured correctly

declare namespace Deno {
    export interface Env {
        get(key: string): string | undefined;
    }
    export const env: Env;
    export function serve(handler: (req: Request) => Promise<Response> | Response): void;
}
