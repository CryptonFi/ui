import { FC } from 'react';

interface ProgressProps {
    procent: number;
    style?: string;
}

const Progress: FC<ProgressProps> = ({ procent, style }) => {
    return (
        <div className={`flex flex-row items-center mt-2 ${style}`}>
            <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div className="bg-blue-400 h-1.5 rounded-full" style={{ width: `${procent}%` }}></div>
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-white">{Math.floor(procent)}%</span>
        </div>
    );
};

export default Progress;
