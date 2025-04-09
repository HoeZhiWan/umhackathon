"use client";

import { getHighestOrderValue } from "../actions/sql"

export default function sqlPage() {
    return (
        <> 
            <button 
                onClick={() => getHighestOrderValue()} 
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
            >
                Get Highest Order
            </button>
        </>
    );
}