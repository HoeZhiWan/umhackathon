"use client";

import { supabase } from "../actions/sql";

import { topSellingItemsWeek } from "../actions/sql"
import { topSellingItemsMonth } from "../actions/sql"

export default function sqlPage() {
    return (
        <> 
            <button 
                onClick={() => topSellingItemsWeek()} 
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
            >
                Top Selling Items in The Week
            </button>

            <button 
                onClick={async () => {
                    const result = await topSellingItemsMonth('5b8d2');
                    console.log(result);
                }}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-opacity-75 cursor-pointer"
            >
                Top Selling Items in The Month
            </button>
        </>
    );
}