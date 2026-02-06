export default function throwError(error, message = 'Une erreur est survenue') {
    throw new Error(
        `${message} : ${error instanceof Error ? error.message : error}`,
    );
}
