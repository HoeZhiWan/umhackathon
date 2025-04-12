"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import Image from 'next/image';

interface MenuItemWindowProps {
  itemName: string;
  cuisineTag: string;
  description?: string;
  imageUrl?: string; // Changed from imageData to imageUrl
  imageData?: string | null; // Keep for backward compatibility
}

export default function MenuItemWindow({ 
  itemName, 
  cuisineTag, 
  description, 
  imageUrl,
  imageData // Keep for backward compatibility
}: MenuItemWindowProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAddItem = () => {
    setIsSubmitting(true);
    
    // Simulate API call/processing with timeout
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Reset success state after animation completes
      setTimeout(() => {
        setIsSuccess(false);
      }, 3000);
    }, 1500);
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-md font-medium">Add New Menu Item</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 h-[calc(100%-3rem)] overflow-auto">
        {isSuccess ? (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <svg 
                  className="w-8 h-8 text-green-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                    className="animate-draw-check"
                    style={{
                      strokeDasharray: 65,
                      strokeDashoffset: 0,
                      animation: 'drawCheck 1s ease-in-out forwards'
                    }}
                  />
                </svg>
              </div>
              <p className="text-lg font-medium text-green-600">Menu Item Added!</p>
              <div className="text-sm text-gray-500">
                {itemName} has been added to your menu
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Item Preview */}
            <div className="bg-muted rounded-lg p-4">
              <div className="font-semibold text-lg mb-1">{itemName}</div>
              <div className="text-xs bg-secondary px-2 py-1 rounded-full inline-block mb-3">
                {cuisineTag}
              </div>
              
              {/* Priority: use imageUrl if available, fall back to imageData for backward compatibility */}
              {imageUrl ? (
                <div className="relative w-full h-48 mb-4 overflow-hidden rounded-lg">
                  <img
                    src={imageUrl}
                    alt={itemName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : imageData ? (
                <div className="relative w-full h-48 mb-4 overflow-hidden rounded-lg">
                  <img
                    src={`data:image/png;base64,${imageData}`}
                    alt={itemName}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-12 h-12 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008v-.008z" />
                  </svg>
                </div>
              )}

              <div className="text-sm">
                {description || "No description provided."}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input 
                  type="text" 
                  placeholder="$0.00" 
                  className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Availability</label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input type="radio" name="availability" value="available" defaultChecked className="mr-1" />
                    <span className="text-sm">Available</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="availability" value="seasonal" className="mr-1" />
                    <span className="text-sm">Seasonal</span>
                  </label>
                </div>
              </div>

              <div className="pt-4">
                <button
                  className={`w-full py-2 rounded-md ${isSubmitting ? 'bg-gray-400' : 'bg-primary hover:bg-primary/90'} text-white font-medium`}
                  onClick={handleAddItem}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : 'Add to Menu'}
                </button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}