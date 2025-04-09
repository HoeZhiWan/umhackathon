"use client";

import { supabase } from "../actions/sql";

import { getHighestOrderValue } from "../actions/sql"

export default function sqlPage() {
    return (
        <> 
            <button 
                onClick={async () => {
                    const { data, error } = await supabase
                      .from('transaction_data')
                      .select('order_value, order_id')
                      .order('order_value', { ascending: false })
                      .limit(1);
                    
                    if (error) {
                      console.error('Error fetching data:', error);
                    } else {
                      console.log(data?.[0] || 'No results found');
                    }
                }} 
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
            >
                Get Highest Order
            </button>
        </>
    );
}