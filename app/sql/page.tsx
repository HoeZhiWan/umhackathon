"use client";

import { useState } from "react";
import { supabase } from "../actions/sql";
import { topSellingItemsWeek, topSellingItemsMonth } from "../actions/sql"

export default function SqlPage() {
    const [weeklyItems, setWeeklyItems] = useState<Array<{ name: string; count: number }> | null>(null);
    const [monthlyItems, setMonthlyItems] = useState<Array<{ name: string; count: number }> | null>(null);
    const [isWeeklyLoading, setIsWeeklyLoading] = useState(false);
    const [isMonthlyLoading, setIsMonthlyLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // Using the same merchant ID for consistency in testing
    const merchantId = '5b8d2';

    const fetchWeeklyItems = async () => {
        setIsWeeklyLoading(true);
        setError(null);
        try {
            const result = await topSellingItemsWeek(merchantId);
            console.log('Weekly results:', result);
            if (result.error) {
                setError(`Error fetching weekly items: ${result.error.message}`);
            } else {
                setWeeklyItems(result.topSellingItems);
            }
        } catch (err) {
            console.error('Error in weekly items fetch:', err);
            setError(`Unexpected error: ${(err as Error).message}`);
        } finally {
            setIsWeeklyLoading(false);
        }
    };

    const fetchMonthlyItems = async () => {
        setIsMonthlyLoading(true);
        setError(null);
        try {
            const result = await topSellingItemsMonth(merchantId);
            console.log('Monthly results:', result);
            if (result.error) {
                setError(`Error fetching monthly items: ${result.error.message}`);
            } else {
                setMonthlyItems(result.topSellingItems);
            }
        } catch (err) {
            console.error('Error in monthly items fetch:', err);
            setError(`Unexpected error: ${(err as Error).message}`);
        } finally {
            setIsMonthlyLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">SQL Testing Page</h1>
            <p className="mb-4">Testing merchant ID: <code className="bg-gray-100 px-2 py-1 rounded">{merchantId}</code></p>
            
            <div className="flex gap-4 mb-8">
                <button 
                    onClick={fetchWeeklyItems}
                    disabled={isWeeklyLoading} 
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 disabled:opacity-50"
                >
                    {isWeeklyLoading ? 'Loading...' : 'Top Selling Items in The Week'}
                </button>

                <button 
                    onClick={fetchMonthlyItems}
                    disabled={isMonthlyLoading}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-opacity-75 disabled:opacity-50"
                >
                    {isMonthlyLoading ? 'Loading...' : 'Top Selling Items in The Month'}
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Weekly Results */}
                <div className="bg-gray-50 p-4 rounded shadow">
                    <h2 className="text-lg font-semibold mb-3">Weekly Top Items</h2>
                    {weeklyItems ? (
                        weeklyItems.length > 0 ? (
                            <ul className="space-y-2">
                                {weeklyItems.map((item, index) => (
                                    <li key={`weekly-${index}`} className="flex justify-between items-center border-b pb-2">
                                        <span>{item.name}</span>
                                        <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded-full">
                                            Sold: {item.count}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">No items found for this period</p>
                        )
                    ) : (
                        <p className="text-gray-500">Click the button to load data</p>
                    )}
                </div>

                {/* Monthly Results */}
                <div className="bg-gray-50 p-4 rounded shadow">
                    <h2 className="text-lg font-semibold mb-3">Monthly Top Items</h2>
                    {monthlyItems ? (
                        monthlyItems.length > 0 ? (
                            <ul className="space-y-2">
                                {monthlyItems.map((item, index) => (
                                    <li key={`monthly-${index}`} className="flex justify-between items-center border-b pb-2">
                                        <span>{item.name}</span>
                                        <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
                                            Sold: {item.count}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500">No items found for this period</p>
                        )
                    ) : (
                        <p className="text-gray-500">Click the button to load data</p>
                    )}
                </div>
            </div>
        </div>
    );
}