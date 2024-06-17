import { FC } from 'react';

enum Level {
    info = 1,
    error = 2,
}

interface AlertProps {
    text: string;
    show: boolean;
    closeAlert: Function;
    level: Level;
}

const Alert: FC<AlertProps> = ({ text, show, closeAlert, level = Level.info }) => {
    let textStyle = 'text-green-800 bg-green-50 dark:bg-gray-800 dark:text-green-400';
    let buttonStyle =
        'bg-green-50 text-green-500 focus:ring-green-400 hover:bg-green-200 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-gray-700';
    if (level === Level.error) {
        textStyle = 'text-red-800 bg-red-50 dark:bg-gray-800 dark:text-red-400';
        buttonStyle =
            'bg-red-50 text-red-500 focus:ring-red-400 hover:bg-red-200 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700';
    }
    if (show)
        return (
            <div className={`flex items-center p-4 mb-4 rounded-lg ${textStyle}`} role="alert">
                <span className="sr-only">Info</span>
                <div className="ms-3 text-sm font-medium">{text}</div>
                <button
                    type="button"
                    className={`ms-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 inline-flex items-center justify-center h-8 w-8 ${buttonStyle}`}
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
