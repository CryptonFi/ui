import { FC } from 'react';

interface AlertProps {
    text: string;
    show: boolean;
    closeAlert: Function;
}

const Alert: FC<AlertProps> = ({ text, show, closeAlert }) => {
    if (show)
        return (
            <div
                className="flex items-center p-4 mb-4 text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400"
                role="alert"
            >
                <span className="sr-only">Info</span>
                <div className="ms-3 text-sm font-medium">{text}</div>
                <button
                    type="button"
                    className="ms-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700"
                    aria-label="Close"
                    onClick={() => closeAlert()}
                >
                    <span className="sr-only">Close</span>
                    <svg
                        className="w-3 h-3"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 14"
                    >
                        <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                        />
                    </svg>
                </button>
            </div>
        );
    else return <></>;
};

export default Alert;
