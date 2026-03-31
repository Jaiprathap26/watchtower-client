export function MonitorCardSkeleton() {
    return (
        <div className="p-4 sm:p-5 lg:p-6 bg-white rounded-lg border border-gray-200">
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-1">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-gray-200 animate-pulse" />
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-32" />
                </div>
            </div>
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse flex-1" />
            </div>
            <div className="flex items-center justify-between">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-12" />
            </div>
        </div>
    );
}

export function StatCardSkeleton() {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
            </div>
            <div className="h-8 bg-gray-200 rounded animate-pulse w-20" />
        </div>
    );
}

export function TableRowSkeleton() {
    return (
        <tr>
            <td className="py-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
            </td>
            <td className="py-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
            </td>
            <td className="py-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
            </td>
            <td className="py-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
            </td>
        </tr>
    );
}

export function ChartSkeleton() {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mb-4" />
            <div className="h-[300px] bg-gray-100 rounded animate-pulse" />
        </div>
    );
}