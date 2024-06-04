import { FC } from 'react';
import { isRouteErrorResponse, useRouteError } from 'react-router';

const Error: FC = ({}) => {
    const error = useRouteError() as Error;
    let errorMessage: string;

    if (isRouteErrorResponse(error)) {
        errorMessage = error.data.message || error.statusText;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error === 'string') {
        errorMessage = error;
    } else {
        console.error(error);
        errorMessage = 'Unknown error';
    }

    return (
        <div id="error-page" className="flex flex-col gap-8 justify-center items-center h-screen">
            <h1 className="text-4xl font-bold">Oops!</h1>
            <p>An unexpected error has occurred.</p>
            <p className="text-slate-400">
                <i>{errorMessage}</i>
            </p>
        </div>
    );
};

export default Error;
