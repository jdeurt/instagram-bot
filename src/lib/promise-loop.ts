export async function waitFor(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * A promise loop that can be canceled by returning true in the callback async function.
 */
export async function promiseLoop(intervalMS: number, func: Function): Promise<void> {
    const endLoop = await func();

    if (endLoop) return;

    await waitFor(intervalMS);

    await promiseLoop(intervalMS, func);
}
